"""R_s Engine — Parental Resistance Score.

R_s = clamp(w1*NegSentiment + w2*ObjDensity + w3*Repetition + w4*Unresolved + w5*Intensity, 0, 1)
Over the last N=8 parent turns (configurable).
"""

from __future__ import annotations

import yaml
from pathlib import Path

# Default weights (also in config.yaml)
DEFAULT_WEIGHTS = {
    "neg_sentiment": 0.30,
    "obj_density": 0.20,
    "repetition": 0.20,
    "unresolved": 0.20,
    "intensity": 0.10,
}

DEFAULT_WINDOW = 8


def _load_config() -> dict:
    """Load weights from config.yaml if available."""
    config_path = Path(__file__).parent / "config.yaml"
    if config_path.exists():
        with open(config_path) as f:
            return yaml.safe_load(f)
    return {"weights": DEFAULT_WEIGHTS, "window": DEFAULT_WINDOW}


def compute_rs(
    prev_turns: list,
    current_classification: dict,
    config: dict | None = None,
) -> dict:
    """Compute the Parental Resistance Score from recent parent turns.

    Args:
        prev_turns: List of Turn objects (most recent first)
        current_classification: Classification of current turn
        config: Override config (weights, window)

    Returns:
        dict with value, components, explanation, delta, band
    """
    cfg = config or _load_config()
    weights = cfg.get("weights", DEFAULT_WEIGHTS)
    window = cfg.get("window", DEFAULT_WINDOW)

    # Filter to parent turns only, take the window
    parent_turns = [t for t in prev_turns if getattr(t, "speaker", None) == "parent"]
    recent = parent_turns[:window]

    # Add current classification as a virtual turn
    virtual_turns = recent  # current turn hasn't been saved yet

    if not virtual_turns and not current_classification:
        return _make_result(0.0, {}, None)

    # ── Component 1: Negative Sentiment ────────────────────────
    sentiments = []
    for t in virtual_turns:
        s = getattr(t, "sentiment", None)
        if s is not None:
            sentiments.append(max(0, -s))
    if current_classification.get("sentiment") is not None:
        sentiments.append(max(0, -current_classification["sentiment"]))
    neg_sentiment = sum(sentiments) / max(len(sentiments), 1)

    # ── Component 2: Objection Density ─────────────────────────
    total_parent = len(virtual_turns) + 1  # +1 for current
    obj_count = sum(
        1 for t in virtual_turns
        if getattr(t, "objection_category", None)
    )
    if current_classification.get("objection_category"):
        obj_count += 1
    obj_density = obj_count / max(total_parent, 1)

    # ── Component 3: Repetition ────────────────────────────────
    # Categories that re-appear after a card was shown for them
    categories_reframed = set()
    categories_repeated = set()
    for t in reversed(virtual_turns):
        cat = getattr(t, "objection_category", None)
        cards = getattr(t, "cards_shown", []) or []
        if cards and cat:
            categories_reframed.add(cat)
        if cat and cat in categories_reframed:
            categories_repeated.add(cat)
    if current_classification.get("objection_category") in categories_reframed:
        categories_repeated.add(current_classification["objection_category"])

    all_categories = set()
    for t in virtual_turns:
        cat = getattr(t, "objection_category", None)
        if cat:
            all_categories.add(cat)
    if current_classification.get("objection_category"):
        all_categories.add(current_classification["objection_category"])

    repetition = len(categories_repeated) / max(len(all_categories), 1)

    # ── Component 4: Unresolved ────────────────────────────────
    # Categories raised but not followed by positive sentiment
    resolved = set()
    for t in virtual_turns:
        s = getattr(t, "sentiment", 0) or 0
        if s > 0:
            cat = getattr(t, "objection_category", None)
            if cat:
                resolved.add(cat)
    unresolved = len(all_categories - resolved) / max(len(all_categories), 1)

    # ── Component 5: Intensity ─────────────────────────────────
    intensities = []
    for t in virtual_turns:
        i = getattr(t, "intensity", None)
        if i is not None:
            intensities.append(i)
    if current_classification.get("intensity") is not None:
        intensities.append(current_classification["intensity"])
    mean_intensity = sum(intensities) / max(len(intensities), 1)

    # ── Weighted sum ───────────────────────────────────────────
    raw = (
        weights["neg_sentiment"] * neg_sentiment
        + weights["obj_density"] * obj_density
        + weights["repetition"] * repetition
        + weights["unresolved"] * unresolved
        + weights["intensity"] * mean_intensity
    )
    value = max(0.0, min(1.0, raw))

    components = {
        "neg_sentiment": round(neg_sentiment, 3),
        "obj_density": round(obj_density, 3),
        "repetition": round(repetition, 3),
        "unresolved": round(unresolved, 3),
        "intensity": round(mean_intensity, 3),
    }

    # Find previous R_s for delta
    prev_rs = None
    for t in virtual_turns:
        rv = getattr(t, "rs_value", None)
        if rv is not None:
            prev_rs = rv
            break
    delta = round(value - prev_rs, 3) if prev_rs is not None else None

    return _make_result(round(value, 3), components, delta)


def _make_result(value: float, components: dict, delta: float | None) -> dict:
    """Build the R_s result dict."""
    if value <= 0.40:
        band = "open"
    elif value <= 0.75:
        band = "concerned"
    else:
        band = "high_friction"

    # Top contributing factors
    factors = []
    if components:
        sorted_components = sorted(components.items(), key=lambda x: x[1], reverse=True)
        factor_labels = {
            "neg_sentiment": "Negative sentiment in responses",
            "obj_density": "Frequent objections raised",
            "repetition": "Repeated concerns after reframing",
            "unresolved": "Unresolved objection categories",
            "intensity": "Emphatic refusal markers",
        }
        factors = [factor_labels.get(k, k) for k, v in sorted_components[:3] if v > 0]

    explanation = "; ".join(factors) if factors else "Low resistance"

    return {
        "value": value,
        "components": components,
        "explanation": explanation,
        "delta": delta,
        "band": band,
        "factors": factors,
    }


def should_offer_escalation(
    current_rs: float,
    prev_rs: float | None,
    distress: bool,
    consecutive_high: int = 0,
) -> bool:
    """Determine if escalation should be offered.

    Rules (with hysteresis):
    - 2 consecutive turns > 0.75 → offer
    - 1 turn > 0.85 → offer
    - distress flag → always offer
    """
    if distress:
        return True
    if current_rs > 0.85:
        return True
    if current_rs > 0.75 and consecutive_high >= 1:
        return True
    return False
