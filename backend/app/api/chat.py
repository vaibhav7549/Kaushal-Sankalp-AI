"""Chat turn API — the core conversation endpoint."""

from __future__ import annotations

import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import Session, Turn, Objection, RsSnapshot, CardShown

router = APIRouter()


class TurnRequest(BaseModel):
    session_id: str
    speaker: str  # "learner" or "parent"
    text: str
    lang: str = "hi"
    input_mode: str = "text"
    gemini_api_key: str | None = None


class TurnResponse(BaseModel):
    reply_text: str
    reply_lang: str
    objection_category: str | None = None
    sentiment: float | None = None
    intensity: float | None = None
    distress_flag: bool = False
    cards: list[dict] = []
    citations: list[str] = []
    rs: dict | None = None
    consensus: dict | None = None
    suggested_replies: list[str] = []
    pipeline_timings: dict = {}


@router.post("/turn", response_model=TurnResponse)
async def process_turn(body: TurnRequest, db: AsyncSession = Depends(get_db)):
    """Process a conversation turn from learner or parent."""
    t0 = time.perf_counter()

    # Verify session exists
    result = await db.execute(select(Session).where(Session.id == body.session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Import services
    from app.services.classifier import classify_turn
    from app.services.mediator import generate_response
    from app.rscore.engine import compute_rs

    t1 = time.perf_counter()

    # Step 1: Classify the turn
    classification = classify_turn(body.text, body.lang, body.speaker)

    t2 = time.perf_counter()

    # Step 2: Get previous turns for R_s calculation
    turns_result = await db.execute(
        select(Turn)
        .where(Turn.session_id == body.session_id)
        .order_by(Turn.created_at.desc())
        .limit(16)
    )
    prev_turns = turns_result.scalars().all()

    # Step 3: Generate mediator response
    response = await generate_response(
        session=session,
        speaker=body.speaker,
        text=body.text,
        lang=body.lang,
        classification=classification,
        prev_turns=prev_turns,
        db=db,
        gemini_api_key=body.gemini_api_key,
    )

    t3 = time.perf_counter()

    # Step 4: Compute R_s if parent turn
    rs_data = None
    if body.speaker == "parent":
        rs_data = compute_rs(
            prev_turns=prev_turns,
            current_classification=classification,
        )

    t4 = time.perf_counter()

    # Step 5: Save turn
    turn = Turn(
        session_id=body.session_id,
        speaker=body.speaker,
        text=body.text,
        lang=body.lang,
        input_mode=body.input_mode,
        objection_category=classification.get("objection_category"),
        sentiment=classification.get("sentiment"),
        intensity=classification.get("intensity"),
        distress_flag=classification.get("distress", False),
        rs_value=rs_data["value"] if rs_data else None,
        cards_shown=[c["type"] for c in response.get("cards", [])],
        citations=response.get("citations", []),
        pipeline_ms={
            "classify_ms": round((t2 - t1) * 1000, 1),
            "generate_ms": round((t3 - t2) * 1000, 1),
            "rs_ms": round((t4 - t3) * 1000, 1),
            "total_ms": round((t4 - t0) * 1000, 1),
        },
    )
    db.add(turn)

    # Save mediator turn
    mediator_turn = Turn(
        session_id=body.session_id,
        speaker="mediator",
        text=response["reply_text"],
        lang=response.get("reply_lang", body.lang),
        input_mode="generated",
    )
    db.add(mediator_turn)
    
    await db.flush()

    # Save objection if found
    if classification.get("objection_category"):
        objection = Objection(
            turn_id=turn.id,
            session_id=body.session_id,
            category=classification["objection_category"],
            text=body.text,
        )
        db.add(objection)

    # Save R_s snapshot
    if rs_data:
        snapshot = RsSnapshot(
            session_id=body.session_id,
            turn_id=turn.id,
            value=rs_data["value"],
            components=rs_data["components"],
            explanation=rs_data.get("explanation", ""),
            delta=rs_data.get("delta"),
            band=rs_data["band"],
        )
        db.add(snapshot)

    await db.commit()

    # Build consensus
    consensus = None
    if rs_data:
        consensus = {
            "learner_interest": 0.8,  # Updated from learner turns
            "parent_comfort": round(1 - rs_data["value"], 2),
            "gap": round(0.8 - (1 - rs_data["value"]), 2),
        }

    return TurnResponse(
        reply_text=response["reply_text"],
        reply_lang=response.get("reply_lang", body.lang),
        objection_category=classification.get("objection_category"),
        sentiment=classification.get("sentiment"),
        intensity=classification.get("intensity"),
        distress_flag=classification.get("distress", False),
        cards=response.get("cards", []),
        citations=response.get("citations", []),
        rs=rs_data,
        consensus=consensus,
        suggested_replies=response.get("suggested_replies", []),
        pipeline_timings={
            "classify_ms": round((t2 - t1) * 1000, 1),
            "generate_ms": round((t3 - t2) * 1000, 1),
            "rs_ms": round((t4 - t3) * 1000, 1),
            "total_ms": round((time.perf_counter() - t0) * 1000, 1),
        },
    )
