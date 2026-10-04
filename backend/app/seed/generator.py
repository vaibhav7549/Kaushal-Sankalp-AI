"""Database Seeder.

Generates the deterministic demo dataset (seed=26241) required for the prototype.
"""

from __future__ import annotations

import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import async_session
from app.config import get_settings
from app.models import Course, Provider, DistrictOutcome, NapsRule, ProgressionPath, FutureSkillTrack

settings = get_settings()
random.seed(settings.SEED_VALUE)

async def _seed_courses(db: AsyncSession):
    # Check if exists
    res = await db.execute(select(Course))
    if res.scalars().first():
        return

    courses = [
        Course(
            name_en="Electrician (Domestic)",
            name_hi="इलेक्ट्रीशियन (घरेलू)",
            sector="Electrical",
            nsqf_level=4,
            notional_hours=1200,
            credits=40,
            duration_months=12,
            entry_qual="10th pass",
            job_roles=["Domestic Electrician", "Building Electrician"],
            next_levels=["Supervisor", "Foreman"],
            future_skill=False,
        ),
        Course(
            name_en="Solar PV Installer",
            name_hi="सोलर पीवी इंस्टॉलर",
            sector="Green Energy",
            nsqf_level=4,
            notional_hours=600,
            credits=20,
            duration_months=6,
            entry_qual="10th pass / ITI",
            job_roles=["Solar Installer", "Maintenance Technician"],
            future_skill=True,
            dgt_track="Solar",
        ),
        Course(
            name_en="Healthcare Assistant",
            name_hi="हेल्थकेयर असिस्टेंट",
            sector="Healthcare",
            nsqf_level=3,
            notional_hours=1200,
            credits=40,
            duration_months=12,
            entry_qual="10th pass",
            job_roles=["General Duty Assistant", "Home Health Aide"],
        ),
    ]
    db.add_all(courses)
    await db.commit()


async def _seed_providers(db: AsyncSession):
    res = await db.execute(select(Provider))
    if res.scalars().first():
        return

    providers = [
        Provider(
            name="PMKK Palghar (Demo)",
            district="Palghar",
            state="Maharashtra",
            lat=19.696,
            lng=72.769,
            female_pct=65.0,
            female_instructor_count=4,
            cctv_rating="24/7",
            hostel=True,
            free_transport="सरकारी बस (Govt Bus)",
            distance_km=6.0,
            placement_pct=84.0,
            avg_starting_salary=18500,
            rating=4.8,
        )
    ]
    db.add_all(providers)
    await db.commit()


async def _seed_district_outcomes(db: AsyncSession):
    res = await db.execute(select(DistrictOutcome))
    if res.scalars().first():
        return

    res_course = await db.execute(select(Course).where(Course.name_en == "Electrician (Domestic)"))
    course = res_course.scalars().first()
    if not course:
        return

    outcomes = [
        DistrictOutcome(
            course_id=course.id,
            district="Palghar",
            state="Maharashtra",
            salary_p25=18500,
            salary_median=21000,
            salary_p75=24000,
            share_earning_band=0.82,
            placement_pct=84.0,
            employers=["Demo Electricals Pvt Ltd", "Smart Home Services"],
            vacancies=156,
            last_verified="2026-09-15",
            source="SIDH JobX (Demo Dataset)",
        )
    ]
    db.add_all(outcomes)
    await db.commit()


async def _seed_naps(db: AsyncSession):
    res = await db.execute(select(NapsRule))
    if res.scalars().first():
        return

    rules = [
        NapsRule(
            nsqf_level=4,
            stipend_min=7000,
            stipend_max=15000,
            employer_share_pct=75.0,
            govt_share_pct=25.0,
        )
    ]
    db.add_all(rules)
    await db.commit()

async def run_seed():
    """Run all seeders to populate the demo database."""
    async with async_session() as db:
        await _seed_courses(db)
        await _seed_providers(db)
        await _seed_district_outcomes(db)
        await _seed_naps(db)
        # Other seeders can be added as needed

