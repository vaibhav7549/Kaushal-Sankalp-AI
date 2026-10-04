"""Kaushal Sankalp AI — FastAPI Application Entry Point."""

from __future__ import annotations

import json
import time
from contextlib import asynccontextmanager
from pathlib import Path

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.core.database import init_db, engine

settings = get_settings()
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB, optionally seed data."""
    logger.info("starting_app", project=settings.PROJECT_NAME, version=settings.VERSION)
    await init_db()

    if settings.SEED_ON_START:
        from app.seed import run_seed
        await run_seed()
        logger.info("seed_complete")

    logger.info(
        "providers_active",
        llm="gemini" if settings.has_gemini else "rule-based",
        speech="bhashini" if settings.has_bhashini else "browser",
        db=settings.DB_MODE,
    )

    yield

    await engine.dispose()
    logger.info("app_shutdown")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "AI-Enabled Career Counselling and Family Decision-Support Platform "
        "for Vocational Education — SIH 2026 PS SIH26241 by The BIG(O)"
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request timing middleware ───────────────────────────────────
@app.middleware("http")
async def add_timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Process-Time-Ms"] = str(elapsed)
    return response


# ── Health & Meta ───────────────────────────────────────────────
@app.get("/")
@app.get("/api/v1/health")
async def health():
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ps_id": settings.PS_ID,
        "team": settings.TEAM,
    }


@app.get("/api/v1/meta")
async def meta():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ps_id": settings.PS_ID,
        "team": settings.TEAM,
        "team_id": settings.TEAM_ID,
        "providers": {
            "llm": "gemini" if settings.has_gemini else "rule-based",
            "speech": "bhashini" if settings.has_bhashini else "browser",
            "db": settings.DB_MODE,
        },
        "data_label": "Demo Dataset",
        "disclosure": (
            "This is a hackathon prototype. DPI integrations are simulated "
            "with a dummy dataset in the same API shape. Outcome figures are "
            "indicative targets, not measured results."
        ),
    }


# ── Import and register API routers ────────────────────────────
from app.api.sessions import router as sessions_router
from app.api.chat import router as chat_router
from app.api.dpi import router as dpi_router
from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.escalation import router as escalation_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(sessions_router, prefix="/api/v1/sessions", tags=["Sessions"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(dpi_router, prefix="/api/v1/dpi", tags=["DPI Mock"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(escalation_router, prefix="/api/v1/escalations", tags=["Escalation"])


# ── Global error handler ───────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_error", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred.",
            "request_id": request.headers.get("X-Request-ID", ""),
        },
    )
