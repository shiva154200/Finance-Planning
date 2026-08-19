"""
Quantitative Portfolio Allocation and Risk Calculation Engine.
Calculates mathematically exact portfolio volatility using empirical asset covariance matrices:
sigma_p = sqrt(w^T * Sigma * w)
"""

from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd


ASSET_NAMES = ["Equity", "Debt", "Gold", "FD"]
HISTORICAL_FILE = Path(__file__).resolve().parent.parent / "datasets" / "historical_data.csv"


def load_historical_covariance_and_returns() -> Tuple[Dict[str, float], np.ndarray]:
    """
    Computes asset historical annual mean returns and empirical covariance matrix Sigma.
    """
    if not HISTORICAL_FILE.exists():
        # Fallback historical statistics if dataset is moved
        mean_returns = {"Equity": 12.5, "Debt": 6.8, "Gold": 9.2, "FD": 6.0}
        cov_matrix = np.array([
            [65.0, -0.5, -1.2, -0.5],
            [-0.5, 1.4, 0.3, 0.7],
            [-1.2, 0.3, 16.0, 0.6],
            [-0.5, 0.7, 0.6, 1.0]
        ])
        return mean_returns, cov_matrix

    df = pd.read_csv(HISTORICAL_FILE)
    asset_cols = {
        "Equity": "equity_return",
        "Debt": "debt_return",
        "Gold": "gold_return",
        "FD": "fd_return"
    }

    mean_returns = {asset: float(df[col].mean()) for asset, col in asset_cols.items()}
    cov_df = df[[asset_cols[a] for a in ASSET_NAMES]].cov()
    cov_matrix = cov_df.to_numpy()

    return mean_returns, cov_matrix


def calculate_portfolio_metrics(
    allocation: Dict[str, float],
    mean_returns: Dict[str, float],
    cov_matrix: np.ndarray,
    inflation_rate: float = 5.5
) -> Dict[str, float]:
    """
    Calculates expected return, exact covariance-based portfolio volatility,
    downside risk (95% 1-yr VaR), and inflation-adjusted real return.
    """
    # Weights vector
    w = np.array([allocation.get(asset, 0.0) / 100.0 for asset in ASSET_NAMES])
    # Normalize if slightly off due to float rounding
    if np.sum(w) > 0:
        w = w / np.sum(w)

    r_vec = np.array([mean_returns.get(asset, 0.0) for asset in ASSET_NAMES])

    # Expected Return: E[r_p] = w^T * r
    expected_return = float(np.dot(w, r_vec))

    # Portfolio Variance: sigma_p^2 = w^T * Sigma * w
    portfolio_variance = float(np.dot(w.T, np.dot(cov_matrix, w)))
    portfolio_volatility = float(np.sqrt(max(0.0, portfolio_variance)))

    # Real return: ((1 + r) / (1 + i)) - 1
    nominal_dec = expected_return / 100.0
    infl_dec = inflation_rate / 100.0
    real_return = ((1.0 + nominal_dec) / (1.0 + infl_dec) - 1.0) * 100.0

    # 95% Parametric 1-Year Downside Risk (1-year VaR)
    # VaR_95 = -(mu - 1.645 * sigma)
    downside_risk_percent = float(max(0.0, 1.645 * portfolio_volatility - expected_return))

    return {
        "expected_annual_return_percent": round(expected_return, 2),
        "expected_volatility_percent": round(portfolio_volatility, 2),
        "real_annual_return_percent": round(real_return, 2),
        "downside_risk_95_percent": round(downside_risk_percent, 2),
        "assumed_inflation_percent": round(inflation_rate, 2)
    }


def compute_asset_allocation(
    risk_score: float,
    plan_type: str = "Balanced",
    time_horizon_years: int = 10,
    financial_goal: str = "Wealth Creation"
) -> Dict[str, float]:
    """
    Computes continuous asset allocation driven by the ML risk score (0-100),
    time horizon, and financial goal.
    """
    s = float(np.clip(risk_score, 0.0, 100.0)) / 100.0  # Normalize to 0..1

    if plan_type == "Growth":
        # Tilted slightly higher for growth while constrained by suitability
        w_eq = 0.15 + 0.65 * s + 0.08
        w_debt = 0.40 - 0.25 * s - 0.04
        w_gold = 0.15 - 0.05 * s
        w_fd = 0.30 - 0.30 * s - 0.04
    else:  # Balanced Plan
        w_eq = 0.10 + 0.60 * s
        w_debt = 0.45 - 0.25 * s
        w_gold = 0.15 - 0.05 * s
        w_fd = 0.30 - 0.30 * s

    # Horizon adjustments for capital preservation
    if time_horizon_years <= 2:
        w_eq = min(w_eq, 0.15)
        w_fd += 0.15
    elif time_horizon_years <= 4:
        w_eq = min(w_eq, 0.35)
        w_debt += 0.05

    # Goal adjustments
    goal_lower = financial_goal.lower()
    if "emergency" in goal_lower:
        w_eq = 0.05
        w_debt = 0.25
        w_gold = 0.10
        w_fd = 0.60
    elif "retirement" in goal_lower and time_horizon_years > 10:
        w_eq += 0.05
        w_fd = max(0.05, w_fd - 0.05)

    # Clip lower bounds
    w_eq = max(0.05, w_eq)
    w_debt = max(0.05, w_debt)
    w_gold = max(0.05, w_gold)
    w_fd = max(0.05, w_fd)

    # Normalize to 100%
    total = w_eq + w_debt + w_gold + w_fd
    w_eq_pct = round((w_eq / total) * 100, 2)
    w_debt_pct = round((w_debt / total) * 100, 2)
    w_gold_pct = round((w_gold / total) * 100, 2)
    w_fd_pct = round(100.0 - (w_eq_pct + w_debt_pct + w_gold_pct), 2)

    return {
        "Equity": w_eq_pct,
        "Debt": w_debt_pct,
        "Gold": w_gold_pct,
        "FD": w_fd_pct
    }


def calculate_monthly_investment_requirement(
    goal_amount: float,
    current_savings: float,
    years: int,
    annual_return_percent: float,
    inflation_adjusted: bool = False,
    inflation_rate: float = 5.5
) -> Tuple[float, float]:
    """
    Computes required monthly SIP contribution with compound growth formula.
    Returns (nominal_monthly_sip, inflation_adjusted_monthly_sip).
    """
    years = max(1, years)
    months = years * 12

    # 1. Nominal calculation
    r_monthly = (annual_return_percent / 100.0) / 12.0
    future_val_existing = current_savings * ((1.0 + r_monthly) ** months)
    net_goal_gap = max(0.0, goal_amount - future_val_existing)

    if net_goal_gap <= 0.0:
        nominal_sip = 0.0
    elif r_monthly <= 0.0:
        nominal_sip = net_goal_gap / months
    else:
        # PMT formula: FV = PMT * [((1+r)^n - 1) / r]
        nominal_sip = net_goal_gap * r_monthly / (((1.0 + r_monthly) ** months) - 1.0)

    # 2. Inflation-adjusted calculation
    # Future goal amount in inflated terms: Goal * (1 + inflation)^years
    inflated_goal_amount = goal_amount * ((1.0 + (inflation_rate / 100.0)) ** years)
    inflated_net_gap = max(0.0, inflated_goal_amount - future_val_existing)

    if inflated_net_gap <= 0.0:
        real_sip = 0.0
    elif r_monthly <= 0.0:
        real_sip = inflated_net_gap / months
    else:
        real_sip = inflated_net_gap * r_monthly / (((1.0 + r_monthly) ** months) - 1.0)

    return round(nominal_sip, 2), round(real_sip, 2)
