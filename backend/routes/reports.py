from fastapi import APIRouter, Response
from backend.database import DEVICES_DB, ALERTS_DB, SETTINGS, get_current_date_time
import io
import csv

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/summary")
def get_report_summary():
    """Generates an official Legal Metrology Trust & Tampering Inspection Summary Report."""
    cur_date, cur_time, _ = get_current_date_time()
    devices = list(DEVICES_DB.values())
    
    trusted_count = sum(1 for d in devices if d["trust_status"] == "TRUSTED")
    suspicious_count = sum(1 for d in devices if d["trust_status"] == "SUSPICIOUS")
    tampered_count = sum(1 for d in devices if d["trust_status"] == "TAMPERED")
    blocked_count = sum(1 for d in devices if d.get("is_blocked", False))
    active_alerts = sum(1 for a in ALERTS_DB if a["status"] == "ACTIVE")
    avg_trust = round(sum(d["dynamic_trust_score"] for d in devices) / max(1, len(devices)), 3) if devices else 0.0

    tampering_incidents = [a for a in ALERTS_DB if a["alert_type"] == "Tampering Detected" or a["severity"] == "CRITICAL"]

    recommendations = []
    if blocked_count > 0:
        blocked_ids = [d['device_id'] for d in devices if d.get('is_blocked', False)]
        recommendations.append(f"🔒 Security Lockdown: {blocked_count} instrument(s) ({', '.join(blocked_ids)}) are currently BLOCKED and quarantined. Only authorized Legal Metrology Admins can unblock post physical seal verification.")
    if suspicious_count > 0:
        recommendations.append(f"Inspection Notice: Schedule on-site secondary calibration verification for {suspicious_count} suspicious instrument(s).")
    if not recommendations:
        recommendations.append("Network Health Optimal: All weighing and measuring instruments operate within legal tolerance margins.")

    return {
        "report_id": f"REP-LM-{cur_date.replace('-', '')}-01",
        "generated_date": cur_date,
        "generated_time": cur_time,
        "inspector_name": "Senior Legal Metrology Officer (Inspectorate #4)",
        "jurisdiction": "Zone-A Commercial & Industrial Scales",
        "total_devices": len(devices),
        "trusted_count": trusted_count,
        "suspicious_count": suspicious_count,
        "tampered_count": tampered_count,
        "blocked_count": blocked_count,
        "active_alerts_count": active_alerts,
        "average_trust_score": avg_trust,
        "thresholds_applied": {
            "trusted": f">= {SETTINGS.trusted_min}",
            "suspicious": f"{SETTINGS.suspicious_min} - {SETTINGS.tampered_max}",
            "tampered": f"< {SETTINGS.suspicious_min}"
        },
        "devices": devices,
        "tampering_incidents": tampering_incidents,
        "recommendations": recommendations
    }

@router.get("/export/csv")
def export_csv(type: str = "devices"):
    """Export devices or alerts as downloadable CSV."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    if type == "alerts":
        writer.writerow(["Alert ID", "Device ID", "Sensor ID", "Alert Type", "Severity", "Trust Score", "Reason", "Date", "Time", "Status", "Acknowledged At", "Acknowledged By"])
        for a in ALERTS_DB:
            writer.writerow([
                a["alert_id"], a["device_id"], a.get("sensor_id", ""), a["alert_type"],
                a["severity"], a["trust_score"], a["reason"], a["date"], a["time"],
                a["status"], a.get("acknowledged_at", ""), a.get("acknowledged_by", "")
            ])
        filename = "legal_metrology_alerts_audit.csv"
    else:
        writer.writerow(["Device ID", "Sensor ID", "IP Address", "MAC Address", "Location", "Device Type", "Registration Date", "Registration Time", "Direct Trust", "Indirect Trust", "Behaviour Score", "Dynamic Trust Score", "Status", "Is Blocked", "Blocked Reason", "Last Evaluated Date", "Last Evaluated Time"])
        for d in DEVICES_DB.values():
            writer.writerow([
                d["device_id"], d["sensor_id"], d["ip_address"], d["mac_address"],
                d["location"], d["device_type"], d["registration_date"], d["registration_time"],
                d["direct_trust"], d["indirect_trust"], d["behaviour_score"],
                d["dynamic_trust_score"], d["trust_status"], "YES" if d.get("is_blocked", False) else "NO",
                d.get("blocked_reason", ""), d["last_evaluated_date"], d["last_evaluated_time"]
            ])
        filename = "legal_metrology_devices_registry.csv"

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
