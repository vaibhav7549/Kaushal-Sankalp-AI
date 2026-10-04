"""DPI Mock Endpoints — same API shape as production integrations.

All endpoints return data labelled "Demo Dataset" with source metadata.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import Course, DistrictOutcome, Provider, NapsRule, DemandSupply

router = APIRouter()


# ── SIDH JobX ───────────────────────────────────────────────────

@router.get("/sidh-jobx/wages")
async def sidh_wages(
    course_id: str = Query(None),
    district: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """District-level wage data for a course."""
    q = select(DistrictOutcome)
    if course_id:
        q = q.where(DistrictOutcome.course_id == course_id)
    if district:
        q = q.where(DistrictOutcome.district == district)
    result = await db.execute(q.limit(20))
    rows = result.scalars().all()
    return {
        "source": "SIDH JobX (Demo Dataset)",
        "connector": "sidh-jobx",
        "count": len(rows),
        "data": [
            {
                "course_id": r.course_id,
                "district": r.district,
                "state": r.state,
                "salary_p25": r.salary_p25,
                "salary_median": r.salary_median,
                "salary_p75": r.salary_p75,
                "share_earning_band": r.share_earning_band,
                "last_verified": r.last_verified,
                "source": r.source,
            }
            for r in rows
        ],
    }


@router.get("/sidh-jobx/placement")
async def sidh_placement(
    course_id: str = Query(None),
    district: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Placement rates by course and district."""
    q = select(DistrictOutcome)
    if course_id:
        q = q.where(DistrictOutcome.course_id == course_id)
    if district:
        q = q.where(DistrictOutcome.district == district)
    result = await db.execute(q.limit(20))
    rows = result.scalars().all()
    return {
        "source": "SIDH JobX (Demo Dataset)",
        "connector": "sidh-jobx",
        "count": len(rows),
        "data": [
            {
                "course_id": r.course_id,
                "district": r.district,
                "placement_pct": r.placement_pct,
                "employers": r.employers,
                "vacancies": r.vacancies,
                "last_verified": r.last_verified,
            }
            for r in rows
        ],
    }


@router.get("/sidh-jobx/employers")
async def sidh_employers(
    district: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Active employers in a district."""
    q = select(DistrictOutcome)
    if district:
        q = q.where(DistrictOutcome.district == district)
    result = await db.execute(q.limit(20))
    rows = result.scalars().all()
    all_employers = []
    for r in rows:
        for emp in (r.employers or []):
            if emp not in all_employers:
                all_employers.append(emp)
    return {
        "source": "SIDH JobX (Demo Dataset)",
        "connector": "sidh-jobx",
        "district": district,
        "employers": all_employers[:20],
    }


# ── PMKVY MIS ──────────────────────────────────────────────────

@router.get("/pmkvy-mis/outcomes")
async def pmkvy_outcomes(
    course_id: str = Query(None),
    state: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Outcome data from PMKVY MIS (Demo)."""
    q = select(DistrictOutcome)
    if course_id:
        q = q.where(DistrictOutcome.course_id == course_id)
    if state:
        q = q.where(DistrictOutcome.state == state)
    result = await db.execute(q.limit(30))
    rows = result.scalars().all()
    return {
        "source": "PMKVY MIS (Demo Dataset)",
        "connector": "pmkvy-mis",
        "count": len(rows),
        "data": [
            {
                "course_id": r.course_id,
                "district": r.district,
                "state": r.state,
                "placement_pct": r.placement_pct,
                "salary_median": r.salary_median,
            }
            for r in rows
        ],
    }


# ── PLFS ────────────────────────────────────────────────────────

@router.get("/plfs/regional-earnings")
async def plfs_earnings(
    state: str = Query(None),
    sector: str = Query(None),
):
    """Regional earnings data from PLFS (Demo)."""
    return {
        "source": "PLFS 2023-24 (Demo Dataset)",
        "connector": "plfs",
        "data": {
            "state": state or "Maharashtra",
            "sector": sector or "Electrical",
            "median_monthly_earnings": 18500,
            "vocational_premium_pct": 22,
            "sample_size": "Demo",
            "period": "2023-24",
        },
    }


# ── NCS (National Career Service) ──────────────────────────────

@router.get("/ncs/vacancies")
async def ncs_vacancies(
    district: str = Query(None),
    trade: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Job vacancies from NCS (Demo)."""
    q = select(DemandSupply)
    if district:
        q = q.where(DemandSupply.district == district)
    if trade:
        q = q.where(DemandSupply.trade == trade)
    result = await db.execute(q.limit(20))
    rows = result.scalars().all()
    return {
        "source": "NCS (Demo Dataset)",
        "connector": "ncs",
        "count": len(rows),
        "data": [
            {
                "district": r.district,
                "trade": r.trade,
                "vacancies": r.vacancies,
                "source": r.source,
            }
            for r in rows
        ],
    }


# ── NAPS ────────────────────────────────────────────────────────

@router.get("/naps/stipend")
async def naps_stipend(
    nsqf_level: int = Query(4),
    sector: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Apprenticeship stipend rules from NAPS (Demo)."""
    q = select(NapsRule).where(NapsRule.nsqf_level == nsqf_level)
    if sector:
        q = q.where(NapsRule.sector == sector)
    result = await db.execute(q.limit(5))
    rows = result.scalars().all()
    if not rows:
        return {
            "source": "NAPS (Demo Dataset)",
            "connector": "naps",
            "data": {
                "nsqf_level": nsqf_level,
                "stipend_range": "₹7,000 - ₹15,000/month",
                "hero_stipend": 12500,
                "employer_share_pct": 75,
                "govt_share_pct": 25,
            },
        }
    r = rows[0]
    return {
        "source": "NAPS (Demo Dataset)",
        "connector": "naps",
        "data": {
            "nsqf_level": r.nsqf_level,
            "sector": r.sector,
            "stipend_min": r.stipend_min,
            "stipend_max": r.stipend_max,
            "employer_share_pct": r.employer_share_pct,
            "govt_share_pct": r.govt_share_pct,
        },
    }


# ── NCVET / NCrF ───────────────────────────────────────────────

@router.get("/ncvet/courses")
async def ncvet_courses(
    sector: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Course catalogue from NCVET (Demo)."""
    q = select(Course)
    if sector:
        q = q.where(Course.sector == sector)
    result = await db.execute(q.limit(20))
    rows = result.scalars().all()
    return {
        "source": "NCVET (Demo Dataset)",
        "connector": "ncvet",
        "count": len(rows),
        "data": [
            {
                "id": r.id,
                "name_en": r.name_en,
                "name_hi": r.name_hi,
                "sector": r.sector,
                "nsqf_level": r.nsqf_level,
                "notional_hours": r.notional_hours,
                "credits": r.credits,
                "duration_months": r.duration_months,
                "future_skill": r.future_skill,
            }
            for r in rows
        ],
    }


@router.get("/ncvet/providers")
async def ncvet_providers(
    district: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Training providers from NCVET (Demo)."""
    q = select(Provider)
    if district:
        q = q.where(Provider.district == district)
    result = await db.execute(q.limit(20))
    rows = result.scalars().all()
    return {
        "source": "NCVET (Demo Dataset)",
        "connector": "ncvet",
        "count": len(rows),
        "data": [
            {
                "id": r.id,
                "name": r.name,
                "district": r.district,
                "state": r.state,
                "placement_pct": r.placement_pct,
                "avg_starting_salary": r.avg_starting_salary,
                "rating": r.rating,
            }
            for r in rows
        ],
    }


# ── ABC / APAAR ────────────────────────────────────────────────

@router.get("/abc/credits")
async def abc_credits(
    course_id: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Academic Bank of Credits calculation (notional_hours / 30)."""
    if course_id:
        result = await db.execute(select(Course).where(Course.id == course_id))
        course = result.scalar_one_or_none()
        if course:
            return {
                "source": "ABC/APAAR (Demo Dataset)",
                "connector": "abc",
                "data": {
                    "course_id": course.id,
                    "course_name": course.name_en,
                    "notional_hours": course.notional_hours,
                    "credits": course.credits,
                    "formula": "notional_hours / 30",
                    "lateral_entry_options": [
                        "B.Voc (NSQF Level 5-7)",
                        "Diploma in Engineering",
                        "B.Tech via lateral entry",
                    ],
                },
            }
    return {
        "source": "ABC/APAAR (Demo Dataset)",
        "connector": "abc",
        "message": "Provide course_id to calculate credits",
    }


@router.post("/abc/deposit/simulate")
async def abc_deposit_simulate(course_id: str = Query(...)):
    """Simulate depositing credits into Academic Bank of Credits."""
    return {
        "source": "ABC/APAAR (Demo Dataset)",
        "connector": "abc",
        "status": "simulated",
        "message": "Credits would be deposited into the student's APAAR-linked Academic Bank of Credits.",
        "badge": "SIMULATED",
    }


# ── Future Tracks ──────────────────────────────────────────────

@router.get("/future-tracks")
async def future_tracks(db: AsyncSession = Depends(get_db)):
    """DGT future-skill tracks."""
    from app.models import FutureSkillTrack
    result = await db.execute(select(FutureSkillTrack))
    rows = result.scalars().all()
    return {
        "source": "DGT (Demo Dataset)",
        "connector": "dgt",
        "count": len(rows),
        "data": [
            {
                "id": r.id,
                "name": r.name,
                "sector": r.sector,
                "description": r.description,
                "partner_firms": r.partner_firms,
                "max_nsqf": r.max_nsqf,
            }
            for r in rows
        ],
    }
