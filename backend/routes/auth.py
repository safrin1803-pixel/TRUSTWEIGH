from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    username: str
    name: str
    role: str
    badge_no: str
    department: str
    zone: str
    email: str

class LoginResponse(BaseModel):
    token: str
    user: UserProfile
    message: str

# Default Admin Credentials
ADMIN_USER = {
    "username": "admin",
    "password": "admin123",
    "name": "Admin",
    "role": "Legal Metrology System Administrator",
    "badge_no": "LM-ADMIN-01",
    "department": "Department of Legal Metrology Enforcement",
    "zone": "Zone-A Commercial & Industrial Scales",
    "email": "admin@metrology.gov.in"
}

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """Authenticate Legal Metrology Admin."""
    if (payload.username == ADMIN_USER["username"] or payload.username == ADMIN_USER["email"]) and payload.password == ADMIN_USER["password"]:
        token = "Bearer-LM-SESSION-TOKEN-2026-X89104"
        return LoginResponse(
            token=token,
            user=UserProfile(
                username=ADMIN_USER["username"],
                name=ADMIN_USER["name"],
                role=ADMIN_USER["role"],
                badge_no=ADMIN_USER["badge_no"],
                department=ADMIN_USER["department"],
                zone=ADMIN_USER["zone"],
                email=ADMIN_USER["email"]
            ),
            message="Authentication successful. Authorized as Admin."
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password. Please use authorized credentials.")

@router.get("/me", response_model=UserProfile)
def get_current_user(authorization: Optional[str] = Header(None)):
    """Verify session token and return authenticated user profile."""
    if not authorization or not authorization.startswith("Bearer"):
        raise HTTPException(status_code=401, detail="Not authenticated")
    return UserProfile(
        username=ADMIN_USER["username"],
        name=ADMIN_USER["name"],
        role=ADMIN_USER["role"],
        badge_no=ADMIN_USER["badge_no"],
        department=ADMIN_USER["department"],
        zone=ADMIN_USER["zone"],
        email=ADMIN_USER["email"]
    )
