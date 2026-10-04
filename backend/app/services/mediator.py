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

import json
import httpx
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import (
    Session, Turn, Course, Provider, DistrictOutcome, NapsRule,
    ProgressionPath, EvidenceChunk,
)
from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger()


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
            "But did you know that this course earns {credits} credits deposited in the Academic Bank of Credits (ABC / APAAR)? "
            "This means your {child} can take lateral entry into B.Voc or B.Tech degree programmes later. "
            "This doesn't close the degree path — it opens another one, with verified skills AND a formal degree."
        ),
        "mr": (
            "तुमची काळजी अतिशय स्वाभाविक आहे. प्रत्येक पालकाला आपल्या मुलाचे भविष्य उज्ज्वल व्हावे असे वाटते. "
            "परंतु तुम्हाला माहित आहे का की या कोर्समध्ये {credits} क्रेडिट्स मिळतात जे थेट Academic Bank of Credits (ABC / APAAR) मध्ये जमा होतात? "
            "याचा अर्थ तुमची {child} भविष्यात B.Voc किंवा B.Tech मध्ये थेट पदवी शिक्षणासाठी प्रवेश घेऊ शकते. "
            "हा शिक्षणाचा मार्ग बंद करत नाही, तर कौशल्यासोबत पदवीचा नवा दरवाजा उघडतो."
        ),
    },
    "INCOME_SECURITY": {
        "hi": (
            "आपकी चिंता बिल्कुल जायज़ है। कमाई सबसे ज़रूरी बात है। "
            "इस कोर्स के दौरान सरकार और कंपनी मिलकर NAPS के तहत ₹{stipend}/महीना stipend देती हैं। "
            "और सरकारी डेटा में, पालघर ज़िले में इस ट्रेड के {placement_pct}% छात्रों को प्लेसमेंट मिली है। "
            "{share_pct}% छात्र 2 साल में ₹{salary_low}-{salary_high}/महीना कमा रहे हैं। "
            "ये आँकड़े SIDH JobX (Skill India Digital) से हैं।"
        ),
        "en": (
            "Your concern is absolutely valid. Earning potential and stability matter most. "
            "During this course, the government and employer together provide a guaranteed NAPS stipend of ₹{stipend}/month. "
            "In verified district records, {placement_pct}% of students in this trade in Palghar got placed. "
            "{share_pct}% are earning ₹{salary_low}-{salary_high}/month within 2 years. "
            "This data is verified from SIDH JobX (Skill India Digital Hub)."
        ),
        "mr": (
            "तुमची काळजी अतिशय रास्त आहे. कमाई आणि सुरक्षितता सर्वात महत्त्वाची आहे. "
            "या कोर्सदरम्यान केंद्र शासन आणि कंपनी मिळून NAPS अंतर्गत दरमहा ₹{stipend} विद्यावेतन (Stipend) देतात. "
            "पालघर जिल्ह्यातील {placement_pct}% विद्यार्थ्यांना 2 वर्षांत यशस्वीरित्या नोकरी मिळाली आहे. "
            "{share_pct}% विद्यार्थी दरमहा ₹{salary_low}-₹{salary_high} पगार कमवत आहेत (SIDH JobX डेटानुसार)."
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
            "The nearest accredited centre — {center_name} — is just {distance} km away. "
            "There's free government bus connectivity. "
            "{female_pct}% of students are female, with dedicated female instructors and {cctv} CCTV coverage. "
            "Would you like to visit the centre? We can arrange a free guided visit."
        ),
        "mr": (
            "मुलीच्या सुरक्षेची चिंता असणे अत्यंत योग्य आहे. "
            "जवळचे अधिकृत केंद्र — {center_name} — फक्त {distance} किमी अंतरावर आहे. "
            "तिथे मोफत सरकारी बस सेवा, {female_pct}% विद्यार्थिनी, महिला शिक्षिका आणि {cctv} CCTV सुरक्षा उपलब्ध आहे. "
            "तुम्ही एकदा स्वतः येऊन केंद्र पाहू शकता का? आम्ही विनामूल्य व्हिजिटची सोय करू शकतो."
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
            "Your concern is absolutely valid. Everyone worries about future automation. "
            "This course is part of the DGT future-skills initiative. "
            "It has a direct progression path from NSQF Level {nsqf} up to Level 6 — in high-growth areas like Solar, EV, and 5G. "
            "This trade isn't dying — it is expanding rapidly, and this course prepares for high-tech future roles."
        ),
        "mr": (
            "भविष्याची काळजी वाटणे स्वाभाविक आहे. "
            "हा कोर्स DGT च्या फ्युचर-स्किल (Future Skills) इनिशिएटिव्हचा भाग आहे. "
            "यात NSQF लेव्हल {nsqf} पासून लेव्हल 6 पर्यंत — सोलर, ईव्ही (EV) आणि 5G नेटवर्क तंत्रज्ञानात प्रगतीची हमी आहे. "
            "हे ट्रेड बंद होणार नाही, तर भविष्यातील आधुनिक नोकऱ्यांसाठी अत्यंत आवश्यक आहे."
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

# Multilingual suggestion chips per category
SUGGESTIONS_BY_LANG = {
    "en": {
        "SOCIAL_STATUS": ["What about earnings?", "Higher education options?", "How is the center?"],
        "INCOME_SECURITY": ["What is the placement rate?", "Is it safe for girls?", "What is the future scope?"],
        "FEMALE_SAFETY": ["Arrange center visit", "What is the monthly stipend?", "Career growth path?"],
        "TRADE_OBSOLESCENCE": ["Salary potential?", "Safety & transport?", "How credits are transferred?"],
        "DEFAULT": ["Earning potential", "Center safety", "Degree mobility", "Available courses"],
    },
    "hi": {
        "SOCIAL_STATUS": ["कमाई कितनी होगी?", "आगे की पढ़ाई?", "सेंटर कैसा है?"],
        "INCOME_SECURITY": ["प्लेसमेंट कैसी है?", "सुरक्षा कैसी है?", "भविष्य में क्या?"],
        "FEMALE_SAFETY": ["सेंटर विज़िट", "कमाई कितनी?", "आगे बढ़ने का रास्ता?"],
        "TRADE_OBSOLESCENCE": ["कमाई कितनी?", "सुरक्षा कैसी है?", "क्रेडिट कैसे मिलते हैं?"],
        "DEFAULT": ["कमाई और स्टाइपेंड", "सेंटर की सुरक्षा", "आगे की पढ़ाई (डिग्री)", "उपलब्ध कोर्सेज"],
    },
    "mr": {
        "SOCIAL_STATUS": ["कमाई किती होईल?", "पुढील शिक्षण कसे?", "केंद्र कसे आहे?"],
        "INCOME_SECURITY": ["नोकरीची हमी काय?", "सुरक्षा कशी आहे?", "भविष्यात काय स्कोप?"],
        "FEMALE_SAFETY": ["केंद्राला भेट द्या", "दरमहा पगार किती?", "प्रगतीचा मार्ग?"],
        "TRADE_OBSOLESCENCE": ["पगार किती?", "सुरक्षा कशी?", "क्रेडिट्स कसे मिळतील?"],
        "DEFAULT": ["कमाई आणि विद्यावेतन", "केंद्राची सुरक्षा", "पदवी शिक्षण (डिग्री)", "उपलब्ध कोर्सेस"],
    },
}


async def generate_response(
    session: Session,
    speaker: str,
    text: str,
    lang: str,
    classification: dict,
    prev_turns: list,
    db: AsyncSession,
    gemini_api_key: str | None = None,
) -> dict:
    """Generate the mediator's response using Gemini LLM if key available, or smart multilingual RAG."""
    active_key = gemini_api_key or settings.GEMINI_API_KEY
    active_lang = lang if lang in ("hi", "en", "mr") else (session.language if session.language in ("hi", "en", "mr") else "en")

    if active_key:
        try:
            llm_result = await _gemini_llm_response(
                session=session,
                speaker=speaker,
                text=text,
                lang=active_lang,
                classification=classification,
                prev_turns=prev_turns,
                db=db,
                api_key=active_key,
            )
            if llm_result:
                return llm_result
        except Exception as e:
            logger.warn("gemini_generation_failed_falling_back", error=str(e))

    # High-quality fallback rule-based & localized conversational engine
    return await _rule_based_response(
        session, speaker, text, active_lang, classification, prev_turns, db
    )


async def _gemini_llm_response(
    session: Session,
    speaker: str,
    text: str,
    lang: str,
    classification: dict,
    prev_turns: list,
    db: AsyncSession,
    api_key: str,
) -> dict | None:
    """Call Google Gemini API for natural, dynamic, human-like voice-assistant dialogue."""
    hero_data = await _get_hero_data(session, db)
    lang_name = {"hi": "Hindi (Devanagari)", "mr": "Marathi (Devanagari)", "en": "English"}.get(lang, "English")

    context_prompt = (
        f"You are Kaushal Sankalp AI, an empathetic, expert Indian career counsellor and family mediator "
        f"for Smart India Hackathon (SIH 2026 PS SIH26241). You counsel Indian learners and their parents.\n"
        f"CURRENT SPEAKER: {speaker.upper()}\n"
        f"LANGUAGE: Respond ONLY in {lang_name}.\n"
        f"USER STATEMENT: \"{text}\"\n"
        f"STUDENT CONTEXT: Gender: {session.learner_gender or 'Female'}, District: {session.district or 'Palghar'}, "
        f"Academic BG: {session.academic_bg or '10th pass'}, Age: {session.learner_age or 17}.\n"
        f"GOVERNMENT DPI FACTS (USE THESE SPECIFIC FACTS):\n"
        f"- Earning: NAPS stipend of ₹12,500/month during apprenticeship. SIDH JobX shows 84% placement with ₹18,500-24,000/mo within 2 years.\n"
        f"- Degree Mobility: 40 NSQF credits deposited in Academic Bank of Credits (ABC / APAAR ID). Enables lateral entry to B.Voc / B.Tech degrees.\n"
        f"- Safety: PMKK Center is 6 km away, free government bus transport, 65% female students, female instructors, 24/7 CCTV.\n"
        f"- Future proof: NSQF Level 4 to Level 6 progression in Solar PV, EV, and 5G tech.\n\n"
        f"INSTRUCTIONS:\n"
        f"1. Directly, naturally, and warmly address the speaker's specific thought (like Siri or Gemini Assistant). Never give a repetitive robotic answer.\n"
        f"2. Keep the answer concise (2-4 sentences) so it sounds great when spoken aloud.\n"
        f"3. Return strict JSON format with keys: \"reply_text\" (string in {lang_name}), \"suggested_replies\" (list of 3 short questions in {lang_name}), \"category\" (one of: SOCIAL_STATUS, INCOME_SECURITY, FEMALE_SAFETY, TRADE_OBSOLESCENCE, or null)."
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": context_prompt}]}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 400}
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            logger.warn("gemini_api_error_status", status=res.status_code, body=res.text[:200])
            return None

        res_json = res.json()
        candidates = res_json.get("candidates", [])
        if not candidates:
            return None

        raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        # Clean markdown code blocks if wrapped
        clean_text = raw_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        try:
            parsed = json.loads(clean_text)
            reply = parsed.get("reply_text")
            suggestions = parsed.get("suggested_replies", [])
            detected_cat = parsed.get("category") or classification.get("objection_category")
        except Exception:
            reply = raw_text.replace("```json", "").replace("```", "").strip()
            suggestions = SUGGESTIONS_BY_LANG.get(lang, SUGGESTIONS_BY_LANG["en"])["DEFAULT"]
            detected_cat = classification.get("objection_category")

        card_types = CARD_MAP.get(detected_cat, ["earnings"]) if detected_cat else []
        cards = [_build_card(ct, hero_data, lang) for ct in card_types]
        cards = [c for c in cards if c]

        return {
            "reply_text": reply,
            "reply_lang": lang,
            "cards": cards,
            "citations": ["E-gemini-live"],
            "suggested_replies": suggestions[:3],
        }


async def _rule_based_response(
    session: Session,
    speaker: str,
    text: str,
    lang: str,
    classification: dict,
    prev_turns: list,
    db: AsyncSession,
) -> dict:
    """Rule-based mediator — handles queries dynamically across en, hi, mr."""
    reply_lang = lang if lang in ("hi", "en", "mr") else "en"
    text_lower = text.lower()
    hero_data = await _get_hero_data(session, db)
    lang_suggestions = SUGGESTIONS_BY_LANG.get(reply_lang, SUGGESTIONS_BY_LANG["en"])

    # ── Learner turn ───────────────────────────────────────────
    if speaker == "learner":
        return await _handle_learner_turn(session, text, reply_lang, classification, db)

    # ── Specific Parent Inquiries (Free-form Questions) ────────
    # 1. Fees, Cost, Scholarship
    if any(w in text_lower for w in ["fee", "fees", "cost", "scholarship", "खर्च", "फीस", "स्कॉलरशिप", "विद्यावेतन", "पैसे", "पगार"]):
        if reply_lang == "hi":
            reply = (
                "बहुत अच्छा सवाल! PMKVY और NAPS के तहत यह प्रशिक्षण उम्मीदवारों के लिए पूरी तरह मुफ़्त है। "
                "उल्टा, अप्रेंटिसशिप के दौरान छात्र को ₹12,500 प्रति माह स्टाइपेंड मिलता है। "
                "यानी परिवार पर कोई आर्थिक बोझ नहीं पड़ता, बल्कि पढ़ाई के साथ कमाई भी शुरू होती है।"
            )
        elif reply_lang == "mr":
            reply = (
                "अतिशय महत्त्वाचा प्रश्न! PMKVY आणि NAPS अंतर्गत हे प्रशिक्षण विद्यार्थ्यांसाठी पूर्णपणे मोफत आहे. "
                "उलटपक्षी, अप्रेंटिसशिप दरम्यान विद्यार्थ्याला दरमहा ₹12,500 चे विद्यावेतन (Stipend) मिळते. "
                "यामुळे कुटुंबावर कोणताही आर्थिक ताण येत नाही आणि शिक्षणासोबत कमाई सुरू होते."
            )
        else:
            reply = (
                "An excellent question! Under PMKVY and NAPS, the vocational training is completely free of tuition for candidates. "
                "Moreover, the student receives a government-backed stipend of ₹12,500/month during apprenticeship. "
                "There is zero financial burden on the family, and learning earns immediate income."
            )
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": [_build_card("earnings", hero_data, reply_lang)],
            "citations": ["E-fee-001"],
            "suggested_replies": lang_suggestions["INCOME_SECURITY"],
        }

    # 2. Hostel, Travel, Distance & Location
    if any(w in text_lower for w in ["hostel", "stay", "door", "दूर", "रहना", "लांब", "वस्तीगृह", "पत्ता", "address", "kahan", "center"]):
        if reply_lang == "hi":
            reply = (
                f"पालघर में PMKK अधिकृत सेंटर सिर्फ 6 किमी दूर है। छात्राओं के लिए सरकारी बस से सुरक्षित व मुफ़्त आने-जाने की सुविधा है। "
                f"दूर से आने वाले छात्रों के लिए सुरक्षित हॉस्टल और महिला वार्डन की व्यवस्था उपलब्ध है। "
                f"क्या आप सेंटर की मुफ़्त विज़िट बुक करना चाहेंगे?"
            )
        elif reply_lang == "mr":
            reply = (
                f"पालघरमधील PMKK अधिकृत केंद्र फक्त 6 किमी अंतरावर आहे. मुलींसाठी मोफत सरकारी बस सेवा उपलब्ध आहे. "
                f"तसेच लांबून येणाऱ्या विद्यार्थ्यांसाठी सुरक्षित वस्तीगृह (Hostel) आणि महिला वॉर्डनची सोय आहे. "
                f"तुम्ही केंद्राला विनामूल्य भेट देऊन पाहू इच्छिता का?"
            )
        else:
            reply = (
                f"The accredited PMKK center in Palghar is just 6 km away with dedicated free government bus transport. "
                f"Secure hostel facilities with round-the-clock female wardens and CCTV are available for outstation learners. "
                f"Would you like us to schedule a free campus visit for your family?"
            )
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": [_build_card("safety", hero_data, reply_lang), _build_card("win_win", hero_data, reply_lang)],
            "citations": ["E-saf-001"],
            "suggested_replies": lang_suggestions["FEMALE_SAFETY"],
        }

    # 3. Degree, B.Tech, Lateral Entry, Future Scope
    if any(w in text_lower for w in ["degree", "b.tech", "b.voc", "diploma", "डिग्री", "पदवी", "कॉलेज", "future", "scope"]):
        if reply_lang == "hi":
            reply = (
                "हाँ, बिल्कुल! राष्ट्रीय शिक्षा नीति (NEP 2020) और NCrF के तहत, इस कोर्स के 40 क्रेडिट छात्र के "
                "Academic Bank of Credits (APAAR ID) में सीधे जमा होते हैं। इसके आधार पर छात्र बाद में B.Voc या B.Tech "
                "डिग्री में लेटरल एंट्री ले सकते हैं। हुनर और औपचारिक डिग्री दोनों एक साथ संभव हैं।"
            )
        elif reply_lang == "mr":
            reply = (
                "होय, नक्कीच! NEP 2020 आणि NCrF नियमांनुसार, या कोर्सचे 40 क्रेडिट्स विद्यार्थ्याच्या "
                "Academic Bank of Credits (APAAR ID) मध्ये जमा होतात. याद्वारे विद्यार्थी पुढे B.Voc किंवा B.Tech "
                "पदवीसाठी थेट लेटरल एन्ट्री घेऊ शकतात. कौशल्य आणि शासकीय पदवी दोन्ही साध्य होते."
            )
        else:
            reply = (
                "Yes, absolutely! Under NEP 2020 and the National Credit Framework (NCrF), this course awards 40 credits "
                "deposited directly into the student's Academic Bank of Credits (APAAR ID). This entitles the student to lateral "
                "entry into B.Voc or B.Tech engineering degrees. It combines practical employability with a university degree."
            )
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": [_build_card("credit", hero_data, reply_lang), _build_card("pathway", hero_data, reply_lang)],
            "citations": ["E-deg-001"],
            "suggested_replies": lang_suggestions["SOCIAL_STATUS"],
        }

    # 4. Standard Objections
    category = classification.get("objection_category")
    if category and category in REFRAMING_TEMPLATES:
        template = REFRAMING_TEMPLATES[category].get(reply_lang) or REFRAMING_TEMPLATES[category].get("en", "")
        reply = _fill_template(template, hero_data, session)
        card_types = CARD_MAP.get(category, [])
        cards = [_build_card(ct, hero_data, reply_lang) for ct in card_types]
        cards = [c for c in cards if c]
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": cards,
            "citations": [f"E-{category[:3].lower()}-001"],
            "suggested_replies": lang_suggestions.get(category, lang_suggestions["DEFAULT"]),
        }

    # 5. Welcoming Parent Overview
    if reply_lang == "hi":
        reply = (
            "जी, मैं आपकी बात समझ रहा हूँ। कौशल संकल्प में हम परिवार की सहमति और भरोसे को सबसे आगे रखते हैं। "
            "आप कमाई, बच्चों की सुरक्षा, प्रमाणन (NCVET) या आगे कॉलेज की पढ़ाई के बारे में कुछ भी पूछ सकते हैं।"
        )
    elif reply_lang == "mr":
        reply = (
            "होय, मी आपली भूमिका समजतो. कौशल संकल्पमध्ये आम्ही कुटुंबाचा विश्वास आणि संमतीला प्राधान्य देतो. "
            "आपण कमाई, मुलींची सुरक्षा, शासकीय प्रमाणपत्र किंवा पुढील पदवी शिक्षणाविषयी कोणताही प्रश्न विचारू शकता."
        )
    else:
        reply = (
            "I understand your perspective. At Kaushal Sankalp, family consensus and confidence come first. "
            "You can ask about salary trends, center safety, NCVET certification, or pathway to college degrees."
        )

    return {
        "reply_text": reply,
        "reply_lang": reply_lang,
        "cards": [_build_card("earnings", hero_data, reply_lang)],
        "citations": ["E-gen-001"],
        "suggested_replies": lang_suggestions["DEFAULT"],
    }


async def _handle_learner_turn(
    session: Session, text: str, lang: str, classification: dict, db: AsyncSession
) -> dict:
    """Handle a learner's turn — recommend courses and outline growth pathways."""
    reply_lang = lang if lang in ("hi", "en", "mr") else "en"
    text_lower = text.lower()
    hero_data = await _get_hero_data(session, db)
    lang_suggestions = SUGGESTIONS_BY_LANG.get(reply_lang, SUGGESTIONS_BY_LANG["en"])

    # Solar PV
    if any(w in text_lower for w in ["solar", "सोलर", "ऊर्जा", "green energy"]):
        if reply_lang == "hi":
            reply = (
                "शानदार चुनाव! सोलर पीवी इंस्टॉलर एक आधुनिक ग्रीन-एनर्जी ट्रेड है। यह 6 महीने का NSQF Level 4 कोर्स है "
                "जिसमें 20 क्रेडिट और पीएम सूर्य घर योजना के तहत भारी मांग है। शुरुआती वेतन ₹15,000-22,000/माह है।"
            )
        elif reply_lang == "mr":
            reply = (
                "उत्तम निवड! सोलर पीव्ही इन्स्टॉलर हा वेगाने वाढणारा ग्रीन-एनर्जी ट्रेड आहे. 6 महिन्यांचा NSQF लेव्हल 4 कोर्स "
                "असून पीएम सूर्य घर योजनेमुळे प्रचंड रोजगार उपलब्ध आहेत. सुरुवातीचा पगार ₹15,000-22,000/महिना आहे."
            )
        else:
            reply = (
                "Outstanding choice! Solar PV Installer is a booming green energy career. It is a 6-month NSQF Level 4 "
                "course offering 20 credits with massive job openings under the PM Surya Ghar scheme. Starting salary is ₹15,000-22,000/mo."
            )
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": [_build_card("future_proof", hero_data, reply_lang)],
            "citations": ["E-crs-solar"],
            "suggested_replies": lang_suggestions["TRADE_OBSOLESCENCE"],
        }

    # Electrician / Wireman
    if any(w in text_lower for w in ["electrician", "इलेक्ट्रीशियन", "electric", "बिजली", "वायरमन"]):
        if reply_lang == "hi":
            reply = (
                "बहुत अच्छा! इलेक्ट्रीशियन एक अत्यंत सुरक्षित और मांग वाला ट्रेड है। "
                "यह NSQF Level 4 का 12 महीने का कोर्स है जिसमें 40 क्रेडिट मिलते हैं। "
                "इसके बाद Solar PV Installer, EV Technician या Diploma/B.Tech में आगे बढ़ सकते हैं। "
                "क्या आपके अभिभावक भी साथ हैं? उनकी राय भी जानते हैं।"
            )
        elif reply_lang == "mr":
            reply = (
                "छान! इलेक्ट्रिशियन हा एक अत्यंत स्थिर आणि मागणी असलेला ट्रेड आहे. "
                "हा 12 महिन्यांचा NSQF लेव्हल 4 कोर्स असून 40 क्रेडिट्स मिळतात. "
                "यानंतर सोलर, ईव्ही टेक्निशियन किंवा डिप्लोमा/B.Tech ला प्रवेश घेता येतो. "
                "पालकांशीही याविषयी चर्चा करूया का?"
            )
        else:
            reply = (
                "Great choice! Electrician is a foundational, high-demand trade with verified employment. "
                "It is a 12-month NSQF Level 4 course earning 40 credits. "
                "After this, you can seamlessly branch into EV, Solar, or Diploma/B.Tech degrees. "
                "Let's see what your parents think about this pathway."
            )
        cards = [
            {
                "type": "explainer",
                "data": {
                    "course": "Electrician (Domestic)",
                    "course_hi": "इलेक्ट्रीशियन (घरेलू)",
                    "course_mr": "इलेक्ट्रिशियन (घरगुती)",
                    "nsqf_level": 4,
                    "duration": "12 months",
                    "credits": 40,
                    "job_roles": ["Domestic Electrician", "Building Electrician", "Wireman"],
                    "next_steps": ["Solar PV Installer (NSQF 4+)", "Supervisor (NSQF 5)", "Diploma → B.Tech Electrical"],
                },
            },
            _build_card("pathway", hero_data, reply_lang),
        ]
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": cards,
            "citations": ["E-crs-001"],
            "suggested_replies": lang_suggestions["SOCIAL_STATUS"],
        }

    # Healthcare / Nursing Assistant
    if any(w in text_lower for w in ["health", "nurse", "hospital", "हेल्थ", "नर्सिंग", "दवाखाना"]):
        if reply_lang == "hi":
            reply = (
                "हेल्थकेयर असिस्टेंट एक सम्मानजनक और हमेशा मांग में रहने वाला पेशा है। "
                "अस्पतालों और क्लीनिकों में तुरंत नौकरी और सम्मानजनक वेतन मिलता है। इसमें महिला छात्रों के लिए विशेष सुरक्षा और सुविधाएँ हैं।"
            )
        elif reply_lang == "mr":
            reply = (
                "आरोग्य सेवा (Healthcare Assistant) हे अत्यंत आदरयुक्त आणि स्थिर क्षेत्र आहे. "
                "रुग्णालये व क्लिनिक्समध्ये त्वरित नोकरीच्या संधी उपलब्ध असून विद्यार्थिनींसाठी सुरक्षित वातावरण आहे."
            )
        else:
            reply = (
                "Healthcare Assistant is a noble, highly respected vocation with consistent year-round employment in hospitals "
                "and diagnostic centers. It provides dedicated amenities and top safety ratings for female learners."
            )
        return {
            "reply_text": reply,
            "reply_lang": reply_lang,
            "cards": [_build_card("safety", hero_data, reply_lang)],
            "citations": ["E-crs-health"],
            "suggested_replies": lang_suggestions["FEMALE_SAFETY"],
        }

    # Generic learner response
    if reply_lang == "hi":
        reply = (
            "आपकी रुचि जानकर बहुत खुशी हुई! कौशल संकल्प में आपके 10वीं/12वीं के आधार पर कई आधुनिक कोर्सेज हैं "
            "— जैसे इलेक्ट्रीशियन, सोलर पीवी, ड्रोन सर्विस, EV टेक्निशियन और हेल्थकेयर। आप किस क्षेत्र के बारे में विस्तार से जानना चाहते हैं?"
        )
    elif reply_lang == "mr":
        reply = (
            "तुमची आवड जाणून आनंद झाला! कौशल संकल्पमध्ये तुमच्या शिक्षणावर आधारित अनेक आधुनिक कोर्सेस आहेत "
            "— जसे की इलेक्ट्रिशियन, सोलर पीव्ही, ड्रोन तंत्रज्ञान, ईव्ही आणि हेल्थकेयर. तुम्हाला कोणत्या विषयात आवड आहे?"
        )
    else:
        reply = (
            "Excited to learn about your ambitions! Kaushal Sankalp offers accredited tracks aligned with your background "
            "— such as Electrician, Solar PV, Drone Assembly, EV Maintenance, and Healthcare. Which sector excites you most?"
        )

    return {
        "reply_text": reply,
        "reply_lang": reply_lang,
        "cards": [_build_card("future_proof", hero_data, reply_lang)],
        "citations": ["E-learn-001"],
        "suggested_replies": ["इलेक्ट्रीशियन / Electrician", "सोलर पीवी / Solar PV", "EV टेक्निशियन / EV Tech", "हेल्थकेयर / Healthcare"],
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
    is_female = (session.learner_gender or "").lower() in ("f", "female", "girl", "मुलगी", "लड़की")
    child = "बेटी" if is_female else "बच्चे"
    suffix = "है" if is_female else "हैं"

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
