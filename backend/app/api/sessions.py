"""Session management API."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import Session

router = APIRouter()


class SessionCreate(BaseModel):
    language: str = "hi"
    state: str | None = None
    district: str | None = None
    block: str | None = None
    income_band: str | None = None
    learner_age: int | None = None
    learner_gender: str | None = None
    academic_bg: str | None = None
    learner_interests: list[str] = []
    parent_occupation: str | None = None


@router.post("")
async def create_session(body: SessionCreate, db: AsyncSession = Depends(get_db)):
    """Create a new counselling session with family profile."""
    session = Session(
        language=body.language,
        state=body.state,
        district=body.district,
        block=body.block,
        income_band=body.income_band,
        learner_age=body.learner_age,
        learner_gender=body.learner_gender,
        academic_bg=body.academic_bg,
        learner_interests=body.learner_interests,
        parent_occupation=body.parent_occupation,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {
        "id": session.id,
        "language": session.language,
        "state": session.state,
        "district": session.district,
        "status": session.status,
        "created_at": str(session.created_at),
    }


@router.get("/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Get session details."""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": session.id,
        "language": session.language,
        "state": session.state,
        "district": session.district,
        "block": session.block,
        "income_band": session.income_band,
        "learner_age": session.learner_age,
        "learner_gender": session.learner_gender,
        "academic_bg": session.academic_bg,
        "learner_interests": session.learner_interests,
        "parent_occupation": session.parent_occupation,
        "status": session.status,
        "created_at": str(session.created_at),
    }
