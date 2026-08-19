"""
High-Performance Vectorized Monte Carlo Simulation Engine.
Simulates 10,000 multi-year stochastic return paths to compute empirical goal achievement probabilities,
percentiles (P10, P25, P50, P75, P90), and shortfall risks.
"""

from typing import Dict, Any, List
import numpy as np


def run_monte_carlo_simulation(
    initial_investment: float,
    monthly_contribution: float,
    expected_annual_return: float,
    annual_volatility: float,
    time_horizon_years: int,
    goal_amount: float,
    num_simulations: int = 10000,
    inflation_rate: float = 5.5,
    random_seed: int = 42
) -> Dict[str, Any]:
    """
    Executes a vectorized 10,000-run Monte Carlo simulation of monthly wealth accumulation.
    """
    np.random.seed(random_seed)
    years = max(1, int(time_horizon_years))
    num_months = years * 12

    # Monthly mean and volatility from annual parameters (Geometric Brownian Motion / Log-normal approximation)
    mu_annual = expected_annual_return / 100.0
    sigma_annual = annual_volatility / 100.0

    # Monthly drift and diffusion
    # mu_monthly = (mu - 0.5 * sigma^2) / 12, sigma_monthly = sigma / sqrt(12)
    drift = (mu_annual - 0.5 * (sigma_annual ** 2)) / 12.0
    vol = sigma_annual / np.sqrt(12.0)

    # Generate random monthly log-returns: shape (num_simulations, num_months)
    monthly_log_returns = np.random.normal(drift, vol, size=(num_simulations, num_months))
    monthly_returns = np.exp(monthly_log_returns) - 1.0

    # Simulate portfolio trajectory month by month
    # Vectorized across all 10,000 paths
    portfolio_values = np.zeros((num_simulations, num_months + 1), dtype=np.float64)
    portfolio_values[:, 0] = initial_investment

    for m in range(1, num_months + 1):
        r_m = monthly_returns[:, m - 1]
        portfolio_values[:, m] = (portfolio_values[:, m - 1] * (1.0 + r_m)) + monthly_contribution

    # Ending values across all simulation paths
    ending_values = portfolio_values[:, -1]

    # Calculate empirical probabilities
    success_count = np.sum(ending_values >= goal_amount)
    prob_success = float(np.round((success_count / num_simulations) * 100.0, 1))
    shortfall_prob = float(np.round(100.0 - prob_success, 1))

    # Calculate key percentiles
    p10 = float(np.round(np.percentile(ending_values, 10), 2))
    p25 = float(np.round(np.percentile(ending_values, 25), 2))
    p50 = float(np.round(np.percentile(ending_values, 50), 2))
    p75 = float(np.round(np.percentile(ending_values, 75), 2))
    p90 = float(np.round(np.percentile(ending_values, 90), 2))
    median_outcome = p50

    # Inflation adjustment on percentiles
    inflation_discount = (1.0 + (inflation_rate / 100.0)) ** years
    real_median = float(np.round(median_outcome / inflation_discount, 2))
    real_p10 = float(np.round(p10 / inflation_discount, 2))
    real_p90 = float(np.round(p90 / inflation_discount, 2))

    # Yearly checkpoint trajectory percentiles for UI visualization (e.g. Year 1, Year 2...)
    trajectory_checkpoints = []
    step_years = max(1, years // 5)
    sampled_years = list(range(step_years, years + 1, step_years))
    if years not in sampled_years:
        sampled_years.append(years)

    for yr in sampled_years:
        m_idx = min(yr * 12, num_months)
        vals_at_yr = portfolio_values[:, m_idx]
        trajectory_checkpoints.append({
            "year": f"Year {yr}",
            "p10": float(np.round(np.percentile(vals_at_yr, 10), 0)),
            "p50": float(np.round(np.percentile(vals_at_yr, 50), 0)),
            "p90": float(np.round(np.percentile(vals_at_yr, 90), 0)),
            "goal": float(np.round(goal_amount, 0))
        })

    return {
        "num_simulations": num_simulations,
        "time_horizon_years": years,
        "goal_amount": float(goal_amount),
        "probability_of_success": prob_success,
        "shortfall_probability": shortfall_prob,
        "median_outcome": median_outcome,
        "p10": p10,
        "p25": p25,
        "p50": p50,
        "p75": p75,
        "p90": p90,
        "inflation_adjusted": {
            "assumed_inflation_rate": inflation_rate,
            "real_median_outcome": real_median,
            "real_p10": real_p10,
            "real_p90": real_p90
        },
        "trajectory": trajectory_checkpoints
    }
