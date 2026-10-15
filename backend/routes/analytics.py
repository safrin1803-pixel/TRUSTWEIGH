from fastapi import APIRouter
from backend.database import DEVICES_DB, ALERTS_DB, SETTINGS

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary")
def get_analytics_summary():
    """Returns aggregated analytics data including blocked quarantine stats."""
    devices = list(DEVICES_DB.values())
    total_devices = len(devices)
    
    trusted_count = sum(1 for d in devices if d["trust_status"] == "TRUSTED")
    suspicious_count = sum(1 for d in devices if d["trust_status"] == "SUSPICIOUS")
    tampered_count = sum(1 for d in devices if d["trust_status"] == "TAMPERED")
    blocked_count = sum(1 for d in devices if d.get("is_blocked", False))
    
    avg_trust = round(sum(d["dynamic_trust_score"] for d in devices) / max(1, total_devices), 3) if total_devices else 0.0
    avg_direct = round(sum(d["direct_trust"] for d in devices) / max(1, total_devices), 3) if total_devices else 0.0
    avg_indirect = round(sum(d["indirect_trust"] for d in devices) / max(1, total_devices), 3) if total_devices else 0.0
    avg_bilstm = round(sum(d["behaviour_score"] for d in devices) / max(1, total_devices), 3) if total_devices else 0.0
    
    # Trust Score Distribution bins
    dist = {
        "0.00 - 0.20": 0,
        "0.21 - 0.40": 0,
        "0.41 - 0.60": 0,
        "0.61 - 0.80": 0,
        "0.81 - 1.00": 0
    }
    for d in devices:
        s = d["dynamic_trust_score"]
        if s <= 0.20:
            dist["0.00 - 0.20"] += 1
        elif s <= 0.40:
            dist["0.21 - 0.40"] += 1
        elif s <= 0.60:
            dist["0.41 - 0.60"] += 1
        elif s <= 0.80:
            dist["0.61 - 0.80"] += 1
        else:
            dist["0.81 - 1.00"] += 1
            
    distribution_data = [{"range": k, "count": v} for k, v in dist.items()]

    # Alert Severity Distribution
    severity_dist = {"WARNING": 0, "HIGH": 0, "CRITICAL": 0}
    active_alerts = 0
    acknowledged_alerts = 0
    for a in ALERTS_DB:
        sev = a["severity"].upper()
        if sev in severity_dist:
            severity_dist[sev] += 1
        if a["status"] == "ACTIVE":
            active_alerts += 1
        else:
            acknowledged_alerts += 1
            
    severity_data = [{"severity": k, "count": v} for k, v in severity_dist.items()]

    # Device type breakdown
    type_breakdown: dict = {}
    for d in devices:
        t = d.get("device_type", "Standard Scale")
        type_breakdown[t] = type_breakdown.get(t, 0) + 1
    type_data = [{"type": k, "count": v} for k, v in type_breakdown.items()]

    return {
        "total_devices": total_devices,
        "trusted_devices": trusted_count,
        "suspicious_devices": suspicious_count,
        "tampered_devices": tampered_count,
        "blocked_devices": blocked_count,
        "average_trust_score": avg_trust,
        "average_direct_trust": avg_direct,
        "average_indirect_trust": avg_indirect,
        "average_bilstm_score": avg_bilstm,
        "total_alerts": len(ALERTS_DB),
        "active_alerts": active_alerts,
        "acknowledged_alerts": acknowledged_alerts,
        "status_distribution": [
            {"status": "Trusted", "count": trusted_count, "color": "#10b981"},
            {"status": "Suspicious", "count": suspicious_count, "color": "#f59e0b"},
            {"status": "Tampered", "count": tampered_count, "color": "#ef4444"}
        ],
        "score_distribution": distribution_data,
        "severity_distribution": severity_data,
        "device_type_distribution": type_data
    }
