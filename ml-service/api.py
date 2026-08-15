from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from src.planning_engine import run_planning_engine


app = FastAPI(
    title="Finance Planning ML Service",
    version="1.0.0"
)


class CustomerRequest(BaseModel):

    customer_id: str
    age: int
    occupation: str
    dependents: int

    monthly_income: float
    monthly_expenses: float
    monthly_debt_payment: float

    cash_savings: float
    existing_investments: float
    property_value: float
    other_assets: float

    total_assets: float
    total_liabilities: float

    emergency_fund: float
    insurance_coverage: float

    credit_score: int

    risk_tolerance: str
    investment_experience: str
    risk_score: float

    financial_goal: str
    goal_amount: float
    current_goal_savings: float

    time_horizon_years: int

    preferred_investment: str


@app.get("/")
def home():

    return {
        "message": "Finance Planning ML Service is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


@app.post("/generate-plan")
def generate_plan(customer: CustomerRequest):

    try:

        customer_data = customer.model_dump()

        result = run_planning_engine(
            customer_data
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )