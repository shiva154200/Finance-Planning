import sys
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.feature_engineering import (
    FinancialRatioTransformer,
    build_preprocessor_pipeline,
    extract_features_from_dict
)


def test_financial_ratio_transformer_computations():
    transformer = FinancialRatioTransformer()
    sample_df = pd.DataFrame([{
        "age": 30,
        "occupation": "Software Engineer",
        "dependents": 1,
        "monthly_income": 100000,
        "monthly_expenses": 40000,
        "monthly_debt_payment": 10000,
        "cash_savings": 200000,
        "existing_investments": 500000,
        "property_value": 2000000,
        "other_assets": 100000,
        "total_assets": 2800000,
        "total_liabilities": 500000,
        "emergency_fund": 120000,
        "insurance_coverage": 5000000,
        "credit_score": 750,
        "risk_tolerance": "Moderate",
        "investment_experience": "Intermediate",
        "financial_goal": "Wealth Creation",
        "goal_amount": 5000000,
        "current_goal_savings": 500000,
        "time_horizon_years": 10,
        "preferred_investment": "Mutual Funds"
    }])

    transformed = transformer.transform(sample_df)

    # Savings rate: (100k - 40k - 10k) / 100k = 50%
    assert np.isclose(transformed["engineered_savings_rate"].iloc[0], 50.0)
    # DTI: 10k / 100k = 10%
    assert np.isclose(transformed["engineered_dti"].iloc[0], 10.0)
    # Emergency months: (200k + 120k) / 40k = 8.0
    assert np.isclose(transformed["engineered_emergency_months"].iloc[0], 8.0)
    # Net worth: 2800k - 500k = 2300k
    assert np.isclose(transformed["engineered_net_worth"].iloc[0], 2300000.0)


def test_feature_preprocessor_pipeline():
    preprocessor = build_preprocessor_pipeline()
    transformer = FinancialRatioTransformer()
    df_raw = extract_features_from_dict({
        "age": 28,
        "monthly_income": 80000,
        "monthly_expenses": 35000,
        "monthly_debt_payment": 5000,
        "cash_savings": 300000,
        "existing_investments": 200000,
        "total_assets": 500000,
        "total_liabilities": 100000,
        "emergency_fund": 100000,
        "insurance_coverage": 2000000,
        "credit_score": 780,
        "time_horizon_years": 8
    })

    df_fe = transformer.transform(df_raw)
    trans_matrix = preprocessor.fit_transform(df_fe)

    assert trans_matrix.shape[0] == 1
    assert trans_matrix.shape[1] > 20
    assert not np.isnan(trans_matrix).any()
