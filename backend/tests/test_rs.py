"""Tests for R_s Engine."""

import pytest
from app.rscore.engine import compute_rs, should_offer_escalation
from app.models import Turn

def test_rs_golden_path():
    """Test the exact golden path scenario."""
    # 1. Learner expresses interest
    # 2. Parent objects on STATUS
    t1 = Turn(speaker="parent", sentiment=-0.2, objection_category="SOCIAL_STATUS", intensity=0.3)
    rs1 = compute_rs([t1], {"sentiment": -0.2, "objection_category": "SOCIAL_STATUS", "intensity": 0.3})
    
    # 3. Parent objects on INCOME
    t2 = Turn(speaker="parent", sentiment=-0.4, objection_category="INCOME_SECURITY", intensity=0.5, cards_shown=["earnings"])
    rs2 = compute_rs([t2, t1], {"sentiment": -0.4, "objection_category": "INCOME_SECURITY", "intensity": 0.5})
    
    assert rs2["value"] > rs1["value"]
    
def test_hysteresis():
    assert should_offer_escalation(0.80, 0.60, False, 1) == True
    assert should_offer_escalation(0.86, 0.60, False, 0) == True
    assert should_offer_escalation(0.50, 0.40, True, 0) == True
