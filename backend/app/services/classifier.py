"""Objection, sentiment, and distress classifier.

Rule-based with bilingual keyword/regex sets (Hindi/Hinglish/English).
Handles the golden path deterministically — no ML model needed.
"""

from __future__ import annotations

import re


# ── Keyword sets (Devanagari + Romanised Hinglish + English) ────

SOCIAL_STATUS_KEYWORDS = [
    "iti", "fail", "इज़्ज़त", "izzat", "log kya kahenge", "लोग क्या कहेंगे",
    "सरकारी नौकरी", "sarkari naukri", "degree", "डिग्री", "ba", "बीए",
    "kamzor", "कमज़ोर", "weak", "lower", "status", "prestige", "respect",
    "sharam", "शर्म", "society", "समाज", "acchi padhai", "अच्छी पढ़ाई",
    "engineer", "doctor", "इंजीनियर", "डॉक्टर",
]

INCOME_KEYWORDS = [
    "paisa", "पैसा", "salary", "तनख्वाह", "tankhwah", "kam milta", "कम मिलता",
    "gig", "गिग", "income", "आमदनी", "kamai", "कमाई", "earning", "pay",
    "wage", "mazdoori", "मज़दूरी", "money", "paise", "पैसे", "mehnat",
    "मेहनत", "low pay", "kitna milega", "कितना मिलेगा",
]

FEMALE_SAFETY_KEYWORDS = [
    "beti", "बेटी", "ladki", "लड़की", "door", "दूर", "safe", "सुरक्षा",
    "suraksha", "akeli", "अकेली", "hostel", "हॉस्टल", "raat", "रात",
    "night", "daughter", "girl", "safety", "far", "alone", "travel",
    "bus", "transport", "cctv", "security", "dur", "bhejne",
    "भेजने", "female", "women", "mahila", "महिला",
]

OBSOLESCENCE_KEYWORDS = [
    "purana", "पुराना", "khatam", "ख़त्म", "machine le legi", "मशीन ले लेगी",
    "ai", "robot", "future", "भविष्य", "outdated", "old", "replaced",
    "automation", "digital", "technology", "tech", "naya zamana",
    "नया ज़माना", "chalta nahi", "चलता नहीं",
]

DISTRESS_KEYWORDS = [
    "help", "मदद", "madad", "dar lagta", "डर लगता", "harassment", "उत्पीड़न",
    "violence", "हिंसा", "crisis", "emergency", "danger", "khatara", "ख़तरा",
    "suicide", "depression", "financial crisis", "barbad", "बर्बाद",
    "pareshan", "परेशान", "tang", "तंग",
]

INTENSITY_MARKERS = [
    "never", "no way", "नहीं", "कभी नहीं", "kabhi nahi", "bilkul nahi",
    "बिल्कुल नहीं", "impossible", "namumkin", "नामुमकिन", "refused",
    "nahi nahi", "नहीं नहीं", "no no", "absolutely not",
]


def _score_keywords(text: str, keywords: list[str]) -> float:
    """Count keyword hits, normalised to 0..1."""
    text_lower = text.lower()
    hits = sum(1 for kw in keywords if kw.lower() in text_lower)
    return min(hits / max(len(keywords) * 0.1, 1), 1.0)


def _detect_category(text: str) -> str | None:
    """Return the dominant objection category or None."""
    scores = {
        "SOCIAL_STATUS": _score_keywords(text, SOCIAL_STATUS_KEYWORDS),
        "INCOME_SECURITY": _score_keywords(text, INCOME_KEYWORDS),
        "FEMALE_SAFETY": _score_keywords(text, FEMALE_SAFETY_KEYWORDS),
        "TRADE_OBSOLESCENCE": _score_keywords(text, OBSOLESCENCE_KEYWORDS),
    }
    top = max(scores, key=scores.get)
    if scores[top] > 0.05:
        return top
    return None


def _detect_sentiment(text: str) -> float:
    """Simple sentiment: -1 (negative) to +1 (positive)."""
    text_lower = text.lower()
    neg_words = [
        "नहीं", "nahi", "no", "bad", "बुरा", "problem", "issue",
        "worry", "चिंता", "fear", "डर", "don't", "won't", "can't",
        "कम", "low", "poor", "worst", "terrible",
    ]
    pos_words = [
        "हाँ", "haan", "yes", "good", "अच्छा", "okay", "ठीक",
        "theek", "great", "better", "sure", "agree", "सही",
        "samajh", "समझ", "interested", "like",
    ]
    neg = sum(1 for w in neg_words if w in text_lower)
    pos = sum(1 for w in pos_words if w in text_lower)
    if neg + pos == 0:
        return 0.0
    return round((pos - neg) / (pos + neg), 2)


def _detect_intensity(text: str) -> float:
    """Measure emphatic markers, normalised 0..1."""
    text_lower = text.lower()
    hits = sum(1 for m in INTENSITY_MARKERS if m.lower() in text_lower)
    # Check for repeated negations
    nahi_count = text_lower.count("नहीं") + text_lower.count("nahi")
    if nahi_count >= 2:
        hits += 2
    # Check for exclamation marks
    hits += text.count("!")
    return min(hits / 5.0, 1.0)


def _detect_distress(text: str) -> bool:
    """Detect distress signals requiring immediate human escalation."""
    text_lower = text.lower()
    return any(kw.lower() in text_lower for kw in DISTRESS_KEYWORDS)


def classify_turn(text: str, lang: str, speaker: str) -> dict:
    """Classify a conversation turn.

    Returns:
        dict with keys: objection_category, sentiment, intensity, distress, intent
    """
    result = {
        "objection_category": None,
        "sentiment": _detect_sentiment(text),
        "intensity": _detect_intensity(text),
        "distress": _detect_distress(text),
        "intent": "general",
    }

    if speaker == "parent":
        result["objection_category"] = _detect_category(text)
        if result["objection_category"]:
            result["intent"] = "objection"
    elif speaker == "learner":
        # Detect interest intent
        interest_words = [
            "करना", "karna", "want", "course", "कोर्स", "सीखना",
            "seekhna", "learn", "interested", "electrician", "इलेक्ट्रीशियन",
            "solar", "सोलर",
        ]
        if any(w.lower() in text.lower() for w in interest_words):
            result["intent"] = "interest"

    return result
