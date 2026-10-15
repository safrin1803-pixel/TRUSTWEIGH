from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.bilstm_trust_model import bilstm_evaluator
from backend.database import (
    DEVICES_DB, TRUST_HISTORY_DB, ALERTS_DB, get_current_date_time, SETTINGS
)

router = APIRouter(prefix="/api/wokwi", tags=["Wokwi ESP32 Bridge"])

class WokwiTelemetryInput(BaseModel):
    edge_id: Optional[str] = "WEIGH-ESP32-01"
    sensor_id: Optional[str] = "HX711-LC01"
    ip_address: Optional[str] = "192.168.1.101"
    hop_level: Optional[int] = 1
    actual_weight: float
    displayed_weight: float
    mode: Optional[str] = "NORMAL"  # NORMAL | ALTERNATE
    tamper_locked: Optional[bool] = False
    rtc_time: Optional[str] = "12:00:00"

class WokwiTriggerRequest(BaseModel):
    action: str  # toggle_alternate | trigger_lock | set_weight | reset_normal
    weight: Optional[float] = 5.00

# Persistent state of the live connected Wokwi ESP32 node
LIVE_WOKWI_STATE: Dict[str, Any] = {
    "edge_id": "WEIGH-ESP32-01",
    "sensor_id": "HX711-LC01",
    "ip_address": "192.168.1.101",
    "hop_level": "Hop 1 (Direct Gateway)",
    "actual_weight": 5.00,
    "displayed_weight": 5.00,
    "mode": "NORMAL",
    "tamper_locked": False,
    "direct_trust": 0.96,
    "indirect_trust": 0.93,
    "bilstm_score": 0.95,
    "overall_trust_score": 0.95,
    "trust_class": "TRUSTED",
    "trust_level": "Level 1 (High Assurance)",
    "attack_risk": "Low (3.5%)",
    "attack_risk_pct": 3.5,
    "comm_state": "ALLOWED",
    "is_blocked": False,
    "last_updated_time": "12:00:00 PM",
    "last_updated_date": "21-Aug-2026"
}

def register_or_sync_wokwi_device(eval_result: Dict[str, Any]):
    """Syncs evaluated Wokwi ESP32 state into main DEVICES_DB and TRUST_HISTORY_DB."""
    cur_date, cur_time, _ = get_current_date_time()
    edge_id = eval_result["edge_id"]

    device_entry = {
        "device_id": edge_id,
        "sensor_id": eval_result["sensor_id"],
        "ip_address": eval_result["ip_address"],
        "mac_address": "24:6F:28:B4:7A:38",
        "location": "Wokwi Live Edge Node (Scale #1)",
        "device_type": "ESP32 + HX711 Digital Metrology Instrument",
        "registration_date": cur_date,
        "registration_time": "09:00:00 AM",
        "last_evaluated_date": cur_date,
        "last_evaluated_time": cur_time,
        "direct_trust": eval_result["direct_trust"],
        "indirect_trust": eval_result["indirect_trust"],
        "behaviour_score": eval_result["bilstm_score"],
        "dynamic_trust_score": eval_result["overall_trust_score"],
        "trust_status": eval_result["trust_class"],
        "is_blocked": eval_result["is_blocked"],
        "blocked_reason": "AUTOMATED TAMPERING LOCKOUT: Load cell signal altered (+20% Yellow Button) or Red Button Lock" if eval_result["is_blocked"] else None,
        "blocked_at": f"{cur_date} {cur_time}" if eval_result["is_blocked"] else None,
        "unblocked_at": None,
        "unblocked_by": None
    }
    DEVICES_DB[edge_id] = device_entry

    # Add history point
    TRUST_HISTORY_DB.setdefault(edge_id, []).append({
        "timestamp": f"2026-08-21T{cur_time}",
        "date": cur_date,
        "time": cur_time,
        "dynamic_trust_score": eval_result["overall_trust_score"],
        "direct_trust": eval_result["direct_trust"],
        "indirect_trust": eval_result["indirect_trust"],
        "behaviour_score": eval_result["bilstm_score"],
        "status": eval_result["trust_class"],
        "is_blocked": eval_result["is_blocked"],
        "note": f"Wokwi Telemetry: Actual={eval_result['actual_weight']}kg, Disp={eval_result['displayed_weight']}kg ({eval_result['mode']})"
    })

    # Raise alert if tampered
    if eval_result["is_blocked"] and eval_result["trust_class"] == "TAMPERED":
        alert_id = f"ALT-WOKWI-{len(ALERTS_DB)+950}"
        if not any(a["device_id"] == edge_id and a["status"] == "ACTIVE" for a in ALERTS_DB):
            ALERTS_DB.insert(0, {
                "alert_id": alert_id,
                "device_id": edge_id,
                "sensor_id": eval_result["sensor_id"],
                "alert_type": "Tampering Detected" if eval_result["mode"] == "ALTERNATE" else "Emergency Lockout",
                "severity": "CRITICAL",
                "trust_score": eval_result["overall_trust_score"],
                "reason": "Automated security quarantine: Weight altered by +20% or machine lock triggered on ESP32.",
                "date": cur_date,
                "time": cur_time,
                "status": "ACTIVE",
                "acknowledged_at": None,
                "acknowledged_by": None
            })

@router.post("/telemetry")
def ingest_wokwi_telemetry(payload: WokwiTelemetryInput):
    """
    Ingests live telemetry packet directly from Wokwi ESP32,
    runs BiLSTM trust evaluation, and updates live dashboard data.
    """
    cur_date, cur_time, _ = get_current_date_time()
    eval_result = bilstm_evaluator.evaluate_packet(payload.model_dump())
    
    global LIVE_WOKWI_STATE
    LIVE_WOKWI_STATE.update(eval_result)
    LIVE_WOKWI_STATE["last_updated_time"] = cur_time
    LIVE_WOKWI_STATE["last_updated_date"] = cur_date

    # Sync into global registry
    register_or_sync_wokwi_device(eval_result)

    return {
        "status": "SUCCESS",
        "message": "Wokwi telemetry evaluated by BiLSTM Trust Engine",
        "evaluation": eval_result
    }

@router.get("/live")
def get_live_wokwi_state():
    """Returns the current evaluated state of the Wokwi ESP32 node with all 9 required outputs."""
    cur_date, cur_time, _ = get_current_date_time()
    return {
        **LIVE_WOKWI_STATE,
        "current_date": cur_date,
        "current_time": cur_time
    }

@router.post("/trigger-mode")
def trigger_wokwi_action(payload: WokwiTriggerRequest):
    """
    Interactive Simulation Controller:
    Simulates pressing Wokwi Yellow Button (+20% Alter) or Red Button (Machine Lock)
    and immediately feeds it into the BiLSTM trust pipeline.
    """
    global LIVE_WOKWI_STATE
    current_weight = payload.weight if payload.weight is not None else LIVE_WOKWI_STATE.get("actual_weight", 5.00)

    if payload.action == "toggle_alternate":
        is_alt = LIVE_WOKWI_STATE.get("mode") != "ALTERNATE"
        new_mode = "ALTERNATE" if is_alt else "NORMAL"
        disp_weight = current_weight * 1.20 if is_alt else current_weight
        tamper_locked = False
    elif payload.action == "trigger_lock":
        new_mode = "LOCKED"
        disp_weight = current_weight
        tamper_locked = True
    elif payload.action == "reset_normal":
        new_mode = "NORMAL"
        disp_weight = current_weight
        tamper_locked = False
    else:
        new_mode = LIVE_WOKWI_STATE.get("mode", "NORMAL")
        disp_weight = current_weight * 1.20 if new_mode == "ALTERNATE" else current_weight
        tamper_locked = LIVE_WOKWI_STATE.get("tamper_locked", False)

    # Ingest into BiLSTM
    telemetry_input = {
        "edge_id": "WEIGH-ESP32-01",
        "sensor_id": "HX711-LC01",
        "ip_address": "192.168.1.101",
        "hop_level": 1,
        "actual_weight": current_weight,
        "displayed_weight": disp_weight,
        "mode": new_mode,
        "tamper_locked": tamper_locked,
        "rtc_time": get_current_date_time()[1]
    }

    eval_result = bilstm_evaluator.evaluate_packet(telemetry_input)
    cur_date, cur_time, _ = get_current_date_time()
    
    LIVE_WOKWI_STATE.update(eval_result)
    LIVE_WOKWI_STATE["last_updated_time"] = cur_time
    LIVE_WOKWI_STATE["last_updated_date"] = cur_date

    register_or_sync_wokwi_device(eval_result)

    return {
        "action": payload.action,
        "message": f"Wokwi mode transitioned to {new_mode}",
        "live_state": LIVE_WOKWI_STATE
    }

# Initialize live state on startup
register_or_sync_wokwi_device(LIVE_WOKWI_STATE)
