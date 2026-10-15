from fastapi import APIRouter, HTTPException
from typing import List
from backend.models import Device, DeviceCreate, DeviceBlockRequest, DeviceUnblockRequest
from backend.database import (
    DEVICES_DB, TRUST_HISTORY_DB, ALERTS_DB, get_current_date_time, compute_trust_status, SETTINGS
)

router = APIRouter(prefix="/api/devices", tags=["Devices"])

@router.get("", response_model=List[Device])
def list_devices():
    """List all registered weighing and measuring instruments with their current trust metrics and block statuses."""
    return list(DEVICES_DB.values())

@router.get("/{device_id}")
def get_device_details(device_id: str):
    """Get full device dossier including hardware specs, trust evaluation breakdown, trust history, and alert logs."""
    device = DEVICES_DB.get(device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    
    history = TRUST_HISTORY_DB.get(device_id, [])
    device_alerts = [a for a in ALERTS_DB if a["device_id"] == device_id]
    
    return {
        "device": device,
        "trust_history": history,
        "alerts": device_alerts,
        "thresholds": SETTINGS
    }

@router.post("", response_model=Device, status_code=201)
def register_device(payload: DeviceCreate):
    """Register a new weighing instrument. Automatically records local registration date and time."""
    if payload.device_id in DEVICES_DB:
        raise HTTPException(status_code=400, detail=f"Device with ID {payload.device_id} already registered")
    
    cur_date, cur_time, _ = get_current_date_time()
    
    initial_direct = 0.95
    initial_indirect = 0.92
    initial_bilstm = 0.94
    dynamic_score = round(
        (initial_direct * SETTINGS.alpha_direct_weight) +
        (initial_indirect * SETTINGS.beta_indirect_weight) +
        (initial_bilstm * SETTINGS.gamma_behaviour_weight),
        2
    )
    status = compute_trust_status(dynamic_score, SETTINGS)

    new_device = {
        "device_id": payload.device_id,
        "sensor_id": payload.sensor_id,
        "ip_address": payload.ip_address,
        "mac_address": payload.mac_address,
        "location": payload.location,
        "device_type": payload.device_type,
        "registration_date": cur_date,
        "registration_time": cur_time,
        "last_evaluated_date": cur_date,
        "last_evaluated_time": cur_time,
        "direct_trust": initial_direct,
        "indirect_trust": initial_indirect,
        "behaviour_score": initial_bilstm,
        "dynamic_trust_score": dynamic_score,
        "trust_status": status,
        "is_blocked": False,
        "blocked_reason": None,
        "blocked_at": None,
        "unblocked_at": None,
        "unblocked_by": None
    }
    
    DEVICES_DB[payload.device_id] = new_device
    
    TRUST_HISTORY_DB[payload.device_id] = [{
        "timestamp": f"2026-08-21T{cur_time}",
        "date": cur_date,
        "time": cur_time,
        "dynamic_trust_score": dynamic_score,
        "direct_trust": initial_direct,
        "indirect_trust": initial_indirect,
        "behaviour_score": initial_bilstm,
        "status": status,
        "is_blocked": False,
        "note": "Initial Registration & Baseline Metrology Calibration"
    }]
    
    return new_device

@router.post("/{device_id}/block")
def block_device(device_id: str, payload: DeviceBlockRequest = DeviceBlockRequest()):
    """Admin endpoint to manually block/quarantine an instrument."""
    dev = DEVICES_DB.get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    
    cur_date, cur_time, _ = get_current_date_time()
    reason_str = payload.reason or f"Quarantined by {payload.admin_name}"
    
    dev["is_blocked"] = True
    dev["blocked_reason"] = reason_str
    dev["blocked_at"] = f"{cur_date} {cur_time}"
    dev["unblocked_at"] = None
    dev["unblocked_by"] = None
    
    # Record history
    TRUST_HISTORY_DB.setdefault(device_id, []).append({
        "timestamp": f"2026-08-21T{cur_time}",
        "date": cur_date,
        "time": cur_time,
        "dynamic_trust_score": dev["dynamic_trust_score"],
        "direct_trust": dev["direct_trust"],
        "indirect_trust": dev["indirect_trust"],
        "behaviour_score": dev["behaviour_score"],
        "status": dev["trust_status"],
        "is_blocked": True,
        "note": f"🔒 Instrument Blocked: {reason_str}"
    })
    
    return {
        "message": f"Device {device_id} has been blocked and quarantined.",
        "device": dev
    }

@router.post("/{device_id}/unblock")
def unblock_device(device_id: str, payload: DeviceUnblockRequest = DeviceUnblockRequest()):
    """Admin-only endpoint to unblock, verify calibration seal, and re-enable an instrument."""
    dev = DEVICES_DB.get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    
    cur_date, cur_time, _ = get_current_date_time()
    
    # Restore trust score if provided
    restored_score = payload.restore_trust_score or 0.95
    dev["direct_trust"] = restored_score
    dev["indirect_trust"] = min(1.0, restored_score + 0.01)
    dev["behaviour_score"] = restored_score
    dev["dynamic_trust_score"] = restored_score
    dev["trust_status"] = compute_trust_status(restored_score, SETTINGS)
    
    dev["is_blocked"] = False
    dev["blocked_reason"] = None
    dev["unblocked_at"] = f"{cur_date} {cur_time}"
    dev["unblocked_by"] = f"{payload.admin_name} (Seal #{payload.calibration_seal_no})"
    dev["last_evaluated_date"] = cur_date
    dev["last_evaluated_time"] = cur_time
    
    # Append history record
    TRUST_HISTORY_DB.setdefault(device_id, []).append({
        "timestamp": f"2026-08-21T{cur_time}",
        "date": cur_date,
        "time": cur_time,
        "dynamic_trust_score": restored_score,
        "direct_trust": dev["direct_trust"],
        "indirect_trust": dev["indirect_trust"],
        "behaviour_score": dev["behaviour_score"],
        "status": dev["trust_status"],
        "is_blocked": False,
        "note": f"🔓 UNBLOCKED & RE-CERTIFIED by {payload.admin_name} (Seal: {payload.calibration_seal_no}). {payload.reason}"
    })
    
    # Acknowledge associated active alerts for this device
    for alert in ALERTS_DB:
        if alert["device_id"] == device_id and alert["status"] == "ACTIVE":
            alert["status"] = "ACKNOWLEDGED"
            alert["acknowledged_at"] = f"{cur_date} {cur_time}"
            alert["acknowledged_by"] = f"Admin Unblock ({payload.admin_name})"

    return {
        "message": f"Device {device_id} successfully unblocked and re-certified for legal trade operations.",
        "device": dev
    }

@router.delete("/{device_id}")
def delete_device(device_id: str):
    """De-register a weighing instrument."""
    if device_id not in DEVICES_DB:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    
    del DEVICES_DB[device_id]
    if device_id in TRUST_HISTORY_DB:
        del TRUST_HISTORY_DB[device_id]
    
    return {"message": f"Device {device_id} successfully de-registered."}
