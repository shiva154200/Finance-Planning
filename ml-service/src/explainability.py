"""
Model Explainability & Factor Attribution Engine.
Provides human-readable, transparent insights into why a user was classified into a specific risk tier.
"""

from typing import Dict, Any, List


def explain_prediction(customer_data: Dict[str, Any], risk_score: float, risk_profile: str) -> List[str]:
    """
    Generates human-readable explanatory factors for the predicted risk score & category.
    Evaluates financial capacity metrics, behavioral responses, and time horizon.
    """
    factors = []

    income = float(customer_data.get("monthly_income", 0))
    expenses = float(customer_data.get("monthly_expenses", 0))
    debt = float(customer_data.get("monthly_debt_payment", 0))
    cash = float(customer_data.get("cash_savings", 0))
    emergency = float(customer_data.get("emergency_fund", 0))
    investments = float(customer_data.get("existing_investments", 0))
    total_assets = float(customer_data.get("total_assets", 0))
    total_liab = float(customer_data.get("total_liabilities", 0))
    horizon = int(customer_data.get("time_horizon_years", 5))
    age = int(customer_data.get("age", 30))
    experience = str(customer_data.get("investment_experience", "Intermediate"))
    tolerance = str(customer_data.get("risk_tolerance", "Moderate"))

    # 1. Horizon & Age factor
    if horizon >= 10:
        factors.append(f"Long investment horizon of {horizon} years provides strong market recovery capacity.")
    elif horizon <= 3:
        factors.append(f"Short investment horizon of {horizon} years limits downside absorption capacity.")
    else:
        factors.append(f"Medium-term horizon of {horizon} years supports a balanced asset growth strategy.")

    # 2. Savings Rate & Cashflow factor
    monthly_savings = income - expenses - debt
    savings_rate = (monthly_savings / income * 100) if income > 0 else 0
    if savings_rate >= 35:
        factors.append(f"Strong savings rate of {savings_rate:.1f}% indicates high monthly cash flow resilience.")
    elif savings_rate < 15:
        factors.append(f"Constrained savings rate of {savings_rate:.1f}% reduces capacity for aggressive volatility.")

    # 3. Debt Burden / DTI factor
    dti = (debt / income * 100) if income > 0 else 0
    if dti <= 15:
        factors.append(f"Low debt-to-income ratio ({dti:.1f}%) minimizes fixed financial commitments.")
    elif dti >= 35:
        factors.append(f"Elevated debt-to-income ratio ({dti:.1f}%) requires conservative liquidity buffers.")

    # 4. Liquidity & Emergency buffer
    coverage_months = (cash + emergency) / max(expenses, 1.0)
    if coverage_months >= 6:
        factors.append(f"Robust liquid emergency cushion ({coverage_months:.1f} months of expenses) protects long-term investments.")
    elif coverage_months < 3:
        factors.append(f"Limited emergency buffer ({coverage_months:.1f} months) necessitates capital preservation.")

    # 5. Experience & Behavioral orientation
    if experience == "Advanced":
        factors.append("Extensive investment experience enables disciplined navigation of market volatility.")
    elif experience == "Beginner":
        factors.append("Beginner investment background favors structured, diversified, and lower-volatility instruments.")

    # Return top 3-4 most impactful factors
    return factors[:4]
