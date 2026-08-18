"""
Domain Constraints, Out-of-Distribution (OOD) Detection, and Abstention Safety Engine.
"""

from typing import Dict, Any, List, Tuple


MIN_AGE = 18
MAX_AGE = 100
MIN_CREDIT_SCORE = 300
MAX_CREDIT_SCORE = 850


def validate_customer_input(data: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
    """
    Validates customer input for physical impossibility (errors) and distribution anomalies (warnings).
    Returns (is_valid, errors, warnings).
    """
    errors: List[str] = []
    warnings: List[str] = []

    age = data.get("age")
    if age is not None:
        if age < MIN_AGE or age > MAX_AGE:
            errors.append(f"Age {age} is outside the valid range [{MIN_AGE}, {MAX_AGE}].")

    income = data.get("monthly_income", 0)
    expenses = data.get("monthly_expenses", 0)
    debt = data.get("monthly_debt_payment", 0)

    if income < 0:
        errors.append("Monthly income cannot be negative.")
    if expenses < 0:
        errors.append("Monthly expenses cannot be negative.")
    if debt < 0:
        errors.append("Monthly debt payment cannot be negative.")

    credit_score = data.get("credit_score")
    if credit_score is not None:
        if credit_score < MIN_CREDIT_SCORE or credit_score > MAX_CREDIT_SCORE:
            errors.append(
                f"Credit score {credit_score} is outside standard range "
                f"[{MIN_CREDIT_SCORE}, {MAX_CREDIT_SCORE}]."
            )

    if income > 0 and (expenses + debt) > income:
        shortfall = (expenses + debt) - income
        warnings.append(
            f"Negative monthly cash flow: Expenses and debt exceed income by ₹{shortfall:,.2f}/month."
        )

    if income > 0 and (debt / income) > 0.60:
        warnings.append(
            f"Extremely high debt-to-income ratio ({(debt/income)*100:.1f}%). "
            "High financial vulnerability detected."
        )

    cash = data.get("cash_savings", 0)
    emergency = data.get("emergency_fund", 0)
    if expenses > 0 and (cash + emergency) < (0.5 * expenses):
        warnings.append(
            "Critical liquidity risk: Liquid emergency reserves cover less than 15 days of living expenses."
        )

    horizon = data.get("time_horizon_years", 0)
    if horizon <= 0:
        errors.append("Time horizon must be at least 1 year.")
    elif horizon > 50:
        warnings.append(
            "Time horizon exceeds 50 years; projections assume long-term equilibrium conditions."
        )

    goal_amount = data.get("goal_amount", 0)
    if goal_amount <= 0:
        errors.append("Financial goal amount must be greater than zero.")

    is_valid = len(errors) == 0
    return is_valid, errors, warnings
