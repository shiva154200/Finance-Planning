"""
Upgraded Hybrid Financial Planning Engine.
Orchestrates:
1. Trained ML Risk & Suitability Inference
2. Quantitative Portfolio Optimization & Covariance Volatility
3. 10,000-Run Vectorized Monte Carlo Simulations
4. Historical Analytics & Inflation Adjustments
"""

from typing import Dict, Any
from src.risk_model import predict_risk_profile
from src.portfolio_optimizer import (
    compute_asset_allocation,
    calculate_portfolio_metrics,
    calculate_monthly_investment_requirement,
    load_historical_covariance_and_returns
)
from src.monte_carlo import run_monte_carlo_simulation
from src.historical_analysis import run_historical_analysis
from src.customer_analysis import calculate_financial_metrics, analyze_financial_goal


def generate_single_plan(
    plan_type: str,
    risk_assessment: Dict[str, Any],
    customer_data: Dict[str, Any],
    mean_returns: Dict[str, float],
    cov_matrix: Any,
    inflation_rate: float = 5.5
) -> Dict[str, Any]:
    """
    Constructs a data-driven investment plan (Balanced or Growth) using the continuous ML risk score.
    """
    risk_score = risk_assessment["risk_score"]
    risk_profile = risk_assessment["risk_profile"]
    time_horizon = int(customer_data.get("time_horizon_years", 10))
    financial_goal = str(customer_data.get("financial_goal", "Wealth Creation"))
    goal_amount = float(customer_data.get("goal_amount", 5000000))
    current_savings = float(customer_data.get("current_goal_savings", 1000000))

    # 1. Continuous Risk Allocation
    allocation = compute_asset_allocation(
        risk_score=risk_score,
        plan_type=plan_type,
        time_horizon_years=time_horizon,
        financial_goal=financial_goal
    )

    # 2. Covariance-based Volatility and Expected Returns
    portfolio_metrics = calculate_portfolio_metrics(
        allocation=allocation,
        mean_returns=mean_returns,
        cov_matrix=cov_matrix,
        inflation_rate=inflation_rate
    )

    expected_return = portfolio_metrics["expected_annual_return_percent"]
    volatility = portfolio_metrics["expected_volatility_percent"]
    real_return = portfolio_metrics["real_annual_return_percent"]
    downside_risk = portfolio_metrics["downside_risk_95_percent"]

    # 3. Monthly SIP Calculations (Nominal and Inflation Adjusted)
    nominal_sip, inflation_adjusted_sip = calculate_monthly_investment_requirement(
        goal_amount=goal_amount,
        current_savings=current_savings,
        years=time_horizon,
        annual_return_percent=expected_return,
        inflation_rate=inflation_rate
    )

    # 4. Monte Carlo Simulation for this specific plan
    monte_carlo_result = run_monte_carlo_simulation(
        initial_investment=current_savings,
        monthly_contribution=nominal_sip,
        expected_annual_return=expected_return,
        annual_volatility=volatility,
        time_horizon_years=time_horizon,
        goal_amount=goal_amount,
        num_simulations=10000,
        inflation_rate=inflation_rate
    )

    plan_name = "Balanced Plan" if plan_type == "Balanced" else "Growth Plan"

    return {
        "name": plan_name,
        "type": plan_type,
        "risk_profile": risk_profile,
        "risk_score": risk_score,
        "financial_goal": financial_goal,
        "time_horizon_years": time_horizon,
        "allocation": allocation,
        "expected_annual_return_percent": expected_return,
        "expected_volatility_percent": volatility,
        "real_annual_return_percent": real_return,
        "downside_risk_percent": downside_risk,
        "required_monthly_investment": nominal_sip,
        "inflation_adjusted_monthly_investment": inflation_adjusted_sip,
        "monte_carlo": monte_carlo_result
    }


def run_planning_engine(customer_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for generating complete financial plans.
    """
    # 1. Run ML Risk & Suitability Prediction
    risk_assessment = predict_risk_profile(customer_data)

    # 2. Financial Metrics & Customer Analysis
    financial_metrics = calculate_financial_metrics(customer_data)
    financial_goal = analyze_financial_goal(customer_data)
    historical_analysis = run_historical_analysis()

    # 3. Load empirical asset returns and covariance matrix
    mean_returns, cov_matrix = load_historical_covariance_and_returns()

    # 4. Generate Balanced and Growth Plans
    balanced_plan = generate_single_plan(
        plan_type="Balanced",
        risk_assessment=risk_assessment,
        customer_data=customer_data,
        mean_returns=mean_returns,
        cov_matrix=cov_matrix
    )

    growth_plan = generate_single_plan(
        plan_type="Growth",
        risk_assessment=risk_assessment,
        customer_data=customer_data,
        mean_returns=mean_returns,
        cov_matrix=cov_matrix
    )

    customer_summary = {
        "customer_id": customer_data.get("customer_id", "C_USER"),
        "age": customer_data.get("age", 30),
        "occupation": customer_data.get("occupation", "Software Engineer"),
        "dependents": customer_data.get("dependents", 0),
        "financial_metrics": financial_metrics,
        "financial_goal": financial_goal,
        "risk_profile": {
            "risk_score": risk_assessment["risk_score"],
            "risk_profile": risk_assessment["risk_profile"],
            "confidence": risk_assessment["confidence"],
            "investment_experience": customer_data.get("investment_experience", "Intermediate"),
            "preferred_investment": customer_data.get("preferred_investment", "Mutual Funds")
        }
    }

    return {
        "customer": customer_summary,
        "risk_assessment": risk_assessment,
        "historical": historical_analysis,
        "plans": {
            "plan_a": balanced_plan,
            "plan_b": growth_plan
        },
        "model_metadata": {
            "model_version": risk_assessment.get("model_version", "risk-model-v1.0.0"),
            "methodology": risk_assessment.get("methodology", "Trained Hybrid ML + Covariance Optimizer"),
            "monte_carlo_simulations": 10000
        }
    }