from datetime import datetime
from typing import Dict, List, Optional
import copy
from backend.models import (
    Device, DeviceCreate, TrustHistoryPoint, Alert, ThresholdSettings, MetrologyReportSummary
)

def get_current_date_time():
    now = datetime.now()
    return now.strftime("%d-%b-%Y"), now.strftime("%I:%M:%S %p"), now.isoformat()

# Default Threshold Settings
SETTINGS = ThresholdSettings(
    trusted_min=0.80,
    suspicious_min=0.50,
    tampered_max=0.49,
    alpha_direct_weight=0.40,
    beta_indirect_weight=0.30,
    gamma_behaviour_weight=0.30
)

def compute_trust_status(score: float, settings: ThresholdSettings = SETTINGS) -> str:
    if score >= settings.trusted_min:
        return "TRUSTED"
    elif score >= settings.suspicious_min:
        return "SUSPICIOUS"
    else:
        return "TAMPERED"

# In-Memory Database store
DEVICES_DB: Dict[str, Dict] = {}
TRUST_HISTORY_DB: Dict[str, List[Dict]] = {}
ALERTS_DB: List[Dict] = []

def initialize_demo_data():
    global DEVICES_DB, TRUST_HISTORY_DB, ALERTS_DB
    DEVICES_DB.clear()
    TRUST_HISTORY_DB.clear()
    ALERTS_DB.clear()

    current_date, current_time, _ = get_current_date_time()

    initial_devices = [
        {
            "device_id": "WEIGH-001",
            "sensor_id": "SENSOR-01",
            "ip_address": "192.168.1.10",
            "mac_address": "3C:71:BF:8A:2B:10",
            "location": "Central Grain Market - Weighbridge #1",
            "device_type": "Heavy Vehicle Weighbridge (50 Ton)",
            "registration_date": "10-Aug-2026",
            "registration_time": "09:30:00 AM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.96,
            "indirect_trust": 0.93,
            "behaviour_score": 0.94,
            "dynamic_trust_score": 0.94,
            "trust_status": "TRUSTED",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-002",
            "sensor_id": "SENSOR-02",
            "ip_address": "192.168.1.11",
            "mac_address": "3C:71:BF:8A:2B:11",
            "location": "Wholesale Market - Platform Scale A",
            "device_type": "Digital Industrial Platform Scale (500 Kg)",
            "registration_date": "11-Aug-2026",
            "registration_time": "10:15:20 AM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.78,
            "indirect_trust": 0.72,
            "behaviour_score": 0.77,
            "dynamic_trust_score": 0.76,
            "trust_status": "SUSPICIOUS",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-003",
            "sensor_id": "SENSOR-03",
            "ip_address": "192.168.1.12",
            "mac_address": "3C:71:BF:8A:2B:12",
            "location": "National Highway Toll Scale - Lane 4",
            "device_type": "Axle Load Dynamic Weigh-in-Motion",
            "registration_date": "12-Aug-2026",
            "registration_time": "11:40:15 AM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.35,
            "indirect_trust": 0.28,
            "behaviour_score": 0.30,
            "dynamic_trust_score": 0.31,
            "trust_status": "TAMPERED",
            "is_blocked": True,
            "blocked_reason": "AUTOMATED SECURITY QUARANTINE: Tampering detected (Load cell signal deviation & calibration bypass). Instrument locked from taking transactions.",
            "blocked_at": f"{current_date} 02:43:18 PM",
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-004",
            "sensor_id": "SENSOR-04",
            "ip_address": "192.168.1.13",
            "mac_address": "3C:71:BF:8A:2B:13",
            "location": "Bullion & Gold Refinery - Vault Lab",
            "device_type": "High-Precision Micro Analytical Balance (0.01mg)",
            "registration_date": "12-Aug-2026",
            "registration_time": "02:10:00 PM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.98,
            "indirect_trust": 0.97,
            "behaviour_score": 0.99,
            "dynamic_trust_score": 0.98,
            "trust_status": "TRUSTED",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-005",
            "sensor_id": "SENSOR-05",
            "ip_address": "192.168.1.14",
            "mac_address": "3C:71:BF:8A:2B:14",
            "location": "Seaport Container Terminal - Crane Scale 02",
            "device_type": "Suspended Crane Scale (20 Ton)",
            "registration_date": "14-Aug-2026",
            "registration_time": "08:20:45 AM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.91,
            "indirect_trust": 0.89,
            "behaviour_score": 0.92,
            "dynamic_trust_score": 0.91,
            "trust_status": "TRUSTED",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-006",
            "sensor_id": "SENSOR-06",
            "ip_address": "192.168.1.15",
            "mac_address": "3C:71:BF:8A:2B:15",
            "location": "FMCG Retail Superstore - Checkout 12",
            "device_type": "Electronic Price Computing Scale",
            "registration_date": "15-Aug-2026",
            "registration_time": "01:05:10 PM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.88,
            "indirect_trust": 0.86,
            "behaviour_score": 0.89,
            "dynamic_trust_score": 0.88,
            "trust_status": "TRUSTED",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-007",
            "sensor_id": "SENSOR-07",
            "ip_address": "192.168.1.16",
            "mac_address": "3C:71:BF:8A:2B:16",
            "location": "Petrochemical Depot - Tanker Loading Rack",
            "device_type": "Mass Flow Metrology Terminal",
            "registration_date": "16-Aug-2026",
            "registration_time": "03:45:00 PM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.95,
            "indirect_trust": 0.94,
            "behaviour_score": 0.96,
            "dynamic_trust_score": 0.95,
            "trust_status": "TRUSTED",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-008",
            "sensor_id": "SENSOR-08",
            "ip_address": "192.168.1.17",
            "mac_address": "3C:71:BF:8A:2B:17",
            "location": "Cement Silo Plant - Hopper #3",
            "device_type": "Hopper Batching Scale (5 Ton)",
            "registration_date": "17-Aug-2026",
            "registration_time": "11:12:30 AM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.65,
            "indirect_trust": 0.58,
            "behaviour_score": 0.62,
            "dynamic_trust_score": 0.62,
            "trust_status": "SUSPICIOUS",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-009",
            "sensor_id": "SENSOR-09",
            "ip_address": "192.168.1.18",
            "mac_address": "3C:71:BF:8A:2B:18",
            "location": "Airport Cargo Warehouse - Bay 7",
            "device_type": "Heavy Duty Pallet Scale",
            "registration_date": "18-Aug-2026",
            "registration_time": "04:30:00 PM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.92,
            "indirect_trust": 0.90,
            "behaviour_score": 0.93,
            "dynamic_trust_score": 0.92,
            "trust_status": "TRUSTED",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        },
        {
            "device_id": "WEIGH-010",
            "sensor_id": "SENSOR-10",
            "ip_address": "192.168.1.19",
            "mac_address": "3C:71:BF:8A:2B:19",
            "location": "Municipal Solid Waste Depot - Scale B",
            "device_type": "Pitless Weighbridge (30 Ton)",
            "registration_date": "19-Aug-2026",
            "registration_time": "09:00:00 AM",
            "last_evaluated_date": current_date,
            "last_evaluated_time": current_time,
            "direct_trust": 0.89,
            "indirect_trust": 0.85,
            "behaviour_score": 0.90,
            "dynamic_trust_score": 0.88,
            "trust_status": "TRUSTED",
            "is_blocked": False,
            "blocked_reason": None,
            "blocked_at": None,
            "unblocked_at": None,
            "unblocked_by": None
        }
    ]

    for dev in initial_devices:
        DEVICES_DB[dev["device_id"]] = dev
        
        # Timeseries history
        history = []
        base_score = dev["dynamic_trust_score"]
        
        if dev["device_id"] == "WEIGH-003":  # Tampered device trajectory
            scores = [
                (0.95, 0.96, 0.94, 0.95, "02:00:00 PM", "TRUSTED", False, "Normal calibrated operation"),
                (0.92, 0.93, 0.91, 0.92, "02:15:00 PM", "TRUSTED", False, "Minor baseline drift"),
                (0.79, 0.80, 0.76, 0.78, "02:30:00 PM", "SUSPICIOUS", False, "Load cell signal deviation detected"),
                (0.58, 0.62, 0.54, 0.58, "02:38:00 PM", "SUSPICIOUS", False, "BiLSTM sequence pattern mismatch"),
                (0.31, 0.35, 0.28, 0.30, "02:43:18 PM", "TAMPERED", True, "🚨 CRITICAL TAMPERING DETECTED: Device Automatically Blocked & Isolated"),
                (0.31, 0.35, 0.28, 0.30, current_time, "TAMPERED", True, "Device currently quarantined - Requires Admin Unblock")
            ]
            for s, d, i, b, t_str, st, blk, note in scores:
                history.append({
                    "timestamp": f"2026-08-21T{t_str}",
                    "date": current_date,
                    "time": t_str,
                    "dynamic_trust_score": s,
                    "direct_trust": d,
                    "indirect_trust": i,
                    "behaviour_score": b,
                    "status": st,
                    "is_blocked": blk,
                    "note": note
                })
        elif dev["device_id"] == "WEIGH-002":
            scores = [
                (0.94, 0.95, 0.92, 0.94, "01:00:00 PM", "TRUSTED", False, "Calibrated verified"),
                (0.88, 0.90, 0.85, 0.88, "01:30:00 PM", "TRUSTED", False, "Stable readings"),
                (0.81, 0.83, 0.78, 0.81, "02:00:00 PM", "TRUSTED", False, "Threshold boundary"),
                (0.76, 0.78, 0.72, 0.77, "02:30:00 PM", "SUSPICIOUS", False, "Intermittent zero-point fluctuation"),
                (0.76, 0.78, 0.72, 0.77, current_time, "SUSPICIOUS", False, "Pending inspector verification")
            ]
            for s, d, i, b, t_str, st, blk, note in scores:
                history.append({
                    "timestamp": f"2026-08-21T{t_str}",
                    "date": current_date,
                    "time": t_str,
                    "dynamic_trust_score": s,
                    "direct_trust": d,
                    "indirect_trust": i,
                    "behaviour_score": b,
                    "status": st,
                    "is_blocked": blk,
                    "note": note
                })
        else:
            history = [
                {
                    "timestamp": "2026-08-21T10:00:00",
                    "date": current_date,
                    "time": "10:00:00 AM",
                    "dynamic_trust_score": min(0.99, round(base_score - 0.02, 2)),
                    "direct_trust": dev["direct_trust"],
                    "indirect_trust": dev["indirect_trust"],
                    "behaviour_score": dev["behaviour_score"],
                    "status": "TRUSTED",
                    "is_blocked": False,
                    "note": "Verified genuine calibration"
                },
                {
                    "timestamp": f"2026-08-21T{current_time}",
                    "date": current_date,
                    "time": current_time,
                    "dynamic_trust_score": base_score,
                    "direct_trust": dev["direct_trust"],
                    "indirect_trust": dev["indirect_trust"],
                    "behaviour_score": dev["behaviour_score"],
                    "status": "TRUSTED",
                    "is_blocked": False,
                    "note": "Live evaluation valid"
                }
            ]
        
        TRUST_HISTORY_DB[dev["device_id"]] = history

    # Initial Alerts
    ALERTS_DB.extend([
        {
            "alert_id": "ALT-2026-0891",
            "device_id": "WEIGH-003",
            "sensor_id": "SENSOR-03",
            "alert_type": "Tampering Detected",
            "severity": "CRITICAL",
            "trust_score": 0.31,
            "reason": "Abnormal trust behaviour: Load cell amplifier offset modified. Device AUTOMATICALLY BLOCKED & QUARANTINED.",
            "date": current_date,
            "time": "02:43:18 PM",
            "status": "ACTIVE",
            "acknowledged_at": None,
            "acknowledged_by": None
        },
        {
            "alert_id": "ALT-2026-0889",
            "device_id": "WEIGH-008",
            "sensor_id": "SENSOR-08",
            "alert_type": "Trust Score Dropped",
            "severity": "HIGH",
            "trust_score": 0.62,
            "reason": "Dynamic trust score dropped below 0.70 threshold. Inconsistent batch tare weight readings detected across 4 consecutive cycles.",
            "date": current_date,
            "time": "02:15:40 PM",
            "status": "ACTIVE",
            "acknowledged_at": None,
            "acknowledged_by": None
        },
        {
            "alert_id": "ALT-2026-0885",
            "device_id": "WEIGH-002",
            "sensor_id": "SENSOR-02",
            "alert_type": "Suspicious Device",
            "severity": "WARNING",
            "trust_score": 0.76,
            "reason": "Zero-point calibration variance detected. Device entered SUSPICIOUS status band (0.50 - 0.79).",
            "date": current_date,
            "time": "01:50:12 PM",
            "status": "ACTIVE",
            "acknowledged_at": None,
            "acknowledged_by": None
        }
    ])

initialize_demo_data()
