"""Mediative Dialogue Engine — the core AI counsellor logic.

Implements the mediation protocol:
1. Acknowledge concern respectfully
2. Reconcile learner aspirations with parent fears
3. Present local evidence from tools/RAG
4. Offer win-win options
5. Ask ONE gentle question

Uses rule-based provider by default, upgrades to Gemini when key is present.
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import (
    Session, Turn, Course, Provider, DistrictOutcome, NapsRule,
    ProgressionPath, EvidenceChunk,
)
from app.config import get_settings

settings = get_settings()


# ── Reframing templates (filled dynamically per district+course) ─

REFRAMING_TEMPLATES = {
    "SOCIAL_STATUS": {
        "hi": (
            "आपकी चिंता बिल्कुल जायज़ है। हर माँ-बाप अपने बच्चे के लिए सबसे अच्छा चाहते हैं। "
            "लेकिन क्या आप जानते हैं कि इस कोर्स में {credits} क्रेडिट मिलते हैं जो Academic Bank of Credits (ABC) में जमा होते हैं? "
            "इसका मतलब है कि आपकी {child} आगे B.Voc या B.Tech में lateral entry ले सकती {suffix}। "
            "यह डिग्री का रास्ता बंद नहीं करता, बल्कि एक और रास्ता खोलता है — हुनर के साथ डिग्री भी।"
        ),
        "en": (
            "Your concern is completely valid. Every parent wants the best for their child. "
            "But did you know that this course earns {credits} credits deposited in the Academic Bank of Credits (ABC)? "
            "This means your {child} can take lateral entry into B.Voc or B.Tech programmes later. "
            "This doesn't close the degree path — it opens another one, with skills AND a degree."
        ),
    },
    "INCOME_SECURITY": {
        "hi": (
            "आपकी चिंता बिल्कुल जायज़ है। कमाई सबसे ज़रूरी बात है। "
            "इस कोर्स के दौरान सरकार और कंपनी मिलकर NAPS के तहत ₹{stipend}/महीना stipend देती हैं। "
            "और डेमो डेटा में, पालघर ज़िले में इस ट्रेड के {placement_pct}% छात्रों को प्लेसमेंट मिली है। "
            "{share_pct}% छात्र 2 साल में ₹{salary_low}-{salary_high}/महीना कमा रहे हैं। "
            "ये आँकड़े SIDH JobX (Demo Dataset) से हैं।"
        ),
        "en": (
            "Your concern is absolutely valid. Earning potential matters most. "
            "During this course, the government and employer together provide a NAPS stipend of ₹{stipend}/month. "
            "In demo data, {placement_pct}% of students in this trade in Palghar district got placed. "
            "{share_pct}% are earning ₹{salary_low}-{salary_high}/month within 2 years. "
            "This data is from SIDH JobX (Demo Dataset)."
        ),
    },
    "FEMALE_SAFETY": {
        "hi": (
            "आपकी बेटी की सुरक्षा सबसे ज़रूरी है, और यह चिंता बिल्कुल सही है। "
            "सबसे नज़दीकी सेंटर — {center_name} — सिर्फ़ {distance} किलोमीटर दूर है। "
            "वहाँ सरकारी बस से मुफ़्त आना-जाना है। "
            "{female_pct}% छात्र लड़कियाँ हैं, महिला इंस्ट्रक्टर हैं, और {cctv} CCTV है। "
            "क्या आप एक बार सेंटर देखना चाहेंगे? हम विज़िट अरेंज कर सकते हैं।"
        ),
        "en": (
            "Your daughter's safety is the top priority, and this concern is completely valid. "
            "The nearest centre — {center_name} — is just {distance} km away. "
            "There's free government bus connectivity. "
            "{female_pct}% of students are female, there are female instructors, and {cctv} CCTV coverage. "
            "Would you like to visit the centre once? We can arrange a visit."
        ),
    },
    "TRADE_OBSOLESCENCE": {
        "hi": (
            "आपकी चिंता बिल्कुल जायज़ है। भविष्य की चिंता सबके मन में होती है। "
            "यह कोर्स DGT के future-skills initiative का हिस्सा है। "
            "इसमें NSQF Level {nsqf} से Level 6 तक का रास्ता है — Solar, EV, 5G जैसे नए क्षेत्रों में। "
            "यह ट्रेड ख़त्म नहीं हो रही, बल्कि तेज़ी से बदल रही है — और यह कोर्स उसी बदलाव के लिए तैयार करता है।"
        ),
        "en": (
            "Your concern is absolutely valid. Everyone worries about the future. "
            "This course is part of the DGT future-skills initiative. "
            "It has a progression path from NSQF Level {nsqf} up to Level 6 — into emerging areas like Solar, EV, 5G. "
            "This trade isn't dying — it's evolving rapidly, and this course prepares for that evolution."
        ),
    },
}

# Cards to show per objection category
CARD_MAP = {
    "SOCIAL_STATUS": ["credit", "pathway"],
    "INCOME_SECURITY": ["earnings", "placement"],
    "FEMALE_SAFETY": ["safety", "win_win"],
    "TRADE_OBSOLESCENCE": ["future_proof", "pathway"],
}

# Suggestion chips per category
SUGGESTION_MAP = {
    "SOCIAL_STATUS": ["कमाई कितनी होगी?", "आगे की पढ़ाई?", "सेंटर कैसा है?"],
    "INCOME_SECURITY": ["प्लेसमेंट कैसी है?", "सुरक्षा कैसी है?", "भविष्य में क्या?"],
    "FEMALE_SAFETY": ["सेंटर विज़िट", "कमाई कितनी?", "आगे बढ़ने का रास्ता?"],
    "TRADE_OBSOLESCENCE": ["कमाई कितनी?", "सुरक्षा कैसी है?", "क्रेडिट कैसे मिलते हैं?"],
    None: ["कमाई", "सुरक्षा", "आगे की पढ़ाई", "भविष्य"],
}


async def generate_response(
    session: Session,
    speaker: str,
    text: str,
    lang: str,
    classification: dict,
    prev_turns: list,
    db: AsyncSession,
) -> dict:
    """Generate the mediator's response using the mediation protocol.

    Returns dict with: reply_text, reply_lang, cards, citations, suggested_replies
    """
    # If Gemini is available, try LLM path (to be implemented in M2)
    # For now, always use rule-based for reliability
    return await _rule_based_response(
        session, speaker, text, lang, classification, prev_turns, db
    )


async def _rule_based_response(
    session: Session,
    speaker: str,
    text: str,
    lang: str,
    classification: dict,
    prev_turns: list,
    db: AsyncSession,
) -> dict:
    """Rule-based mediator — handles golden path deterministically."""
    reply_lang = lang if lang in ("hi", "en", "mr") else "hi"
    cards = []
    citations = []
    suggested_replies = SUGGESTION_MAP.get(classification.get("objection_category"), SUGGESTION_MAP[None])

    # ── Learner turn ───────────────────────────────────────────
    if speaker == "learner":
        return await _handle_learner_turn(session, text, lang, classification, db)

    # ── Parent turn with objection ─────────────────────────────
    category = classification.get("objection_category")
    if not category:
        # General parent response (no specific objection detected)
        if reply_lang == "hi":
            reply = (
                "जी, आपकी बात समझ आई। क्या आप बताएँगे कि आपको सबसे ज़्यादा "
                "किस बात की चिंता है — कमाई, सुरक्षा, या आगे की पढ़ाई?"
            )
        else:
            reply = (
                "I understand. Could you tell me what concerns you the most — "
                "earning potential, safety, or future education options?"
            )
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": [],
            "citations": [],
            "suggested_replies": ["कमाई", "सुरक्षा", "आगे की पढ़ाई", "भविष्य"],
        }

    # Get hero course data for Palghar/Electrician
    hero_data = await _get_hero_data(session, db)

    # Fill template with real data
    template = REFRAMING_TEMPLATES.get(category, {}).get(reply_lang, "")
    if not template:
        template = REFRAMING_TEMPLATES.get(category, {}).get("hi", "")
        reply_lang = "hi"

    reply = _fill_template(template, hero_data, session)

    # Build cards
    card_types = CARD_MAP.get(category, [])
    cards = [_build_card(ct, hero_data, reply_lang) for ct in card_types]
    cards = [c for c in cards if c]  # Remove None

    # Build citations
    citations = [f"E-{category[:3].lower()}-001"]

    return {
        "reply_text": reply,
        "reply_lang": reply_lang,
        "cards": cards,
        "citations": citations,
        "suggested_replies": SUGGESTION_MAP.get(category, SUGGESTION_MAP[None]),
    }


async def _handle_learner_turn(
    session: Session, text: str, lang: str, classification: dict, db: AsyncSession
) -> dict:
    """Handle a learner's turn — recommend courses, show explainer."""
    reply_lang = lang if lang in ("hi", "en") else "hi"

    # Check if they mention electrician/solar
    text_lower = text.lower()
    if any(w in text_lower for w in ["electrician", "इलेक्ट्रीशियन", "electric", "बिजली"]):
        if reply_lang == "hi":
            reply = (
                "बहुत अच्छा! इलेक्ट्रीशियन एक बेहतरीन ट्रेड है। "
                "यह NSQF Level 4 का 12 महीने का कोर्स है जिसमें 40 क्रेडिट मिलते हैं। "
                "इसके बाद Solar PV Installer, EV Technician या 5G Network Technician जैसे "
                "future-skill courses में आगे बढ़ सकती हैं। "
                "क्या आपके पापा भी सुन रहे हैं? उनकी राय भी ज़रूरी है।"
            )
        else:
            reply = (
                "Great choice! Electrician is an excellent trade. "
                "It's a 12-month NSQF Level 4 course earning 40 credits. "
                "After this, you can progress to Solar PV Installer, EV Technician, "
                "or 5G Network Technician in future-skill tracks. "
                "Is your father listening too? Their input is also important."
            )
        cards = [
            {
                "type": "explainer",
                "data": {
                    "course": "Electrician (Domestic)",
                    "course_hi": "इलेक्ट्रीशियन (घरेलू)",
                    "nsqf_level": 4,
                    "duration": "12 months",
                    "credits": 40,
                    "job_roles": [
                        "Domestic Electrician",
                        "Building Electrician",
                        "Wireman",
                    ],
                    "next_steps": [
                        "Solar PV Installer (NSQF 4+)",
                        "Supervisor (NSQF 5)",
                        "Diploma → B.Tech Electrical",
                    ],
                },
            },
            {
                "type": "pathway",
                "data": {
                    "steps": [
                        {"level": 3, "role": "Helper", "salary": "₹8,000-10,000"},
                        {"level": 4, "role": "Electrician", "salary": "₹12,000-18,000"},
                        {"level": 5, "role": "Supervisor", "salary": "₹20,000-30,000"},
                        {"level": 6, "role": "Foreman / B.Voc", "salary": "₹30,000-45,000"},
                    ],
                },
            },
        ]
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": cards,
            "citations": ["E-crs-001"],
            "suggested_replies": ["पापा से बात करें", "और कोर्स दिखाएँ", "सैलरी बताएँ"],
        }

    # Generic learner response
    if reply_lang == "hi":
        reply = (
            "अच्छा, आपकी रुचि जानकर खुशी हुई! "
            "आपकी पढ़ाई और रुचि के हिसाब से कुछ अच्छे कोर्स सुझा सकते हैं। "
            "क्या आप बताएँगे कि आपको किस तरह का काम पसंद है?"
        )
    else:
        reply = (
            "That's great to know! Based on your education and interests, "
            "I can suggest some good courses. "
            "Can you tell me what kind of work interests you?"
        )

    return {
        "reply_text": reply,
        "reply_lang": reply_lang,
        "cards": [],
        "citations": [],
        "suggested_replies": ["इलेक्ट्रीशियन", "सोलर", "ड्रोन", "EV", "CNC", "हेल्थकेयर"],
    }


async def _get_hero_data(session: Session, db: AsyncSession) -> dict:
    """Get the hero scenario data (Palghar / Electrician)."""
    # These are the exact golden-path values
    return {
        "stipend": "12,500",
        "stipend_raw": 12500,
        "placement_pct": 84,
        "share_pct": 82,
        "salary_low": "18,500",
        "salary_high": "24,000",
        "salary_low_raw": 18500,
        "salary_high_raw": 24000,
        "credits": 40,
        "notional_hours": 1200,
        "nsqf": 4,
        "center_name": "PMKK Palghar (Demo)",
        "distance": 6,
        "female_pct": 65,
        "cctv": "24/7",
        "free_transport": "सरकारी बस",
        "female_instructors": True,
        "course_name_hi": "इलेक्ट्रीशियन (घरेलू)",
        "course_name_en": "Electrician (Domestic)",
        "district": session.district or "Palghar",
    }


def _fill_template(template: str, data: dict, session: Session) -> str:
    """Fill a reframing template with real data."""
    child = "बेटी" if (session.learner_gender or "").lower() in ("f", "female") else "बच्चे"
    suffix = "है" if child == "बेटी" else "हैं"

    return template.format(
        stipend=data.get("stipend", "12,500"),
        placement_pct=data.get("placement_pct", 84),
        share_pct=data.get("share_pct", 82),
        salary_low=data.get("salary_low", "18,500"),
        salary_high=data.get("salary_high", "24,000"),
        credits=data.get("credits", 40),
        nsqf=data.get("nsqf", 4),
        center_name=data.get("center_name", "PMKK Palghar (Demo)"),
        distance=data.get("distance", 6),
        female_pct=data.get("female_pct", 65),
        cctv=data.get("cctv", "24/7"),
        child=child,
        suffix=suffix,
    )


def _build_card(card_type: str, data: dict, lang: str) -> dict | None:
    """Build a de-biasing card from data."""
    if card_type == "earnings":
        return {
            "type": "earnings",
            "data": {
                "stipend": data["stipend_raw"],
                "stipend_label": f"₹{data['stipend']}/month (NAPS)",
                "salary_p25": data["salary_low_raw"],
                "salary_median": 21000,
                "salary_p75": data["salary_high_raw"],
                "share_earning_band": data["share_pct"],
                "band_label": f"₹{data['salary_low']}-{data['salary_high']}",
                "period": "within 2 years",
                "source": "SIDH JobX (Demo Dataset)",
                "evidence_id": "E-inc-001",
            },
        }
    elif card_type == "placement":
        return {
            "type": "placement",
            "data": {
                "placement_pct": data["placement_pct"],
                "employers": [
                    "Demo Electricals Pvt Ltd",
                    "Green Energy Solutions (Demo)",
                    "Smart Home Services (Demo)",
                ],
                "vacancies": 156,
                "source": "SIDH JobX (Demo Dataset)",
                "evidence_id": "E-plc-001",
            },
        }
    elif card_type == "credit":
        return {
            "type": "credit",
            "data": {
                "notional_hours": data["notional_hours"],
                "credits": data["credits"],
                "formula": "1200 ÷ 30 = 40 credits",
                "lateral_entry": [
                    "B.Voc Electrical (NSQF 5-7)",
                    "Diploma in Electrical Engg.",
                    "B.Tech via lateral entry",
                ],
                "source": "NCrF / ABC (Demo Dataset)",
                "evidence_id": "E-crd-001",
            },
        }
    elif card_type == "pathway":
        return {
            "type": "pathway",
            "data": {
                "steps": [
                    {"level": 3, "role": "Helper", "salary": "₹8,000-10,000", "duration": "6 months"},
                    {"level": 4, "role": "Electrician", "salary": "₹12,000-18,000", "duration": "12 months"},
                    {"level": 5, "role": "Supervisor", "salary": "₹20,000-30,000", "duration": "18 months"},
                    {"level": 6, "role": "Foreman / B.Voc", "salary": "₹30,000-45,000", "duration": "2 years"},
                ],
                "source": "NCVET / NCrF (Demo Dataset)",
                "evidence_id": "E-pth-001",
            },
        }
    elif card_type == "safety":
        return {
            "type": "safety",
            "data": {
                "center_name": data["center_name"],
                "distance_km": data["distance"],
                "free_transport": data["free_transport"],
                "female_pct": data["female_pct"],
                "female_instructors": data["female_instructors"],
                "cctv": data["cctv"],
                "hostel": True,
                "source": "NCVET Provider Registry (Demo Dataset)",
                "evidence_id": "E-saf-001",
            },
        }
    elif card_type == "win_win":
        return {
            "type": "win_win",
            "data": {
                "options": [
                    {
                        "icon": "map-pin",
                        "title_hi": "सेंटर विज़िट",
                        "title_en": "Centre Visit",
                        "desc_hi": "एक बार जाकर देखें — लैब, क्लासरूम, सुविधाएँ",
                        "desc_en": "Visit once — see the lab, classroom, facilities",
                    },
                    {
                        "icon": "calendar",
                        "title_hi": "ट्रायल वीक",
                        "title_en": "Trial Week",
                        "desc_hi": "एक हफ़्ते की ट्रायल — कोई बंधन नहीं",
                        "desc_en": "One week trial — no commitment",
                    },
                    {
                        "icon": "users",
                        "title_hi": "महिला बैच",
                        "title_en": "Women-Only Batch",
                        "desc_hi": "सिर्फ़ लड़कियों का बैच उपलब्ध है",
                        "desc_en": "Women-only batch available",
                    },
                ],
                "evidence_id": "E-wwo-001",
            },
        }
    elif card_type == "future_proof":
        return {
            "type": "future_proof",
            "data": {
                "tracks": [
                    {"name": "Solar PV", "icon": "sun"},
                    {"name": "EV Service", "icon": "zap"},
                    {"name": "5G Network", "icon": "wifi"},
                    {"name": "Drone Service", "icon": "plane"},
                    {"name": "AI & Data", "icon": "brain"},
                ],
                "max_nsqf": 6,
                "partner_firms": ["Demo Solar Corp", "Demo EV Motors", "Demo Telecom"],
                "source": "DGT Future Skills (Demo Dataset)",
                "evidence_id": "E-fut-001",
            },
        }
    return None
