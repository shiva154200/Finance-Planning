import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from api import app

client = TestClient(app)


def test_api_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_api_predict_risk_endpoint():
    payload = {
        "age": 32,
        "occupation": "Software Engineer",
        "dependents": 1,
        "monthly_income": 150000,
        "monthly_expenses": 50000,
        "monthly_debt_payment": 15000,
        "cash_savings": 600000,
        "existing_investments": 1200000,
        "property_value": 0,
        "other_assets": 0,
        "total_assets": 1800000,
        "total_liabilities": 200000,
        "emergency_fund": 300000,
        "insurance_coverage": 7500000,
        "credit_score": 770,
        "risk_tolerance": "Moderate",
        "investment_experience": "Intermediate",
        "financial_goal": "Wealth Creation",
        "goal_amount": 10000000,
        "current_goal_savings": 1200000,
        "time_horizon_years": 12,
        "preferred_investment": "Mutual Funds"
    }

    response = client.post("/predict-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "risk_score" in data
    assert "risk_profile" in data
    assert "confidence" in data
    assert "probabilities" in data
    assert "top_factors" in data


def test_api_generate_plan_endpoint():
    payload = {
        "age": 29,
        "occupation": "Data Scientist",
        "dependents": 0,
        "monthly_income": 130000,
        "monthly_expenses": 40000,
        "monthly_debt_payment": 10000,
        "cash_savings": 500000,
        "existing_investments": 900000,
        "property_value": 0,
        "other_assets": 0,
        "total_assets": 1400000,
        "total_liabilities": 100000,
        "emergency_fund": 250000,
        "insurance_coverage": 6000000,
        "credit_score": 790,
        "risk_tolerance": "Moderately Aggressive",
        "investment_experience": "Advanced",
        "financial_goal": "Wealth Creation",
        "goal_amount": 15000000,
        "current_goal_savings": 900000,
        "time_horizon_years": 15,
        "preferred_investment": "Equity MF"
    }

    response = client.post("/generate-plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "data" in data
    plan_data = data["data"]
    assert "risk_assessment" in plan_data
    assert "plans" in plan_data
    assert "plan_a" in plan_data["plans"]
    assert "plan_b" in plan_data["plans"]
