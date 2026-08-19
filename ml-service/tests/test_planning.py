import sys
from pathlib import Path
import pytest
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.portfolio_optimizer import (
    compute_asset_allocation,
    calculate_portfolio_metrics,
    calculate_monthly_investment_requirement,
    load_historical_covariance_and_returns
)
from src.planning_engine import run_planning_engine


def test_asset_allocation_normalization():
    alloc_balanced = compute_asset_allocation(risk_score=65.0, plan_type="Balanced", time_horizon_years=10)
    alloc_growth = compute_asset_allocation(risk_score=65.0, plan_type="Growth", time_horizon_years=10)

    # Check sum to 100%
    assert np.isclose(sum(alloc_balanced.values()), 100.0)
    assert np.isclose(sum(alloc_growth.values()), 100.0)

    # Growth plan should have higher or equal equity allocation than balanced
    assert alloc_growth["Equity"] >= alloc_balanced["Equity"]


def test_covariance_volatility_calculation():
    mean_returns, cov_matrix = load_historical_covariance_and_returns()
    allocation = {"Equity": 50.0, "Debt": 30.0, "Gold": 10.0, "FD": 10.0}

    metrics = calculate_portfolio_metrics(allocation, mean_returns, cov_matrix)

    assert "expected_annual_return_percent" in metrics
    assert "expected_volatility_percent" in metrics
    assert metrics["expected_annual_return_percent"] > 0
    assert metrics["expected_volatility_percent"] > 0
    assert "downside_risk_95_percent" in metrics
    assert "real_annual_return_percent" in metrics


def test_planning_engine_full_run():
    sample_customer = {
        "age": 35,
        "occupation": "Doctor",
        "dependents": 2,
        "monthly_income": 200000,
        "monthly_expenses": 80000,
        "monthly_debt_payment": 20000,
        "cash_savings": 1000000,
        "existing_investments": 2500000,
        "property_value": 5000000,
        "other_assets": 500000,
        "total_assets": 9000000,
        "total_liabilities": 2000000,
        "emergency_fund": 500000,
        "insurance_coverage": 10000000,
        "credit_score": 800,
        "risk_tolerance": "Moderate",
        "investment_experience": "Intermediate",
        "financial_goal": "Retirement",
        "goal_amount": 30000000,
        "current_goal_savings": 2000000,
        "time_horizon_years": 20,
        "preferred_investment": "Mutual Funds"
    }

    result = run_planning_engine(sample_customer)

    assert "risk_assessment" in result
    assert "plans" in result
    assert "plan_a" in result["plans"]
    assert "plan_b" in result["plans"]
    assert "monte_carlo" in result["plans"]["plan_a"]
    assert "customer" in result
    assert "historical" in result
