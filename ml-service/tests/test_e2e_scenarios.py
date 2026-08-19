"""
End-to-End Archetype and Scenario Testing Suite for Financial Planning ML System.
Validates 6 diverse customer profiles covering all financial life stages and edge cases.
"""

import sys
from pathlib import Path
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.risk_model import predict_risk_profile
from src.planning_engine import run_planning_engine


def test_archetype_1_young_low_debt_tech_pro():
    """
    Profile: 25yo, Software Engineer, high income (150k), low expenses (40k), zero debt, long horizon (20 yrs).
    Expected: Moderately Aggressive or Aggressive, high equity allocation (>55%), median Monte Carlo outcome achieves goal.
    """
    profile = {
        "age": 25,
        "occupation": "Software Engineer",
        "dependents": 0,
        "monthly_income": 150000,
        "monthly_expenses": 40000,
        "monthly_debt_payment": 0,
        "cash_savings": 400000,
        "existing_investments": 600000,
        "property_value": 0,
        "other_assets": 0,
        "total_assets": 1000000,
        "total_liabilities": 0,
        "emergency_fund": 250000,
        "insurance_coverage": 10000000,
        "credit_score": 790,
        "risk_tolerance": "Aggressive",
        "investment_experience": "Advanced",
        "financial_goal": "Wealth Creation",
        "goal_amount": 25000000,
        "current_goal_savings": 600000,
        "time_horizon_years": 20,
        "preferred_investment": "Equity MF"
    }

    result = run_planning_engine(profile)
    risk = result["risk_assessment"]
    plan_growth = result["plans"]["plan_b"]

    assert risk["risk_score"] >= 65.0
    assert risk["risk_profile"] in ["Moderately Aggressive", "Aggressive"]
    assert plan_growth["allocation"]["Equity"] >= 55.0
    assert plan_growth["monte_carlo"]["p50"] >= 0.85 * profile["goal_amount"]


def test_archetype_2_middle_aged_family_earner():
    """
    Profile: 42yo, Accountant, 2 dependents, moderate income (90k), moderate debt (15k), horizon (10 yrs).
    Expected: Moderate suitability profile, balanced asset allocation, solid median outcome.
    """
    profile = {
        "age": 42,
        "occupation": "Accountant",
        "dependents": 2,
        "monthly_income": 90000,
        "monthly_expenses": 50000,
        "monthly_debt_payment": 15000,
        "cash_savings": 600000,
        "existing_investments": 1500000,
        "property_value": 4000000,
        "other_assets": 200000,
        "total_assets": 6300000,
        "total_liabilities": 1200000,
        "emergency_fund": 300000,
        "insurance_coverage": 5000000,
        "credit_score": 740,
        "risk_tolerance": "Moderate",
        "investment_experience": "Intermediate",
        "financial_goal": "Child Education",
        "goal_amount": 5000000,
        "current_goal_savings": 1000000,
        "time_horizon_years": 10,
        "preferred_investment": "Hybrid MF"
    }

    result = run_planning_engine(profile)
    risk = result["risk_assessment"]
    plan_bal = result["plans"]["plan_a"]

    assert "Moderate" in risk["risk_profile"]
    assert plan_bal["allocation"]["Debt"] >= 15.0
    assert plan_bal["monte_carlo"]["p50"] >= 0.85 * profile["goal_amount"]


def test_archetype_3_conservative_pre_retiree():
    """
    Profile: 58yo, Government Employee, high accumulated assets, low tolerance, short horizon (3 yrs).
    Expected: Conservative / Moderately Conservative, high FD + Debt (>50%), low volatility (<8.5%).
    """
    profile = {
        "age": 58,
        "occupation": "Government Employee",
        "dependents": 1,
        "monthly_income": 110000,
        "monthly_expenses": 50000,
        "monthly_debt_payment": 0,
        "cash_savings": 1500000,
        "existing_investments": 5000000,
        "property_value": 8000000,
        "other_assets": 500000,
        "total_assets": 15000000,
        "total_liabilities": 0,
        "emergency_fund": 600000,
        "insurance_coverage": 3000000,
        "credit_score": 820,
        "risk_tolerance": "Conservative",
        "investment_experience": "Beginner",
        "financial_goal": "Retirement",
        "goal_amount": 10000000,
        "current_goal_savings": 5000000,
        "time_horizon_years": 3,
        "preferred_investment": "FD"
    }

    result = run_planning_engine(profile)
    risk = result["risk_assessment"]
    plan_bal = result["plans"]["plan_a"]

    assert risk["risk_score"] <= 55.0
    assert risk["risk_profile"] in ["Conservative", "Moderately Conservative", "Moderate"]
    assert (plan_bal["allocation"]["FD"] + plan_bal["allocation"]["Debt"]) >= 50.0
    assert plan_bal["expected_volatility_percent"] <= 8.5


def test_archetype_4_high_debt_burdened_borrower():
    """
    Profile: 35yo, High debt (DTI = 55%), low emergency coverage.
    Expected: Fiduciary constraint kicks in, suitability capped at Moderate or lower, warnings generated.
    """
    profile = {
        "age": 35,
        "occupation": "Sales Executive",
        "dependents": 2,
        "monthly_income": 80000,
        "monthly_expenses": 40000,
        "monthly_debt_payment": 45000,  # DTI > 50%
        "cash_savings": 50000,
        "existing_investments": 100000,
        "property_value": 2000000,
        "other_assets": 0,
        "total_assets": 2150000,
        "total_liabilities": 1800000,
        "emergency_fund": 20000,
        "insurance_coverage": 2000000,
        "credit_score": 620,
        "risk_tolerance": "Aggressive",  # Claims aggressive, but financial capacity is impaired
        "investment_experience": "Beginner",
        "financial_goal": "Emergency Fund",
        "goal_amount": 500000,
        "current_goal_savings": 50000,
        "time_horizon_years": 2,
        "preferred_investment": "FD"
    }

    result = run_planning_engine(profile)
    risk = result["risk_assessment"]

    # Fiduciary check must constrain risk score
    assert risk["risk_score"] <= 60.0
    assert len(risk["validation_warnings"]) > 0


def test_archetype_5_extreme_and_invalid_inputs():
    """
    Profile: Impossible negative income and invalid age.
    Expected: Clean validation error raised.
    """
    invalid_profile = {
        "age": 12,  # < 18
        "monthly_income": -10000,
        "monthly_expenses": 20000,
        "goal_amount": 0
    }

    with pytest.raises(ValueError):
        predict_risk_profile(invalid_profile)
