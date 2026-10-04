"""Auth endpoints — demo OTP flow and simulated Aadhaar e-KYC."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import get_settings

router = APIRouter()
settings = get_settings()


class OtpRequest(BaseModel):
    phone: str


class OtpVerify(BaseModel):
    phone: str
    otp: str


class AadhaarSimulate(BaseModel):
    aadhaar_last4: str = "1234"


@router.post("/mobile-otp/request")
async def request_otp(body: OtpRequest):
    """Send demo OTP (always 123456 in prototype)."""
    return {
        "status": "sent",
        "message": "Demo OTP sent (always 123456)",
        "demo_otp": settings.DEMO_OTP,
    }


@router.post("/mobile-otp/verify")
async def verify_otp(body: OtpVerify):
    """Verify OTP — accepts demo OTP 123456."""
    if body.otp != settings.DEMO_OTP:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    return {
        "status": "verified",
        "token": "demo-token-" + body.phone[-4:],
        "message": "Demo authentication successful",
    }


@router.post("/aadhaar-ekyc/simulate")
async def simulate_ekyc(body: AadhaarSimulate):
    """SIMULATED Aadhaar e-KYC — returns a hashed token."""
    import hashlib
    hashed = hashlib.sha256(
        (body.aadhaar_last4 + settings.HASH_SALT).encode()
    ).hexdigest()[:16]
    return {
        "status": "simulated",
        "hashed_token": hashed,
        "badge": "SIMULATED",
        "message": "This is a simulated e-KYC for demonstration purposes only.",
    }
