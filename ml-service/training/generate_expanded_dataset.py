"""
Dataset Generation & Augmentation Script for Financial Planning System.
Generates an augmented, realistic 2,500-sample dataset: customer_financial_profiles_v2.csv
with realistic financial correlations, behavioral attributes, and labeling.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import numpy as np
import pandas as pd
from src.labeling_framework import apply_labeling_to_dataframe

def generate_customer_dataset(num_samples: int = 2500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    occupations = [
        "Software Engineer", "Doctor", "Business Owner", "Accountant",
        "Teacher", "Sales Executive", "Freelancer", "Government Employee",
        "Bank Employee", "Designer", "Consultant", "Data Scientist"
    ]
    occ_weights = [0.15, 0.08, 0.10, 0.08, 0.08, 0.10, 0.08, 0.09, 0.08, 0.06, 0.05, 0.05]

    goals = [
        "Wealth Creation", "Retirement", "Buy House",
        "Child Education", "Emergency Fund", "Higher Education", "Travel"
    ]
    goal_weights = [0.28, 0.25, 0.16, 0.15, 0.06, 0.05, 0.05]

    experiences = ["Beginner", "Intermediate", "Advanced"]
    exp_weights = [0.35, 0.45, 0.20]

    preferred_invs = [
        "Equity MF", "Bonds", "Gold", "Hybrid MF",
        "PPF", "Debt MF", "FD", "ETF", "Stocks"
    ]

    records = []

    for i in range(num_samples):
        cust_id = f"C{i+1:05d}"
        age = int(np.random.choice(np.arange(21, 66), p=np.exp(-0.02 * (np.arange(21, 66) - 21)) / np.sum(np.exp(-0.02 * (np.arange(21, 66) - 21)))))
        occ = np.random.choice(occupations, p=occ_weights)
        
        # Dependents correlated with age
        if age < 26:
            dependents = int(np.random.choice([0, 1], p=[0.85, 0.15]))
        elif age < 35:
            dependents = int(np.random.choice([0, 1, 2], p=[0.35, 0.45, 0.20]))
        elif age < 50:
            dependents = int(np.random.choice([1, 2, 3, 4], p=[0.20, 0.50, 0.25, 0.05]))
        else:
            dependents = int(np.random.choice([0, 1, 2], p=[0.50, 0.35, 0.15]))

        # Income correlated with age & occupation
        base_income_mu = 11.2 + (age - 21) * 0.02
        if occ in ["Doctor", "Business Owner", "Data Scientist", "Consultant", "Software Engineer"]:
            base_income_mu += 0.35
        elif occ in ["Teacher", "Government Employee"]:
            base_income_mu -= 0.15
        
        monthly_income = int(np.clip(np.exp(np.random.normal(base_income_mu, 0.45)), 25000, 450000))
        
        # Monthly expenses (30% to 65% of income)
        expense_ratio = np.random.beta(4, 5) * 0.45 + 0.25
        monthly_expenses = int(monthly_income * expense_ratio)

        # Monthly debt EMI (0% to 35% of income, occasional high-debt stress case)
        if np.random.rand() < 0.15:
            debt_ratio = 0.0  # Zero debt
        elif np.random.rand() < 0.08:
            debt_ratio = np.random.uniform(0.40, 0.65)  # High debt stress
        else:
            debt_ratio = np.random.uniform(0.05, 0.32)
        monthly_debt_payment = int(monthly_income * debt_ratio)

        monthly_savings = max(0, monthly_income - monthly_expenses - monthly_debt_payment)

        # Savings rate & DTI
        savings_rate = round((monthly_savings / monthly_income) * 100, 2)
        debt_to_income = round((monthly_debt_payment / monthly_income) * 100, 2)

        # Assets accumulation correlated with age, income, and savings
        years_working = max(1, age - 22)
        asset_base = monthly_savings * 12 * years_working * np.random.uniform(0.4, 1.2)

        cash_savings = int(np.clip(monthly_expenses * np.random.uniform(2, 14), 20000, 2500000))
        existing_investments = int(max(10000, asset_base * np.random.uniform(0.3, 0.7)))
        
        # Property value
        if age >= 30 and np.random.rand() < 0.65:
            property_value = int(monthly_income * 12 * np.random.uniform(3, 7))
        else:
            property_value = 0
            
        other_assets = int(cash_savings * np.random.uniform(0.2, 0.8))
        total_assets = cash_savings + existing_investments + property_value + other_assets

        # Liabilities
        if property_value > 0 and monthly_debt_payment > 0:
            total_liabilities = int(monthly_debt_payment * 12 * np.random.uniform(5, 15))
        elif monthly_debt_payment > 0:
            total_liabilities = int(monthly_debt_payment * np.random.uniform(12, 48))
        else:
            total_liabilities = 0
        
        net_worth = total_assets - total_liabilities
        emergency_fund = int(min(cash_savings, monthly_expenses * np.random.uniform(1, 8)))
        insurance_coverage = int(monthly_income * 12 * np.random.uniform(5, 20))
        
        # Credit score
        if total_liabilities == 0:
            credit_score = int(np.random.normal(760, 35))
        elif debt_to_income > 40:
            credit_score = int(np.random.normal(640, 45))
        else:
            credit_score = int(np.random.normal(740, 40))
        credit_score = int(np.clip(credit_score, 300, 850))

        # Risk tolerance, investment experience, goals
        exp = np.random.choice(experiences, p=exp_weights)
        goal = np.random.choice(goals, p=goal_weights)
        preferred_inv = np.random.choice(preferred_invs)

        # Risk tolerance correlated with age and experience
        if exp == "Advanced" and age < 45:
            tol_probs = [0.08, 0.12, 0.30, 0.30, 0.20]
        elif exp == "Beginner" or age > 55:
            tol_probs = [0.35, 0.30, 0.25, 0.08, 0.02]
        else:
            tol_probs = [0.15, 0.25, 0.35, 0.18, 0.07]
        
        risk_tolerance = np.random.choice(
            ["Conservative", "Moderately Conservative", "Moderate", "Moderately Aggressive", "Aggressive"],
            p=tol_probs
        )

        # Goal specifications
        if goal == "Retirement":
            time_horizon = max(1, 60 - age)
            goal_amount = int(monthly_expenses * 12 * 25 * np.random.uniform(0.8, 1.5))
        elif goal in ["Buy House", "Wealth Creation"]:
            time_horizon = int(np.random.choice([5, 7, 10, 15, 20]))
            goal_amount = int(monthly_income * 12 * time_horizon * np.random.uniform(0.4, 0.8))
        else:
            time_horizon = int(np.random.choice([1, 2, 3, 5, 7, 10]))
            goal_amount = int(monthly_expenses * 12 * max(1, time_horizon) * np.random.uniform(0.5, 1.2))

        current_goal_savings = int(min(existing_investments * 0.7, goal_amount * np.random.uniform(0.05, 0.4)))
        goal_gap = max(0, goal_amount - current_goal_savings)

        record = {
            "customer_id": cust_id,
            "age": age,
            "occupation": occ,
            "dependents": dependents,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "monthly_debt_payment": monthly_debt_payment,
            "monthly_savings": monthly_savings,
            "cash_savings": cash_savings,
            "existing_investments": existing_investments,
            "property_value": property_value,
            "other_assets": other_assets,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "net_worth": net_worth,
            "emergency_fund": emergency_fund,
            "insurance_coverage": insurance_coverage,
            "credit_score": credit_score,
            "risk_tolerance": risk_tolerance,
            "investment_experience": exp,
            "financial_goal": goal,
            "goal_amount": goal_amount,
            "current_goal_savings": current_goal_savings,
            "goal_gap": goal_gap,
            "time_horizon_years": time_horizon,
            "preferred_investment": preferred_inv,
            "savings_rate": savings_rate,
            "debt_to_income_ratio": debt_to_income
        }
        records.append(record)

    df = pd.DataFrame(records)
    # Apply weakly-supervised labeling framework
    labeled_df = apply_labeling_to_dataframe(df)
    return labeled_df


def save_datasets():
    base_dir = Path(__file__).resolve().parent.parent
    dataset_dir = base_dir / "datasets"
    dataset_dir.mkdir(parents=True, exist_ok=True)

    # 1. Generate augmented v2 dataset
    v2_df = generate_customer_dataset(num_samples=2500, random_seed=42)
    v2_path = dataset_dir / "customer_financial_profiles_v2.csv"
    v2_df.to_csv(v2_path, index=False)
    print(f"Generated v2 dataset ({len(v2_df)} rows) at {v2_path}")

    # 2. Also apply labeling to original v1 dataset for consistency/comparison
    v1_raw_path = dataset_dir / "customer_financial_profiles.csv"
    if v1_raw_path.exists():
        v1_raw = pd.read_csv(v1_raw_path)
        v1_labeled = apply_labeling_to_dataframe(v1_raw)
        v1_labeled.to_csv(v1_raw_path, index=False)
        print(f"Updated original dataset ({len(v1_labeled)} rows) with labeled target at {v1_raw_path}")

    print("\nTarget Class Distribution in V2 dataset:")
    print(v2_df["target_risk_category"].value_counts(normalize=True).round(4) * 100)

if __name__ == "__main__":
    save_datasets()
