from pathlib import Path
import pandas as pd

from src.risk_model import predict_ml_final_risk


BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "datasets"


def load_customer_data():

    file_path = (
        DATASET_DIR /
        "customer_financial_profiles.csv"
    )

    df = pd.read_csv(file_path)

    return df

# --------------------------------------------------
# 2. CALCULATE FINANCIAL METRICS
# --------------------------------------------------

def calculate_financial_metrics(customer):

    monthly_income = customer["monthly_income"]
    monthly_expenses = customer["monthly_expenses"]
    monthly_debt = customer["monthly_debt_payment"]

    monthly_savings = (
        monthly_income
        - monthly_expenses
        - monthly_debt
    )

    if monthly_income > 0:
        savings_rate = (
            monthly_savings / monthly_income
        ) * 100

        debt_to_income = (
            monthly_debt / monthly_income
        ) * 100
    else:
        savings_rate = 0
        debt_to_income = 0

    total_assets = (
        customer["total_assets"]
    )

    total_liabilities = (
        customer["total_liabilities"]
    )

    net_worth = (
        total_assets
        - total_liabilities
    )

    return {
        "monthly_income": round(
            monthly_income, 2
        ),

        "monthly_expenses": round(
            monthly_expenses, 2
        ),

        "monthly_debt_payment": round(
            monthly_debt, 2
        ),

        "monthly_savings": round(
            monthly_savings, 2
        ),

        "savings_rate": round(
            savings_rate, 2
        ),

        "debt_to_income_ratio": round(
            debt_to_income, 2
        ),

        "total_assets": round(
            total_assets, 2
        ),

        "total_liabilities": round(
            total_liabilities, 2
        ),

        "net_worth": round(
            net_worth, 2
        )
    }


# --------------------------------------------------
# 3. ANALYZE RISK TOLERANCE
# --------------------------------------------------

def calculate_risk_tolerance(customer):

    risk_score = customer["risk_score"]

    if risk_score <= 30:
        risk_profile = "Conservative"

    elif risk_score <= 50:
        risk_profile = "Moderately Conservative"

    elif risk_score <= 70:
        risk_profile = "Moderate"

    elif risk_score <= 85:
        risk_profile = "Moderately Aggressive"

    else:
        risk_profile = "Aggressive"

    return {
        "risk_tolerance_score": round(
            risk_score, 2
        ),

        "risk_tolerance_profile":
            risk_profile
    }


# --------------------------------------------------
# 4. CALCULATE RISK CAPACITY
# --------------------------------------------------

def calculate_risk_capacity(
    financial_metrics
):

    savings_rate = (
        financial_metrics["savings_rate"]
    )

    debt_ratio = (
        financial_metrics["debt_to_income_ratio"]
    )

    score = 50

    # Savings capacity

    if savings_rate >= 30:
        score += 20

    elif savings_rate >= 20:
        score += 10

    elif savings_rate < 10:
        score -= 20

    # Debt capacity

    if debt_ratio <= 20:
        score += 20

    elif debt_ratio <= 40:
        score += 10

    elif debt_ratio > 50:
        score -= 20

    score = max(
        0,
        min(100, score)
    )

    return score


# --------------------------------------------------
# 5. CALCULATE FINAL RISK PROFILE
# --------------------------------------------------

def calculate_final_risk(
    risk_tolerance_score,
    risk_capacity_score
):

    final_score = (
        risk_tolerance_score * 0.5
        + risk_capacity_score * 0.5
    )

    if final_score <= 30:
        profile = "Conservative"

    elif final_score <= 50:
        profile = "Moderately Conservative"

    elif final_score <= 70:
        profile = "Moderate"

    elif final_score <= 85:
        profile = "Moderately Aggressive"

    else:
        profile = "Aggressive"

    return {
        "final_risk_score": round(
            final_score, 2
        ),

        "risk_profile": profile
    }


# --------------------------------------------------
# 6. ANALYZE FINANCIAL GOAL
# --------------------------------------------------

def analyze_financial_goal(customer):

    goal_amount = (
        customer["goal_amount"]
    )

    current_savings = (
        customer["current_goal_savings"]
    )

    goal_gap = max(
        0,
        goal_amount - current_savings
    )

    return {
        "financial_goal":
            customer["financial_goal"],

        "goal_amount":
            round(goal_amount, 2),

        "current_goal_savings":
            round(current_savings, 2),

        "goal_gap":
            round(goal_gap, 2),

        "time_horizon_years":
            customer["time_horizon_years"]
    }


# --------------------------------------------------
# 7. COMPLETE CUSTOMER ANALYSIS
# --------------------------------------------------

def analyze_customer(customer):

    # Financial analysis

    financial_metrics = (
        calculate_financial_metrics(
            customer
        )
    )

    # Risk tolerance

    risk_tolerance = (
        calculate_risk_tolerance(
            customer
        )
    )

    # Risk capacity

    risk_capacity = (
        calculate_risk_capacity(
            financial_metrics
        )
    )

    # Final risk profile (ML when artifact present, else rule-based blend)

    ml_final_risk = predict_ml_final_risk(customer)

    if ml_final_risk is not None:
        final_risk = ml_final_risk
    else:
        final_risk = calculate_final_risk(
            risk_tolerance["risk_tolerance_score"],
            risk_capacity
        )

    # Financial goal

    financial_goal = (
        analyze_financial_goal(
            customer
        )
    )

    # Final result

    result = {

        "customer_id":
            customer["customer_id"],

        "age":
            customer["age"],

        "occupation":
            customer["occupation"],

        "dependents":
            customer["dependents"],

        "financial_metrics":
            financial_metrics,

        "risk_profile": {

            "risk_tolerance_score":
                risk_tolerance[
                    "risk_tolerance_score"
                ],

            "risk_capacity_score":
                risk_capacity,

            "final_risk_score":
                final_risk[
                    "final_risk_score"
                ],

            "risk_profile":
                final_risk[
                    "risk_profile"
                ],

            "investment_experience":
                customer[
                    "investment_experience"
                ],

            "preferred_investment":
                customer[
                    "preferred_investment"
                ]
        },

        "financial_goal":
            financial_goal
    }

    return result


# --------------------------------------------------
# 8. MAIN FUNCTION
# --------------------------------------------------

def run_customer_analysis(customer):

    return analyze_customer(customer)


# --------------------------------------------------
# 9. PROGRAM ENTRY POINT
# --------------------------------------------------

if __name__ == "__main__":

    result = run_customer_analysis()

    print("\n======================================")
    print("     CUSTOMER FINANCIAL ANALYSIS")
    print("======================================")

    print("\nCustomer ID:")
    print(
        result["customer_id"]
    )

    print("\nBasic Information:")
    print(
        "Age:",
        result["age"]
    )

    print(
        "Occupation:",
        result["occupation"]
    )

    print(
        "Dependents:",
        result["dependents"]
    )

    print("\nFinancial Metrics:")

    for key, value in result[
        "financial_metrics"
    ].items():

        print(
            f"{key}: {value}"
        )

    print("\nRisk Profile:")

    for key, value in result[
        "risk_profile"
    ].items():

        print(
            f"{key}: {value}"
        )

    print("\nFinancial Goal:")

    for key, value in result[
        "financial_goal"
    ].items():

        print(
            f"{key}: {value}"
        )