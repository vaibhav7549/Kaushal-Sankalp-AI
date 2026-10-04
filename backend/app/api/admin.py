"""Admin Dashboard API."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db

router = APIRouter()

@router.get("/kpis")
async def get_kpis(db: AsyncSession = Depends(get_db)):
    """High-level KPIs for the admin dashboard."""
    return {
        "total_sessions": 6241,
        "families_engaged": 5980,
        "average_pri": 0.42,
        "escalation_rate": 12.5,
        "counsellor_time_saved_hours": 3120,
    }

@router.get("/geo/pri")
async def get_geo_pri(db: AsyncSession = Depends(get_db)):
    """PRI Heatmap data."""
    return {
        "districts": [
            {
                "id": "D-01",
                "name": "Palghar",
                "state": "Maharashtra",
                "lat": 19.696,
                "lng": 72.769,
                "pri": 0.65,
                "volume": 342,
                "driver_mix": {
                    "SOCIAL_STATUS": 20,
                    "INCOME_SECURITY": 30,
                    "FEMALE_SAFETY": 40,
                    "TRADE_OBSOLESCENCE": 10,
                }
            }
        ]
    }
