from fastapi import APIRouter
from backend.models import ThresholdSettings
from backend.database import SETTINGS, DEVICES_DB, compute_trust_status

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=ThresholdSettings)
def get_settings():
    """Get current threshold and weight configurations."""
    return SETTINGS

@router.put("", response_model=ThresholdSettings)
def update_settings(payload: ThresholdSettings):
    """Update threshold limits and trust component weights, recalculating device statuses."""
    global SETTINGS
    SETTINGS.trusted_min = payload.trusted_min
    SETTINGS.suspicious_min = payload.suspicious_min
    SETTINGS.tampered_max = payload.tampered_max
    SETTINGS.alpha_direct_weight = payload.alpha_direct_weight
    SETTINGS.beta_indirect_weight = payload.beta_indirect_weight
    SETTINGS.gamma_behaviour_weight = payload.gamma_behaviour_weight
    
    # Recalculate dynamic scores and statuses across devices
    for dev in DEVICES_DB.values():
        dyn_score = round(
            (dev["direct_trust"] * SETTINGS.alpha_direct_weight) +
            (dev["indirect_trust"] * SETTINGS.beta_indirect_weight) +
            (dev["behaviour_score"] * SETTINGS.gamma_behaviour_weight),
            2
        )
        dev["dynamic_trust_score"] = dyn_score
        dev["trust_status"] = compute_trust_status(dyn_score, SETTINGS)
        
    return SETTINGS
