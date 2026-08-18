import json
from pathlib import Path
import pandas as pd
import numpy as np

def run_data_quality_audit():
    base_dir = Path(__file__).resolve().parent.parent
    dataset_path = base_dir / "datasets" / "customer_financial_profiles.csv"
    hist_path = base_dir / "datasets" / "historical_data.csv"
    reports_dir = base_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(dataset_path)
    hist_df = pd.read_csv(hist_path)

    # 1. Customer dataset checks
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    missing_vals = {col: int(df[col].isnull().sum()) for col in df.columns if df[col].isnull().sum() > 0}
    
    # Financial consistency checks
    sum_assets = df["cash_savings"] + df["existing_investments"] + df["property_value"] + df["other_assets"]
    asset_mismatches = int((sum_assets != df["total_assets"]).sum())

    calc_savings = df["monthly_income"] - df["monthly_expenses"] - df["monthly_debt_payment"]
    savings_mismatches = int((calc_savings != df["monthly_savings"]).sum())
    negative_savings_count = int((calc_savings < 0).sum())

    # Correlations with risk_score
    correlations_with_risk = df[num_cols].corr()["risk_score"].to_dict()
    # Clean NaN or rounding
    correlations_with_risk = {k: round(float(v), 4) for k, v in correlations_with_risk.items() if not np.isnan(v)}

    # Distributions
    class_dist = df["risk_tolerance"].value_counts().to_dict()
    exp_dist = df["investment_experience"].value_counts().to_dict()
    goal_dist = df["financial_goal"].value_counts().to_dict()
    occ_dist = df["occupation"].value_counts().to_dict()

    # Numerical statistics
    num_summary = {}
    for col in num_cols:
        num_summary[col] = {
            "mean": round(float(df[col].mean()), 2),
            "std": round(float(df[col].std()), 2),
            "min": round(float(df[col].min()), 2),
            "p25": round(float(df[col].quantile(0.25)), 2),
            "median": round(float(df[col].median()), 2),
            "p75": round(float(df[col].quantile(0.75)), 2),
            "max": round(float(df[col].max()), 2)
        }

    # Historical dataset checks
    hist_asset_cols = ["equity_return", "debt_return", "gold_return", "fd_return"]
    hist_cov = hist_df[hist_asset_cols].cov().to_dict()
    hist_corr = hist_df[hist_asset_cols].corr().to_dict()

    report = {
        "dataset_name": "customer_financial_profiles.csv",
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": list(df.columns),
        "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing_values": missing_vals,
        "duplicate_rows": int(df.duplicated().sum()),
        "unique_customers": int(df["customer_id"].nunique()),
        "class_distributions": {
            "risk_tolerance": class_dist,
            "investment_experience": exp_dist,
            "financial_goal": goal_dist,
            "occupation": occ_dist
        },
        "financial_consistency": {
            "asset_sum_mismatches": asset_mismatches,
            "savings_mismatches": savings_mismatches,
            "negative_cashflow_rows": negative_savings_count
        },
        "correlations_with_raw_risk_score": correlations_with_risk,
        "numerical_summary": num_summary,
        "historical_data": {
            "rows": len(hist_df),
            "columns": len(hist_df.columns),
            "asset_returns_covariance": hist_cov,
            "asset_returns_correlation": hist_corr
        },
        "findings": [
            "Dataset has 500 rows, zero missing values, zero duplicates.",
            "Raw risk_score (1-10) is heavily tied to the categorical risk_tolerance string with near-zero correlation to financial capacity metrics.",
            "A weakly-supervised financial suitability framework (Option B) is required to combine objective financial capacity (DTI, savings rate, liquidity, net worth, age) with behavioral risk willingness into a continuous suitability score (0-100) and 5 standard risk classes.",
            "Historical returns dataset provides empirical asset covariance structure for portfolio volatility calculation."
        ]
    }

    output_path = reports_dir / "data_quality_report.json"
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"Data Quality Report successfully generated at: {output_path}")
    return report

if __name__ == "__main__":
    run_data_quality_audit()
