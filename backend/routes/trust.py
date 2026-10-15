from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from backend.models import TrustEvaluation, TrustHistoryPoint
from backend.database import (
    DEVICES_DB, TRUST_HISTORY_DB, ALERTS_DB, get_current_date_time, compute_trust_status, SETTINGS
)

router = APIRouter(prefix="/api/trust", tags=["Trust Evaluation"])

class TrustEvaluateRequest(BaseModel):
    device_id: str
    direct_trust: float
    indirect_trust: float
    behaviour_score: float
    note: Optional[str] = None

@router.get("/overview", response_model=List[TrustEvaluation])
def get_trust_overview():
    """Get the dedicated Trust Evaluation matrix for all instruments."""
    overview = []
    for dev in DEVICES_DB.values():
        overview.append(TrustEvaluation(
            device_id=dev["device_id"],
            sensor_id=dev["sensor_id"],
            direct_trust=dev["direct_trust"],
            indirect_trust=dev["indirect_trust"],
            behaviour_score=dev["behaviour_score"],
            dynamic_trust_score=dev["dynamic_trust_score"],
            trust_status=dev["trust_status"],
            is_blocked=dev.get("is_blocked", False),
            evaluation_date=dev["last_evaluated_date"],
            evaluation_time=dev["last_evaluated_time"]
        ))
    return overview

@router.get("/history/{device_id}", response_model=List[TrustHistoryPoint])
def get_device_trust_history(device_id: str):
    """Fetch timeseries trust history points for dynamic graph visualization."""
    if device_id not in DEVICES_DB:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return TRUST_HISTORY_DB.get(device_id, [])

@router.post("/evaluate")
def ingest_trust_evaluation(payload: TrustEvaluateRequest):
    """
    Pluggable Endpoint: Future ML/BiLSTM or Trust model sends real-time evaluation values here.
    If TAMPERED is detected, the device is AUTOMATICALLY BLOCKED & QUARANTINED!
    """
    dev = DEVICES_DB.get(payload.device_id)
    if not dev:
        raise HTTPException(status_code=404, detail=f"Device {payload.device_id} not found")
    
    cur_date, cur_time, _ = get_current_date_time()
    
    # Compute dynamic composite trust score based on weights
    dynamic_score = round(
        (payload.direct_trust * SETTINGS.alpha_direct_weight) +
        (payload.indirect_trust * SETTINGS.beta_indirect_weight) +
        (payload.behaviour_score * SETTINGS.gamma_behaviour_weight),
        2
    )
    new_status = compute_trust_status(dynamic_score, SETTINGS)
    
    # Check if tampering detected -> AUTO BLOCK
    is_now_blocked = dev.get("is_blocked", False)
    blocked_reason_str = dev.get("blocked_reason")
    blocked_at_str = dev.get("blocked_at")

    if new_status == "TAMPERED":
        is_now_blocked = True
        blocked_reason_str = payload.note or "AUTOMATED TAMPERING QUARANTINE: Dynamic trust dropped below threshold (<0.50). Instrument locked."
        blocked_at_str = f"{cur_date} {cur_time}"

    # Update device record
    dev["direct_trust"] = payload.direct_trust
    dev["indirect_trust"] = payload.indirect_trust
    dev["behaviour_score"] = payload.behaviour_score
    dev["dynamic_trust_score"] = dynamic_score
    dev["trust_status"] = new_status
    dev["is_blocked"] = is_now_blocked
    dev["blocked_reason"] = blocked_reason_str
    dev["blocked_at"] = blocked_at_str
    dev["last_evaluated_date"] = cur_date
    dev["last_evaluated_time"] = cur_time
    
    # Append history point
    history_point = {
        "timestamp": f"2026-08-21T{cur_time}",
        "date": cur_date,
        "time": cur_time,
        "dynamic_trust_score": dynamic_score,
        "direct_trust": payload.direct_trust,
        "indirect_trust": payload.indirect_trust,
        "behaviour_score": payload.behaviour_score,
        "status": new_status,
        "is_blocked": is_now_blocked,
        "note": payload.note or (f"🚨 AUTOMATICALLY BLOCKED & QUARANTINED ({new_status})" if is_now_blocked else f"Updated ({new_status})")
    }
    TRUST_HISTORY_DB.setdefault(payload.device_id, []).append(history_point)
    
    # Automatically generate alert if tampered or dropped to suspicious
    if new_status == "TAMPERED":
        alert_id = f"ALT-2026-{len(ALERTS_DB)+900}"
        ALERTS_DB.insert(0, {
            "alert_id": alert_id,
            "device_id": dev["device_id"],
            "sensor_id": dev["sensor_id"],
            "alert_type": "Tampering Detected",
            "severity": "CRITICAL",
            "trust_score": dynamic_score,
            "reason": blocked_reason_str,
            "date": cur_date,
            "time": cur_time,
            "status": "ACTIVE",
            "acknowledged_at": None,
            "acknowledged_by": None
        })
    elif new_status == "SUSPICIOUS":
        alert_id = f"ALT-2026-{len(ALERTS_DB)+900}"
        ALERTS_DB.insert(0, {
            "alert_id": alert_id,
            "device_id": dev["device_id"],
            "sensor_id": dev["sensor_id"],
            "alert_type": "Suspicious Device",
            "severity": "WARNING",
            "trust_score": dynamic_score,
            "reason": payload.note or "Trust score entered suspicious zone (0.50 - 0.79).",
            "date": cur_date,
            "time": cur_time,
            "status": "ACTIVE",
            "acknowledged_at": None,
            "acknowledged_by": None
        })
        
    return {
        "message": "Trust evaluation successfully processed" + (" - DEVICE AUTOMATICALLY BLOCKED" if is_now_blocked else ""),
        "device_id": dev["device_id"],
        "dynamic_trust_score": dynamic_score,
        "trust_status": new_status,
        "is_blocked": is_now_blocked,
        "evaluation_date": cur_date,
        "evaluation_time": cur_time
    }
