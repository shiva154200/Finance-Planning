import sys
from pathlib import Path
import pytest
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.risk_model import predict_risk_profile, get_model
from src.labeling_framework import RISK_CLASSES


def test_model_artifact_loaded():
    model, metadata = get_model()
    assert model is not None
    assert metadata is not None
    assert "model_version" in metadata


def test_predict_risk_profile_structure():
    sample_input = {
        "age": 28,
        "occupation": "Software Engineer",
        "dependents": 0,
        "monthly_income": 120000,
        "monthly_expenses": 45000,
        "monthly_debt_payment": 5000,
        "cash_savings": 400000,
        "existing_investments": 800000,
        "property_value": 0,
        "other_assets": 0,
        "total_assets": 1200000,
        "total_liabilities": 50000,
        "emergency_fund": 200000,
        "insurance_coverage": 5000000,
        "credit_score": 780,
        "risk_tolerance": "Moderately Aggressive",
        "investment_experience": "Advanced",
        "financial_goal": "Wealth Creation",
        "goal_amount": 10000000,
        "current_goal_savings": 500000,
        "time_horizon_years": 15,
        "preferred_investment": "Equity MF"
    }

    result = predict_risk_profile(sample_input)

    assert "risk_score" in result
    assert 0.0 <= result["risk_score"] <= 100.0
    assert result["risk_profile"] in RISK_CLASSES
    assert "confidence" in result
    assert 0.0 <= result["confidence"] <= 1.0

    # Calibrated probabilities sum to 1.0
    probas = result["probabilities"]
    prob_sum = sum(probas.values())
    assert np.isclose(prob_sum, 1.0, atol=1e-2)

    # Top factors exist
    assert len(result["top_factors"]) > 0
    assert isinstance(result["top_factors"], list)


def test_invalid_input_validation():
    invalid_input = {
        "age": 150,  # Invalid age
        "monthly_income": -5000  # Negative income
    }
    with pytest.raises(ValueError) as excinfo:
        predict_risk_profile(invalid_input)
    assert "validation error" in str(excinfo.value)
