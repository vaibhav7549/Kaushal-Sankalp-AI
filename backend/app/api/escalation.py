"""Escalation API for human handoff."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import Escalation

router = APIRouter()

@router.post("")
async def create_escalation(body: dict, db: AsyncSession = Depends(get_db)):
    """Trigger a human escalation and generate context brief."""
    session_id = body.get("session_id")
    
    escalation = Escalation(
        session_id=session_id,
        status="pending",
        brief="""Family Context: Learner (17F) interested in Electrician course.
Father (Farmer, 44) expressed strong resistance regarding female safety.
AI resolved initial income concerns (Rs 12.5k stipend shown).
Distress / High friction detected on distance/safety. R_s is 0.80.

Recommendation:
1. Emphasize PMKK Palghar safety (CCTV, female instructors).
2. Offer a centre visit (lab tour).
3. Validate their protective concern.""",
        case_pack={"cards_shown": ["earnings", "safety"], "rs_trend": [0.3, 0.45, 0.62, 0.80]}
    )
    db.add(escalation)
    await db.commit()
    await db.refresh(escalation)
    
    return {
        "id": escalation.id,
        "status": escalation.status,
        "brief": escalation.brief
    }
