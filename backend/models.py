from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DeviceBase(BaseModel):
    device_id: str
    sensor_id: str
    ip_address: str
    mac_address: str
    location: str
    device_type: str

class DeviceCreate(DeviceBase):
    pass

class Device(DeviceBase):
    registration_date: str
    registration_time: str
    last_evaluated_date: str
    last_evaluated_time: str
    direct_trust: float
    indirect_trust: float
    behaviour_score: float  # BiLSTM sequence anomaly / behavioural score
    dynamic_trust_score: float
    trust_status: str  # TRUSTED | SUSPICIOUS | TAMPERED
    is_blocked: bool = False
    blocked_reason: Optional[str] = None
    blocked_at: Optional[str] = None
    unblocked_at: Optional[str] = None
    unblocked_by: Optional[str] = None

class DeviceUnblockRequest(BaseModel):
    admin_name: Optional[str] = "Senior Legal Metrology Officer"
    calibration_seal_no: Optional[str] = "LM-SEAL-2026-9812"
    reason: Optional[str] = "Hardware re-calibrated, verified with standard weights, and certified compliant."
    restore_trust_score: Optional[float] = 0.95

class DeviceBlockRequest(BaseModel):
    admin_name: Optional[str] = "Senior Legal Metrology Officer"
    reason: Optional[str] = "Manual administrative quarantine / inspection hold."

class TrustHistoryPoint(BaseModel):
    timestamp: str
    date: str
    time: str
    dynamic_trust_score: float
    direct_trust: float
    indirect_trust: float
    behaviour_score: float
    status: str
    is_blocked: bool = False
    note: Optional[str] = None

class TrustEvaluation(BaseModel):
    device_id: str
    sensor_id: str
    direct_trust: float
    indirect_trust: float
    behaviour_score: float
    dynamic_trust_score: float
    trust_status: str
    is_blocked: bool = False
    evaluation_date: str
    evaluation_time: str

class Alert(BaseModel):
    alert_id: str
    device_id: str
    sensor_id: str
    alert_type: str  # Tampering Detected | Suspicious Device | Trust Score Dropped | Authentication Failure
    severity: str    # WARNING | HIGH | CRITICAL
    trust_score: float
    reason: str
    date: str
    time: str
    status: str      # ACTIVE | ACKNOWLEDGED
    acknowledged_at: Optional[str] = None
    acknowledged_by: Optional[str] = None

class AlertCreate(BaseModel):
    device_id: str
    alert_type: str
    severity: str
    trust_score: float
    reason: str

class AlertAcknowledge(BaseModel):
    officer_name: Optional[str] = "Officer In-Charge (LM-Zone-1)"

class ThresholdSettings(BaseModel):
    trusted_min: float = 0.80
    suspicious_min: float = 0.50
    tampered_max: float = 0.49
    alpha_direct_weight: float = 0.40
    beta_indirect_weight: float = 0.30
    gamma_behaviour_weight: float = 0.30

class MetrologyReportSummary(BaseModel):
    report_id: str
    generated_date: str
    generated_time: str
    inspector_name: str
    total_devices: int
    trusted_count: int
    suspicious_count: int
    tampered_count: int
    blocked_count: int
    active_alerts_count: int
    average_trust_score: float
    tampering_incidents: List[Dict[str, Any]]
    recommendations: List[str]
