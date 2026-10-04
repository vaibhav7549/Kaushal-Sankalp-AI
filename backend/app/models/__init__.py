"""SQLAlchemy ORM models — all tables for Kaushal Sankalp AI."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.utcnow()


# ── Auth & Privacy ──────────────────────────────────────────────

class UserHashed(Base):
    __tablename__ = "users_hashed"
    id = Column(String, primary_key=True, default=_uuid)
    phone_hash = Column(String, unique=True, nullable=True)
    aadhaar_hash = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=_now)
    sessions = relationship("Session", back_populates="user")


class Consent(Base):
    __tablename__ = "consents"
    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    consent_type = Column(String, nullable=False)  # data_processing, voice, guardian
    granted = Column(Boolean, default=True)
    withdrawn_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_now)


class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    ip_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)


# ── Sessions & Turns ───────────────────────────────────────────

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users_hashed.id"), nullable=True)
    language = Column(String, default="hi")
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    block = Column(String, nullable=True)
    income_band = Column(String, nullable=True)  # <10k, 10-25k, 25-50k, >50k
    learner_age = Column(Integer, nullable=True)
    learner_gender = Column(String, nullable=True)
    academic_bg = Column(String, nullable=True)  # 8th, 10th, 12th, dropout
    learner_interests = Column(JSON, default=list)
    parent_occupation = Column(String, nullable=True)
    status = Column(String, default="active")  # active, completed, escalated
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)
    user = relationship("UserHashed", back_populates="sessions")
    turns = relationship("Turn", back_populates="session", order_by="Turn.created_at")


class Turn(Base):
    __tablename__ = "turns"
    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    speaker = Column(String, nullable=False)  # learner, parent, mediator
    text = Column(Text, nullable=False)
    lang = Column(String, default="hi")
    input_mode = Column(String, default="text")  # text, voice
    objection_category = Column(String, nullable=True)
    sentiment = Column(Float, nullable=True)  # -1..1
    intensity = Column(Float, nullable=True)  # 0..1
    distress_flag = Column(Boolean, default=False)
    rs_value = Column(Float, nullable=True)
    cards_shown = Column(JSON, default=list)
    citations = Column(JSON, default=list)
    pipeline_ms = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_now)
    session = relationship("Session", back_populates="turns")

    __table_args__ = (
        Index("ix_turns_session_id", "session_id"),
    )


class Objection(Base):
    __tablename__ = "objections"
    id = Column(String, primary_key=True, default=_uuid)
    turn_id = Column(String, ForeignKey("turns.id"), nullable=False)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    category = Column(String, nullable=False)
    text = Column(Text, nullable=True)
    reframed = Column(Boolean, default=False)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_now)


class RsSnapshot(Base):
    __tablename__ = "rs_snapshots"
    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    turn_id = Column(String, ForeignKey("turns.id"), nullable=False)
    value = Column(Float, nullable=False)
    components = Column(JSON, nullable=False)  # {neg_sentiment, obj_density, ...}
    explanation = Column(Text, nullable=True)
    delta = Column(Float, nullable=True)
    band = Column(String, nullable=False)  # open, concerned, high_friction
    created_at = Column(DateTime, default=_now)


class CardShown(Base):
    __tablename__ = "cards_shown"
    id = Column(String, primary_key=True, default=_uuid)
    turn_id = Column(String, ForeignKey("turns.id"), nullable=False)
    card_type = Column(String, nullable=False)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_now)


# ── Evidence & Data ────────────────────────────────────────────

class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True, default=_uuid)
    name_en = Column(String, nullable=False)
    name_hi = Column(String, nullable=False)
    name_mr = Column(String, nullable=True)
    sector = Column(String, nullable=False)
    nsqf_level = Column(Integer, nullable=False)
    notional_hours = Column(Integer, nullable=False)
    credits = Column(Integer, nullable=False)  # notional_hours / 30
    duration_months = Column(Integer, nullable=False)
    entry_qual = Column(String, nullable=True)
    job_roles = Column(JSON, default=list)
    next_levels = Column(JSON, default=list)
    future_skill = Column(Boolean, default=False)
    dgt_track = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)


class Provider(Base):
    __tablename__ = "providers"
    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    block = Column(String, nullable=True)
    state = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    female_pct = Column(Float, nullable=True)
    female_instructor_count = Column(Integer, nullable=True)
    cctv_rating = Column(String, nullable=True)  # 24/7, partial, none
    hostel = Column(Boolean, default=False)
    free_transport = Column(String, nullable=True)
    distance_km = Column(Float, nullable=True)
    placement_pct = Column(Float, nullable=True)
    avg_starting_salary = Column(Integer, nullable=True)
    courses = Column(JSON, default=list)
    languages = Column(JSON, default=list)
    rating = Column(Float, nullable=True)
    created_at = Column(DateTime, default=_now)


class DistrictOutcome(Base):
    __tablename__ = "district_outcomes"
    id = Column(String, primary_key=True, default=_uuid)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    salary_p25 = Column(Integer, nullable=True)
    salary_median = Column(Integer, nullable=True)
    salary_p75 = Column(Integer, nullable=True)
    share_earning_band = Column(Float, nullable=True)  # e.g. 0.82
    placement_pct = Column(Float, nullable=True)
    employers = Column(JSON, default=list)
    vacancies = Column(Integer, nullable=True)
    last_verified = Column(String, nullable=True)
    source = Column(String, nullable=True)  # "SIDH JobX (Demo Dataset)"
    created_at = Column(DateTime, default=_now)

    __table_args__ = (
        Index("ix_district_outcomes_course_district", "course_id", "district"),
    )


class NapsRule(Base):
    __tablename__ = "naps_rules"
    id = Column(String, primary_key=True, default=_uuid)
    nsqf_level = Column(Integer, nullable=False)
    sector = Column(String, nullable=True)
    stipend_min = Column(Integer, nullable=False)
    stipend_max = Column(Integer, nullable=False)
    employer_share_pct = Column(Float, nullable=False)
    govt_share_pct = Column(Float, nullable=False)
    created_at = Column(DateTime, default=_now)


class ProgressionPath(Base):
    __tablename__ = "progression_paths"
    id = Column(String, primary_key=True, default=_uuid)
    from_course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    to_course_id = Column(String, nullable=True)
    to_qualification = Column(String, nullable=True)
    nsqf_from = Column(Integer, nullable=False)
    nsqf_to = Column(Integer, nullable=False)
    duration_months = Column(Integer, nullable=True)
    entry_req = Column(String, nullable=True)
    job_role = Column(String, nullable=True)
    typical_salary = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=_now)


class FutureSkillTrack(Base):
    __tablename__ = "future_tracks"
    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    partner_firms = Column(JSON, default=list)
    courses = Column(JSON, default=list)
    max_nsqf = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=_now)


class EvidenceChunk(Base):
    __tablename__ = "evidence_chunks"
    id = Column(String, primary_key=True)  # E-xxxx
    text_en = Column(Text, nullable=False)
    text_hi = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    source = Column(String, nullable=True)
    connector = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    course_id = Column(String, nullable=True)
    last_verified = Column(String, nullable=True)
    record_type = Column(String, nullable=True)
    embedding = Column(JSON, nullable=True)  # stored as list[float] for SQLite
    created_at = Column(DateTime, default=_now)


class Counsellor(Base):
    __tablename__ = "counsellors"
    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # SSDM, PMKK, DSDO
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    languages = Column(JSON, default=list)
    availability = Column(Boolean, default=True)
    rating = Column(Float, nullable=True)
    specialisations = Column(JSON, default=list)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)


class DemandSupply(Base):
    __tablename__ = "demand_supply"
    id = Column(String, primary_key=True, default=_uuid)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    trade = Column(String, nullable=False)
    vacancies = Column(Integer, nullable=True)
    seats = Column(Integer, nullable=True)
    trained = Column(Integer, nullable=True)
    family_interest_pct = Column(Float, nullable=True)
    gap_index = Column(Float, nullable=True)
    tag = Column(String, nullable=True)  # Under-supplied / Balanced / Over-supplied
    source = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)


class GeoDistrict(Base):
    __tablename__ = "geo_districts"
    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    centroid_lat = Column(Float, nullable=True)
    centroid_lng = Column(Float, nullable=True)
    geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_now)


# ── Escalation & Action Plans ──────────────────────────────────

class Escalation(Base):
    __tablename__ = "escalations"
    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    counsellor_id = Column(String, ForeignKey("counsellors.id"), nullable=True)
    brief = Column(Text, nullable=True)
    case_pack = Column(JSON, nullable=True)
    status = Column(String, default="pending")  # pending, active, completed
    outcome = Column(String, nullable=True)  # resolved, follow_up, enrolled, dropped
    referral_decision = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)


class ActionPlan(Base):
    __tablename__ = "action_plans"
    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    escalation_id = Column(String, nullable=True)
    courses = Column(JSON, default=list)
    concerns = Column(JSON, default=list)
    next_steps = Column(JSON, default=list)
    referral_decision = Column(String, nullable=True)
    pdf_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)


# ── Admin ──────────────────────────────────────────────────────

class IecScenario(Base):
    __tablename__ = "iec_scenarios"
    id = Column(String, primary_key=True, default=_uuid)
    district = Column(String, nullable=False)
    budget = Column(Float, nullable=False)
    allocations = Column(JSON, nullable=True)
    expected_pri_change = Column(Float, nullable=True)
    saved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)


# ── Synthetic Sessions (for admin analytics) ───────────────────

class SyntheticSession(Base):
    __tablename__ = "synthetic_sessions"
    id = Column(String, primary_key=True, default=_uuid)
    district = Column(String, nullable=False)
    block = Column(String, nullable=True)
    state = Column(String, nullable=False)
    learner_gender = Column(String, nullable=True)
    income_band = Column(String, nullable=True)
    language = Column(String, nullable=True)
    objections = Column(JSON, default=list)
    rs_trajectory = Column(JSON, default=list)
    sentiment_pre = Column(Float, nullable=True)
    sentiment_post = Column(Float, nullable=True)
    escalated = Column(Boolean, default=False)
    outcome = Column(String, nullable=True)
    course_interest = Column(String, nullable=True)
    created_at = Column(DateTime, default=_now)
    day_of_week = Column(Integer, nullable=True)
