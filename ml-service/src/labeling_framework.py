"""
Transparent Weak-Supervision Financial Suitability & Risk Labeling Framework (Option B)
Based on standard Quantitative Financial Planning and Fiduciary Suitability principles.

Combines:
1. Objective Financial Capacity (ability to bear financial risk)
2. Subjective Behavioral Willingness (risk tolerance and experience)
3. Fiduciary Safety Constraints (liquidity checks, high-debt bounding)
"""

from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd


RISK_CLASSES = [
    "Conservative",
    "Moderately Conservative",
    "Moderate",
    "Moderately Aggressive",
    "Aggressive"
]


def calculate_risk_capacity(row: Dict[str, Any]) -> float:
    """
    Computes objective Risk Capacity (0-100) from financial fundamentals:
    - Savings rate (25%)
    - Debt-to-income (20%)
    - Emergency / Liquidity coverage (20%)
    - Asset-to-liability / Net worth resilience (15%)
    - Time horizon & Age capacity (20%)
    """
    income = float(row.get("monthly_income", 0))
    expenses = float(row.get("monthly_expenses", 0))
    debt = float(row.get("monthly_debt_payment", 0))
    cash = float(row.get("cash_savings", 0))
    emergency = float(row.get("emergency_fund", 0))
    total_assets = float(row.get("total_assets", 0))
    total_liab = float(row.get("total_liabilities", 0))
    age = float(row.get("age", 35))
    horizon = float(row.get("time_horizon_years", 5))

    # 1. Savings Rate Component (0 - 100)
    monthly_savings = income - expenses - debt
    savings_rate = (monthly_savings / income * 100) if income > 0 else 0
    if savings_rate >= 40:
        c_savings = 100
    elif savings_rate >= 30:
        c_savings = 80
    elif savings_rate >= 20:
        c_savings = 60
    elif savings_rate >= 10:
        c_savings = 40
    elif savings_rate >= 0:
        c_savings = 20
    else:
        c_savings = 0

    # 2. Debt-to-Income (DTI) Component (0 - 100)
    dti = (debt / income * 100) if income > 0 else 100
    if dti <= 10:
        c_debt = 100
    elif dti <= 20:
        c_debt = 80
    elif dti <= 35:
        c_debt = 60
    elif dti <= 50:
        c_debt = 35
    else:
        c_debt = 10

    # 3. Liquidity Coverage Months (0 - 100)
    coverage_months = (cash + emergency) / max(expenses, 1.0)
    if coverage_months >= 12:
        c_liquidity = 100
    elif coverage_months >= 6:
        c_liquidity = 80
    elif coverage_months >= 3:
        c_liquidity = 55
    elif coverage_months >= 1:
        c_liquidity = 30
    else:
        c_liquidity = 10

    # 4. Asset-to-Liability Ratio (0 - 100)
    al_ratio = total_assets / max(total_liab, 1.0)
    if al_ratio >= 6.0:
        c_networth = 100
    elif al_ratio >= 3.5:
        c_networth = 80
    elif al_ratio >= 2.0:
        c_networth = 60
    elif al_ratio >= 1.2:
        c_networth = 40
    else:
        c_networth = 20

    # 5. Horizon & Age Buffer (0 - 100)
    if horizon >= 12:
        c_horizon = 100
    elif horizon >= 8:
        c_horizon = 80
    elif horizon >= 5:
        c_horizon = 60
    elif horizon >= 3:
        c_horizon = 40
    else:
        c_horizon = 20

    age_factor = max(0.0, min(1.0, (65 - age) / 40.0))  # Younger = higher recovery horizon
    c_time = (0.7 * c_horizon) + (0.3 * (age_factor * 100))

    capacity_score = (
        0.25 * c_savings +
        0.20 * c_debt +
        0.20 * c_liquidity +
        0.15 * c_networth +
        0.20 * c_time
    )

    return float(np.clip(capacity_score, 0.0, 100.0))


def calculate_risk_willingness(row: Dict[str, Any]) -> float:
    """
    Computes behavioral Risk Willingness (0-100) from questionnaire & experience.
    """
    tolerance = str(row.get("risk_tolerance", "Moderate")).strip()
    experience = str(row.get("investment_experience", "Intermediate")).strip()
    goal = str(row.get("financial_goal", "Wealth Creation")).strip().lower()

    tol_map = {
        "Aggressive": 90.0,
        "Moderately Aggressive": 75.0,
        "Moderate": 55.0,
        "Moderately Conservative": 35.0,
        "Conservative": 15.0
    }
    w_base = tol_map.get(tolerance, 55.0)

    # Experience adjustment
    exp_adj = {
        "Advanced": 8.0,
        "Intermediate": 0.0,
        "Beginner": -8.0
    }.get(experience, 0.0)

    # Goal adjustment
    goal_adj = 0.0
    if "wealth" in goal or "growth" in goal:
        goal_adj = 5.0
    elif "emergency" in goal:
        goal_adj = -12.0
    elif "education" in goal or "house" in goal:
        goal_adj = -3.0

    willingness = w_base + exp_adj + goal_adj
    return float(np.clip(willingness, 0.0, 100.0))


def calculate_composite_suitability(row: Dict[str, Any]) -> Tuple[float, str]:
    """
    Computes the composite financial suitability score and maps to a calibrated risk class.
    Includes fiduciary safety constraints.
    """
    capacity = calculate_risk_capacity(row)
    willingness = calculate_risk_willingness(row)

    # Standard weighted combination
    suitability = 0.55 * capacity + 0.45 * willingness

    # Fiduciary Constraints:
    # 1. Severe debt burden (DTI > 50%) caps suitability at Moderate (max 55)
    income = float(row.get("monthly_income", 1))
    debt = float(row.get("monthly_debt_payment", 0))
    dti = (debt / income * 100) if income > 0 else 100
    if dti > 50:
        suitability = min(suitability, 50.0)

    # 2. Ultra-short horizon (<= 2 years) caps suitability at Moderately Conservative (max 45)
    horizon = float(row.get("time_horizon_years", 5))
    if horizon <= 2:
        suitability = min(suitability, 45.0)

    suitability = float(np.clip(round(suitability, 2), 0.0, 100.0))

    if suitability <= 30.0:
        category = "Conservative"
    elif suitability <= 48.0:
        category = "Moderately Conservative"
    elif suitability <= 68.0:
        category = "Moderate"
    elif suitability <= 84.0:
        category = "Moderately Aggressive"
    else:
        category = "Aggressive"

    return suitability, category


def apply_labeling_to_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applies the weakly-supervised labeling framework across an entire DataFrame.
    """
    df = df.copy()
    capacities = []
    willingnesses = []
    suitability_scores = []
    suitability_classes = []

    for _, row in df.iterrows():
        row_dict = row.to_dict()
        cap = calculate_risk_capacity(row_dict)
        wil = calculate_risk_willingness(row_dict)
        score, cat = calculate_composite_suitability(row_dict)
        capacities.append(cap)
        willingnesses.append(wil)
        suitability_scores.append(score)
        suitability_classes.append(cat)

    df["risk_capacity_score"] = capacities
    df["risk_willingness_score"] = willingnesses
    df["target_risk_score"] = suitability_scores
    df["target_risk_category"] = suitability_classes

    return df
