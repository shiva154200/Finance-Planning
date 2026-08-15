from src.historical_analysis import run_historical_analysis
from src.customer_analysis import run_customer_analysis


ASSETS = [
    "Equity",
    "Debt",
    "Gold",
    "FD"
]


# --------------------------------------------------
# 1. BASE ALLOCATION
# --------------------------------------------------

def get_base_allocation(risk_profile):

    allocations = {

        "Conservative": {
            "Equity": 20,
            "Debt": 40,
            "Gold": 15,
            "FD": 25
        },

        "Moderately Conservative": {
            "Equity": 30,
            "Debt": 35,
            "Gold": 15,
            "FD": 20
        },

        "Moderate": {
            "Equity": 40,
            "Debt": 30,
            "Gold": 15,
            "FD": 15
        },

        "Moderately Aggressive": {
            "Equity": 55,
            "Debt": 20,
            "Gold": 15,
            "FD": 10
        },

        "Aggressive": {
            "Equity": 70,
            "Debt": 15,
            "Gold": 10,
            "FD": 5
        }
    }

    return allocations.get(
        risk_profile,
        allocations["Moderate"]
    ).copy()


# --------------------------------------------------
# 2. TIME HORIZON ADJUSTMENT
# --------------------------------------------------

def adjust_for_time_horizon(
    allocation,
    time_horizon
):

    allocation = allocation.copy()

    if time_horizon <= 3:

        allocation["Equity"] -= 10
        allocation["Debt"] += 5
        allocation["FD"] += 5

    elif time_horizon <= 7:

        allocation["Equity"] -= 5
        allocation["Debt"] += 5

    else:

        allocation["Equity"] += 5
        allocation["Debt"] -= 2.5
        allocation["FD"] -= 2.5

    return allocation


# --------------------------------------------------
# 3. GOAL ADJUSTMENT
# --------------------------------------------------

def adjust_for_goal(
    allocation,
    goal
):

    allocation = allocation.copy()

    goal = goal.lower()

    if "emergency" in goal:

        allocation["Equity"] -= 15
        allocation["FD"] += 15

    elif "house" in goal:

        allocation["Equity"] -= 5
        allocation["Debt"] += 5

    elif "education" in goal:

        allocation["Equity"] += 3
        allocation["Debt"] -= 3

    elif "retirement" in goal:

        allocation["Equity"] += 5
        allocation["FD"] -= 5

    elif "wealth" in goal:

        allocation["Equity"] += 5
        allocation["Debt"] -= 5

    return allocation


# --------------------------------------------------
# 4. PLAN TYPE ADJUSTMENT
# --------------------------------------------------

def adjust_for_plan_type(
    allocation,
    plan_type
):

    allocation = allocation.copy()

    if plan_type == "Growth":

        allocation["Equity"] += 7
        allocation["FD"] -= 7

    return allocation


# --------------------------------------------------
# 5. NORMALIZE ALLOCATION
# --------------------------------------------------

def normalize_allocation(
    allocation
):

    for asset in allocation:

        if allocation[asset] < 0:
            allocation[asset] = 0

    total = sum(
        allocation.values()
    )

    if total == 0:

        return allocation

    return {
        asset: round(
            (value / total) * 100,
            2
        )
        for asset, value
        in allocation.items()
    }


# --------------------------------------------------
# 6. GET HISTORICAL METRICS
# --------------------------------------------------

def get_historical_metrics(
    historical
):

    returns = historical.get(
        "returns",
        {}
    )

    volatility = historical.get(
        "volatility",
        {}
    )

    metrics = {}

    for asset in ASSETS:

        average_return = 0
        asset_volatility = 0

        if asset in returns:

            average_return = float(
                returns[asset]["average_return"]
            )

        if asset in volatility:

            asset_volatility = float(
                volatility[asset]
            )

        metrics[asset] = {

            "average_return":
                average_return,

            "volatility":
                asset_volatility
        }

    return metrics


# --------------------------------------------------
# 7. EXPECTED PORTFOLIO RETURN
# --------------------------------------------------

def calculate_expected_return(
    allocation,
    historical
):

    metrics = get_historical_metrics(
        historical
    )

    expected_return = 0

    for asset, percentage in (
        allocation.items()
    ):

        asset_return = metrics[
            asset
        ]["average_return"]

        weight = percentage / 100

        expected_return += (
            weight * asset_return
        )

    return round(
        expected_return,
        2
    )


# --------------------------------------------------
# 8. EXPECTED PORTFOLIO VOLATILITY
# --------------------------------------------------

def calculate_expected_volatility(
    allocation,
    historical
):

    metrics = get_historical_metrics(
        historical
    )

    weighted_volatility = 0

    for asset, percentage in (
        allocation.items()
    ):

        asset_volatility = metrics[
            asset
        ]["volatility"]

        weight = percentage / 100

        weighted_volatility += (
            weight * asset_volatility
        )

    return round(
        weighted_volatility,
        2
    )


# --------------------------------------------------
# 9. REQUIRED MONTHLY INVESTMENT
# --------------------------------------------------

def calculate_monthly_investment(
    goal_amount,
    current_savings,
    years,
    expected_return
):

    remaining_amount = (
        goal_amount - current_savings
    )

    if remaining_amount <= 0:
        return 0

    months = years * 12

    monthly_rate = (
        expected_return / 100
    ) / 12

    if monthly_rate <= 0:

        monthly_investment = (
            remaining_amount / months
        )

    else:

        monthly_investment = (
            remaining_amount
            * monthly_rate
            /
            (
                (1 + monthly_rate) ** months
                - 1
            )
        )

    return round(
        monthly_investment,
        2
    )

# --------------------------------------------------
# 10. CREATE PLAN
# --------------------------------------------------

def create_plan(
    customer,
    historical,
    plan_type
):

    risk_profile = (
        customer["risk_profile"]
        ["risk_profile"]
    )

    goal_data = (
        customer["financial_goal"]
    )

    goal = goal_data[
        "financial_goal"
    ]

    time_horizon = int(
        goal_data[
            "time_horizon_years"
        ]
    )

    goal_amount = float(
        goal_data[
            "goal_amount"
        ]
    )

    current_savings = float(
        goal_data[
            "current_goal_savings"
        ]
    )

    # Base allocation

    allocation = get_base_allocation(
        risk_profile
    )

    # Time horizon

    allocation = adjust_for_time_horizon(
        allocation,
        time_horizon
    )

    # Goal

    allocation = adjust_for_goal(
        allocation,
        goal
    )

    # Plan type

    allocation = adjust_for_plan_type(
        allocation,
        plan_type
    )

    # Normalize

    allocation = normalize_allocation(
        allocation
    )

    # Expected return

    expected_return = (
        calculate_expected_return(
            allocation,
            historical
        )
    )

    # Expected volatility

    expected_volatility = (
        calculate_expected_volatility(
            allocation,
            historical
        )
    )

    # Monthly investment

    monthly_investment = (
        calculate_monthly_investment(
            goal_amount,
            current_savings,
            time_horizon,
            expected_return
        )
    )

    return {

        "name":
            "Balanced Plan"
            if plan_type == "Balanced"
            else "Growth Plan",

        "type":
            plan_type,

        "risk_profile":
            risk_profile,

        "financial_goal":
            goal,

        "time_horizon_years":
            time_horizon,

        "allocation":
            allocation,

        "expected_annual_return_percent":
            expected_return,

        "expected_volatility_percent":
            expected_volatility,

        "required_monthly_investment":
            monthly_investment
    }


# --------------------------------------------------
# 11. GENERATE TWO PLANS
# --------------------------------------------------

def generate_plans(
    customer,
    historical
):

    balanced_plan = create_plan(
        customer,
        historical,
        "Balanced"
    )

    growth_plan = create_plan(
        customer,
        historical,
        "Growth"
    )

    return {

        "plan_a": balanced_plan,

        "plan_b": growth_plan
    }


# --------------------------------------------------
# 12. COMPLETE PLANNING ENGINE
# --------------------------------------------------

def run_planning_engine(customer):

    customer_analysis = run_customer_analysis(
        customer
    )

    historical = run_historical_analysis()

    plans = generate_plans(
        customer_analysis,
        historical
    )

    return {
        "customer": customer_analysis,
        "historical": historical,
        "plans": plans
    }


# --------------------------------------------------
# 13. MAIN
# --------------------------------------------------

if __name__ == "__main__":

    from src.customer_analysis import load_customer_data

    df = load_customer_data()

    customer = df.iloc[0]

    result = run_planning_engine(customer)

    print("\n================================")
    print("       FINANCIAL PLANS")
    print("================================")

    for plan_key in [
        "plan_a",
        "plan_b"
    ]:

        plan = result[
            "plans"
        ][plan_key]

        print(
            f"\n{plan['name'].upper()}"
        )

        print(
            "--------------------------------"
        )

        print(
            "Risk Profile:",
            plan["risk_profile"]
        )

        print(
            "Financial Goal:",
            plan["financial_goal"]
        )

        print(
            "Time Horizon:",
            plan["time_horizon_years"],
            "years"
        )

        print("\nAllocation:")

        for asset, percentage in (
            plan["allocation"].items()
        ):

            print(
                f"  {asset}: {percentage}%"
            )

        print(
            "\nExpected Annual Return:",
            f"{plan['expected_annual_return_percent']}%"
        )

        print(
            "Expected Volatility:",
            f"{plan['expected_volatility_percent']}%"
        )

        print(
            "Required Monthly Investment:",
            f"₹{plan['required_monthly_investment']}"
        )
  