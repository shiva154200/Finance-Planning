"""
Feature Engineering Pipeline for Financial Risk and Suitability Prediction.
Ensures zero data leakage by implementing scikit-learn BaseEstimator / TransformerMixin.
"""

from typing import List, Dict, Any, Union
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, RobustScaler


RAW_NUMERICAL_COLS = [
    "age",
    "dependents",
    "monthly_income",
    "monthly_expenses",
    "monthly_debt_payment",
    "cash_savings",
    "existing_investments",
    "property_value",
    "other_assets",
    "total_assets",
    "total_liabilities",
    "emergency_fund",
    "insurance_coverage",
    "credit_score",
    "goal_amount",
    "current_goal_savings",
    "time_horizon_years"
]

RAW_CATEGORICAL_COLS = [
    "occupation",
    "risk_tolerance",
    "investment_experience",
    "financial_goal",
    "preferred_investment"
]


class FinancialRatioTransformer(BaseEstimator, TransformerMixin):
    """
    Computes domain-specific financial health, liquidity, debt, and interaction ratios.
    Does not use the target variable, preventing leakage.
    """

    def __init__(self):
        self.engineered_feature_names: List[str] = []

    def fit(self, X: Union[pd.DataFrame, np.ndarray], y=None):
        return self

    def transform(self, X: Union[pd.DataFrame, np.ndarray]) -> pd.DataFrame:
        if isinstance(X, np.ndarray):
            # If passed as ndarray, construct DataFrame if possible or assume structured columns
            df = pd.DataFrame(X, columns=RAW_NUMERICAL_COLS + RAW_CATEGORICAL_COLS)
        else:
            df = X.copy()

        # Extract underlying numeric series with safe denominators
        income = df["monthly_income"].astype(float).clip(lower=1.0)
        expenses = df["monthly_expenses"].astype(float).clip(lower=0.0)
        debt = df["monthly_debt_payment"].astype(float).clip(lower=0.0)
        cash = df["cash_savings"].astype(float).clip(lower=0.0)
        investments = df["existing_investments"].astype(float).clip(lower=0.0)
        prop_val = df["property_value"].astype(float).clip(lower=0.0) if "property_value" in df else 0.0
        other_ast = df["other_assets"].astype(float).clip(lower=0.0) if "other_assets" in df else 0.0
        tot_assets = df["total_assets"].astype(float).clip(lower=0.0)
        tot_liab = df["total_liabilities"].astype(float).clip(lower=0.0)
        emergency = df["emergency_fund"].astype(float).clip(lower=0.0)
        insurance = df["insurance_coverage"].astype(float).clip(lower=0.0)
        credit = df["credit_score"].astype(float).clip(lower=300.0, upper=850.0)
        age = df["age"].astype(float).clip(lower=18.0, upper=100.0)
        horizon = df["time_horizon_years"].astype(float).clip(lower=1.0, upper=50.0)
        goal_amt = df["goal_amount"].astype(float).clip(lower=1.0)
        goal_savings = df["current_goal_savings"].astype(float).clip(lower=0.0)

        # 1. Cashflow ratios
        monthly_savings = (income - expenses - debt).clip(lower=-income)
        savings_rate = (monthly_savings / income) * 100.0
        expense_to_income = (expenses / income) * 100.0
        debt_to_income = (debt / income) * 100.0

        # 2. Liquidity & Solvency
        emergency_coverage_months = (cash + emergency) / expenses.clip(lower=1000.0)
        liquid_assets = cash + investments
        net_worth = tot_assets - tot_liab
        liquid_net_worth = liquid_assets - tot_liab
        asset_to_liability_ratio = tot_assets / tot_liab.clip(lower=1000.0)

        # 3. Protection & Horizon
        insurance_to_annual_income = insurance / (income * 12.0)
        goal_funding_gap_ratio = (goal_amt - goal_savings).clip(lower=0.0) / goal_amt
        age_x_horizon = age * horizon
        human_capital_horizon = (65.0 - age).clip(lower=0.0) * horizon

        engineered = df.copy()
        engineered["engineered_savings_rate"] = savings_rate
        engineered["engineered_expense_ratio"] = expense_to_income
        engineered["engineered_dti"] = debt_to_income
        engineered["engineered_emergency_months"] = emergency_coverage_months
        engineered["engineered_liquid_assets"] = liquid_assets
        engineered["engineered_net_worth"] = net_worth
        engineered["engineered_liquid_net_worth"] = liquid_net_worth
        engineered["engineered_asset_liability_ratio"] = asset_to_liability_ratio
        engineered["engineered_insurance_ratio"] = insurance_to_annual_income
        engineered["engineered_goal_gap_ratio"] = goal_funding_gap_ratio
        engineered["engineered_age_x_horizon"] = age_x_horizon
        engineered["engineered_human_capital_horizon"] = human_capital_horizon

        self.engineered_feature_names = list(engineered.columns)
        return engineered


def build_preprocessor_pipeline(categorical_cols: List[str] = None, numerical_cols: List[str] = None) -> ColumnTransformer:
    """
    Constructs a ColumnTransformer that properly one-hot encodes categoricals and scales numerical features.
    """
    if categorical_cols is None:
        categorical_cols = RAW_CATEGORICAL_COLS
    if numerical_cols is None:
        numerical_cols = RAW_NUMERICAL_COLS + [
            "engineered_savings_rate",
            "engineered_expense_ratio",
            "engineered_dti",
            "engineered_emergency_months",
            "engineered_liquid_assets",
            "engineered_net_worth",
            "engineered_liquid_net_worth",
            "engineered_asset_liability_ratio",
            "engineered_insurance_ratio",
            "engineered_goal_gap_ratio",
            "engineered_age_x_horizon",
            "engineered_human_capital_horizon"
        ]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                RobustScaler(),
                numerical_cols
            ),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                categorical_cols
            )
        ],
        remainder="drop"
    )

    return preprocessor


def extract_features_from_dict(customer_data: Dict[str, Any]) -> pd.DataFrame:
    """
    Converts a single customer request dictionary into a single-row DataFrame ready for transformation.
    """
    row = {
        "age": float(customer_data.get("age", 30)),
        "occupation": str(customer_data.get("occupation", "Software Engineer")),
        "dependents": int(customer_data.get("dependents", 0)),
        "monthly_income": float(customer_data.get("monthly_income", 100000)),
        "monthly_expenses": float(customer_data.get("monthly_expenses", 40000)),
        "monthly_debt_payment": float(customer_data.get("monthly_debt_payment", 10000)),
        "cash_savings": float(customer_data.get("cash_savings", 500000)),
        "existing_investments": float(customer_data.get("existing_investments", 1000000)),
        "property_value": float(customer_data.get("property_value", 0)),
        "other_assets": float(customer_data.get("other_assets", 0)),
        "total_assets": float(customer_data.get("total_assets", 1500000)),
        "total_liabilities": float(customer_data.get("total_liabilities", 500000)),
        "emergency_fund": float(customer_data.get("emergency_fund", 200000)),
        "insurance_coverage": float(customer_data.get("insurance_coverage", 5000000)),
        "credit_score": int(customer_data.get("credit_score", 750)),
        "risk_tolerance": str(customer_data.get("risk_tolerance", "Moderate")),
        "investment_experience": str(customer_data.get("investment_experience", "Intermediate")),
        "financial_goal": str(customer_data.get("financial_goal", "Wealth Creation")),
        "goal_amount": float(customer_data.get("goal_amount", 5000000)),
        "current_goal_savings": float(customer_data.get("current_goal_savings", 1000000)),
        "time_horizon_years": int(customer_data.get("time_horizon_years", 10)),
        "preferred_investment": str(customer_data.get("preferred_investment", "Mutual Funds"))
    }
    return pd.DataFrame([row])
