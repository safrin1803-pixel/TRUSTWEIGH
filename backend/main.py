from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import devices, trust, alerts, analytics, reports, settings, auth, wokwi_bridge
from backend.database import get_current_date_time, initialize_demo_data

app = FastAPI(
    title="TRUSTWEIGH - Legal Metrology Trust Estimation & Tampering Detection API",
    description="Backend API for Trust Estimation, Dynamic Evaluation, and Tampering Detection in Weighing and Measuring Instruments",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(wokwi_bridge.router)
app.include_router(devices.router)
app.include_router(trust.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(settings.router)

@app.get("/")
def root():
    cur_date, cur_time, _ = get_current_date_time()
    return {
        "system": "TRUSTWEIGH Legal Metrology Tampering Detection System",
        "status": "OPERATIONAL",
        "current_date": cur_date,
        "current_time": cur_time,
        "docs_url": "/docs"
    }

@app.post("/api/system/reset")
def reset_database():
    """Reset demo data to clean initial state."""
    initialize_demo_data()
    return {"message": "System database reset to initial demonstration state."}
