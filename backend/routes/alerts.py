from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models import Alert, AlertCreate, AlertAcknowledge
from backend.database import ALERTS_DB, DEVICES_DB, get_current_date_time

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[Alert])
def list_alerts(
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, ACKNOWLEDGED"),
    severity: Optional[str] = Query(None, description="Filter by severity: WARNING, HIGH, CRITICAL"),
    device_id: Optional[str] = Query(None, description="Filter by device ID")
):
    """List alerts with optional filtering."""
    results = ALERTS_DB
    if status:
        results = [a for a in results if a["status"].upper() == status.upper()]
    if severity:
        results = [a for a in results if a["severity"].upper() == severity.upper()]
    if device_id:
        results = [a for a in results if a["device_id"] == device_id]
    return results

@router.get("/active", response_model=List[Alert])
def get_active_alerts():
    """Fetch only active unacknowledged alerts for real-time alert panel and notification badge."""
    return [a for a in ALERTS_DB if a["status"] == "ACTIVE"]

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, payload: AlertAcknowledge = AlertAcknowledge()):
    """Acknowledge an alert with officer audit signature."""
    for alert in ALERTS_DB:
        if alert["alert_id"] == alert_id:
            cur_date, cur_time, _ = get_current_date_time()
            alert["status"] = "ACKNOWLEDGED"
            alert["acknowledged_at"] = f"{cur_date} {cur_time}"
            alert["acknowledged_by"] = payload.officer_name or "Legal Metrology Officer"
            return {
                "message": f"Alert {alert_id} acknowledged successfully",
                "alert": alert
            }
    raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

@router.post("", response_model=Alert, status_code=201)
def create_alert(payload: AlertCreate):
    """Create a new alert record."""
    cur_date, cur_time, _ = get_current_date_time()
    sensor_id = "UNKNOWN"
    if payload.device_id in DEVICES_DB:
        sensor_id = DEVICES_DB[payload.device_id]["sensor_id"]
        
    alert_id = f"ALT-2026-{len(ALERTS_DB)+910}"
    new_alert = {
        "alert_id": alert_id,
        "device_id": payload.device_id,
        "sensor_id": sensor_id,
        "alert_type": payload.alert_type,
        "severity": payload.severity,
        "trust_score": payload.trust_score,
        "reason": payload.reason,
        "date": cur_date,
        "time": cur_time,
        "status": "ACTIVE",
        "acknowledged_at": None,
        "acknowledged_by": None
    }
    ALERTS_DB.insert(0, new_alert)
    return new_alert
