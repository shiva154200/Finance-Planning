import sys
from pathlib import Path
import pytest
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.monte_carlo import run_monte_carlo_simulation


def test_monte_carlo_percentiles_order():
    mc_result = run_monte_carlo_simulation(
        initial_investment=500000,
        monthly_contribution=25000,
        expected_annual_return=11.5,
        annual_volatility=12.0,
        time_horizon_years=10,
        goal_amount=10000000,
        num_simulations=5000,
        random_seed=42
    )

    # Monotonic order: P10 <= P25 <= P50 <= P75 <= P90
    assert mc_result["p10"] <= mc_result["p25"]
    assert mc_result["p25"] <= mc_result["p50"]
    assert mc_result["p50"] <= mc_result["p75"]
    assert mc_result["p75"] <= mc_result["p90"]

    # Probabilities bounded 0..100
    assert 0.0 <= mc_result["probability_of_success"] <= 100.0
    assert 0.0 <= mc_result["shortfall_probability"] <= 100.0
    assert np.isclose(mc_result["probability_of_success"] + mc_result["shortfall_probability"], 100.0)

    # Trajectory checkpoints present
    assert len(mc_result["trajectory"]) > 0
