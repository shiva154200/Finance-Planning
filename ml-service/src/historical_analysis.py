import pandas as pd
import json
from pathlib import Path


def load_data():
    base_dir = Path(__file__).resolve().parent.parent
    data_path = base_dir / "datasets" / "historical_data.csv"

    df = pd.read_csv(data_path)
    return df


def analyze_returns(df):

    assets = {
        "Equity": "equity_return",
        "Debt": "debt_return",
        "Gold": "gold_return",
        "FD": "fd_return"
    }

    result = {}

    for asset, column in assets.items():
        result[asset] = {
            "average_return": round(df[column].mean(), 2),
            "minimum_return": round(df[column].min(), 2),
            "maximum_return": round(df[column].max(), 2)
        }

    return result


def analyze_volatility(df):

    assets = {
        "Equity": "equity_volatility",
        "Debt": "debt_volatility",
        "Gold": "gold_volatility"
    }

    result = {}

    for asset, column in assets.items():
        result[asset] = round(df[column].mean(), 2)

    result["FD"] = 0

    return result


def analyze_correlation(df):

    correlations = {
        "equity_vs_market_growth":
            df["equity_return"].corr(df["market_growth"]),

        "equity_vs_inflation":
            df["equity_return"].corr(df["inflation_rate"]),

        "gold_vs_inflation":
            df["gold_return"].corr(df["inflation_rate"]),

        "debt_vs_interest_rate":
            df["debt_return"].corr(df["interest_rate"]),

        "fd_vs_interest_rate":
            df["fd_return"].corr(df["interest_rate"]),

        "equity_vs_gdp_growth":
            df["equity_return"].corr(df["gdp_growth"])
    }

    return {
        key: round(value, 2)
        for key, value in correlations.items()
    }


def analyze_trends(df):

    yearly_returns = df.groupby("year")[
        [
            "equity_return",
            "debt_return",
            "gold_return",
            "fd_return"
        ]
    ].mean()

    yearly_returns = yearly_returns.round(2)

    return yearly_returns.to_dict()


def analyze_economic_conditions(df):

    result = df.groupby("economic_condition")[
        [
            "equity_return",
            "debt_return",
            "gold_return",
            "fd_return"
        ]
    ].mean()

    return result.round(2).to_dict()


def generate_insights(returns, volatility):

    insights = []

    best_return_asset = max(
        returns,
        key=lambda asset: returns[asset]["average_return"]
    )

    most_stable_asset = min(
        volatility,
        key=volatility.get
    )

    insights.append(
        f"{best_return_asset} has the highest average return "
        "in the historical dataset."
    )

    insights.append(
        f"{most_stable_asset} has the lowest average volatility "
        "in the historical dataset."
    )

    for asset in returns:

        avg_return = returns[asset]["average_return"]
        asset_volatility = volatility[asset]

        if avg_return > 8 and asset_volatility > 10:
            insights.append(
                f"{asset} shows relatively high return with "
                "higher volatility."
            )

        elif avg_return > 6 and asset_volatility <= 10:
            insights.append(
                f"{asset} shows a relatively balanced "
                "return and volatility."
            )

        elif asset_volatility <= 5:
            insights.append(
                f"{asset} appears relatively stable based "
                "on historical volatility."
            )

    return insights

def make_json_serializable(obj):
    if isinstance(obj, dict):
        return {key: make_json_serializable(value) for key, value in obj.items()}

    if isinstance(obj, list):
        return [make_json_serializable(value) for value in obj]

    if hasattr(obj, "item"):
        return obj.item()

    return obj




def run_historical_analysis():

    df = load_data()

    returns = analyze_returns(df)
    volatility = analyze_volatility(df)
    correlations = analyze_correlation(df)
    trends = analyze_trends(df)
    economic_conditions = analyze_economic_conditions(df)

    insights = generate_insights(
        returns,
        volatility
    )

    result = {
        "returns": returns,
        "volatility": volatility,
        "correlations": correlations,
        "yearly_trends": trends,
        "economic_conditions": economic_conditions,
        "insights": insights
    }

    return make_json_serializable(result)


if __name__ == "__main__":

  
    result = run_historical_analysis()

    print(json.dumps(result, indent=4))