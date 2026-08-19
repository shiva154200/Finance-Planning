import pandas as pd
import numpy as np

def audit():
    cust_df = pd.read_csv('d:/file/Finance_planning/ml-service/datasets/customer_financial_profiles.csv')
    print("================================================================")
    print("=== CUSTOMER FINANCIAL PROFILES AUDIT ===")
    print("================================================================")
    print(f"Shape: {cust_df.shape} (rows, cols)")
    print("\n--- Columns & Types ---")
    for col, dtype in cust_df.dtypes.items():
        print(f"  {col}: {dtype}")
    
    print("\n--- Missing Values ---")
    null_counts = cust_df.isnull().sum()
    print(null_counts[null_counts > 0] if null_counts.sum() > 0 else "  No missing values detected.")

    print("\n--- Duplicate Check ---")
    print(f"  Full duplicate rows: {cust_df.duplicated().sum()}")
    print(f"  Unique customer_ids: {cust_df['customer_id'].nunique()} out of {len(cust_df)}")

    print("\n--- Numeric Summary ---")
    num_cols = cust_df.select_dtypes(include=[np.number]).columns
    print(cust_df[num_cols].describe().T[['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']])

    print("\n--- Categorical Distributions ---")
    cat_cols = cust_df.select_dtypes(include=['object', 'category']).columns
    for col in cat_cols:
        print(f"\n[Column: {col}]")
        print(cust_df[col].value_counts(dropna=False))

    print("\n--- Financial Consistency Checks ---")
    # Check total_assets vs sum of assets
    calc_assets = cust_df['cash_savings'] + cust_df['existing_investments'] + cust_df['property_value'] + cust_df['other_assets']
    asset_diff = (calc_assets - cust_df['total_assets']).abs()
    print(f"  Max discrepancy in total_assets vs sum: {asset_diff.max()}")

    # Check monthly savings vs income - expenses - debt
    calc_savings = cust_df['monthly_income'] - cust_df['monthly_expenses'] - cust_df['monthly_debt_payment']
    print(f"  Min calculated monthly savings: {calc_savings.min()}, Max: {calc_savings.max()}")
    negative_savings = (calc_savings < 0).sum()
    print(f"  Rows with negative monthly cash flow: {negative_savings}")

    # Correlation with risk_score
    print("\n--- Correlations with risk_score ---")
    corrs = cust_df[num_cols].corr()['risk_score'].sort_values(ascending=False)
    print(corrs)

    print("\n================================================================")
    print("=== HISTORICAL DATA AUDIT ===")
    print("================================================================")
    hist_df = pd.read_csv('d:/file/Finance_planning/ml-service/datasets/historical_data.csv')
    print(f"Shape: {hist_df.shape} (rows, cols)")
    print("\n--- Columns & Types ---")
    for col, dtype in hist_df.dtypes.items():
        print(f"  {col}: {dtype}")
    
    print("\n--- Missing Values ---")
    h_nulls = hist_df.isnull().sum()
    print(h_nulls[h_nulls > 0] if h_nulls.sum() > 0 else "  No missing values detected.")

    print("\n--- Duplicates ---")
    print(f"  Full duplicate rows: {hist_df.duplicated().sum()}")

    print("\n--- Numeric Summary ---")
    h_num_cols = hist_df.select_dtypes(include=[np.number]).columns
    print(hist_df[h_num_cols].describe().T[['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']])

    print("\n--- Return Covariance Matrix ---")
    asset_return_cols = ['equity_return', 'debt_return', 'gold_return', 'fd_return']
    print(hist_df[asset_return_cols].cov())

    print("\n--- Return Correlation Matrix ---")
    print(hist_df[asset_return_cols].corr())

if __name__ == '__main__':
    audit()
