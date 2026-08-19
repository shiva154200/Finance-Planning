"""
FastAPI Service for Machine Learning Risk Prediction and Financial Planning.
"""

from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.risk_model import get_model, predict_risk_profile
from src.planning_engine import run_planning_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load ML model into memory on startup
    print("Loading ML Risk Model into memory...")
    model, metadata = get_model()
    if model is not None:
        print(f"ML Model loaded successfully: {metadata.get('model_version', 'v1.0.0')}")
    else:
        print("Warning: ML model artifact not found, fallback baseline active.")
    yield


app = FastAPI(
    title="AI Finance Planning ML Service",
    description="Trained Machine Learning Suitability, Covariance Portfolio Optimization, and Monte Carlo Simulation Service",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class CustomerRequest(BaseModel):
    customer_id: Optional[str] = Field(default="C_USER", description="Unique customer ID")
    age: int = Field(ge=18, le=100, default=30, description="Customer age in years")
    occupation: str = Field(default="Software Engineer", description="Occupation title")
    dependents: int = Field(ge=0, le=20, default=0, description="Number of financial dependents")

    monthly_income: float = Field(gt=0, default=100000.0, description="Monthly income in INR")
    monthly_expenses: float = Field(ge=0, default=40000.0, description="Monthly living expenses in INR")
    monthly_debt_payment: float = Field(ge=0, default=10000.0, description="Monthly debt and loan EMI payments in INR")

    cash_savings: float = Field(ge=0, default=500000.0, description="Liquid cash and bank deposits in INR")
    existing_investments: float = Field(ge=0, default=1000000.0, description="Existing market investments in INR")
    property_value: float = Field(ge=0, default=0.0, description="Real estate / property asset value in INR")
    other_assets: float = Field(ge=0, default=0.0, description="Other asset values in INR")

    total_assets: float = Field(ge=0, default=1500000.0, description="Total asset sum in INR")
    total_liabilities: float = Field(ge=0, default=500000.0, description="Total outstanding debt in INR")

    emergency_fund: float = Field(ge=0, default=200000.0, description="Dedicated emergency fund in INR")
    insurance_coverage: float = Field(ge=0, default=5000000.0, description="Total life & health insurance cover in INR")

    credit_score: int = Field(ge=300, le=850, default=750, description="CIBIL / Credit score")

    risk_tolerance: str = Field(default="Moderate", description="Behavioral risk tolerance level")
    investment_experience: str = Field(default="Intermediate", description="Investment experience level")
    risk_score: Optional[float] = Field(default=None, description="Legacy/optional raw risk score")

    financial_goal: str = Field(default="Wealth Creation", description="Primary financial goal")
    goal_amount: float = Field(gt=0, default=5000000.0, description="Target goal amount in INR")
    current_goal_savings: float = Field(ge=0, default=1000000.0, description="Current accumulated savings for goal in INR")

    time_horizon_years: int = Field(ge=1, le=50, default=10, description="Investment time horizon in years")
    preferred_investment: str = Field(default="Mutual Funds", description="Preferred investment class")


class RiskPredictionResponse(BaseModel):
    success: bool
    risk_score: float
    risk_profile: str
    confidence: float
    confidence_tier: str
    probabilities: Dict[str, float]
    top_factors: List[str]
    requires_abstention: bool
    validation_warnings: List[str]
    model_version: str
    methodology: str


@app.get("/")
def home():
    return {
        "message": "AI Finance Planning ML Service is running",
        "version": "2.0.0",
        "status": "operational"
    }


@app.get("/health")
def health():
    model, metadata = get_model()
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_version": metadata.get("model_version", "none") if metadata else "none"
    }


@app.post("/predict-risk", response_model=RiskPredictionResponse)
def predict_risk(customer: CustomerRequest):
    try:
        customer_dict = customer.model_dump()
        result = predict_risk_profile(customer_dict)
        return {
            "success": True,
            **result
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk prediction error: {str(e)}")


@app.post("/generate-plan")
def generate_plan(customer: CustomerRequest):
    try:
        customer_dict = customer.model_dump()
        result = run_planning_engine(customer_dict)
        return {
            "success": True,
            "data": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planning engine error: {str(e)}")