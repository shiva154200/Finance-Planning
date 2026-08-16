const express = require("express");
const axios = require("axios");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/generate-plan", async (req, res) => {
    try {
     const customer = {
    customer_id: "TEST_YOUNG_001",

    age: 28,
    occupation: "Software Engineer",
    dependents: 0,

    monthly_income: 150000,
    monthly_expenses: 65000,
    monthly_debt_payment: 15000,

    cash_savings: 200000,
    existing_investments: 300000,
    property_value: 0,
    other_assets: 0,

    total_assets: 500000,
    total_liabilities: 300000,

    emergency_fund: 150000,
    insurance_coverage: 1000000,

    credit_score: 750,

    risk_tolerance: "Aggressive",
    investment_experience: "Intermediate",
    risk_score: 85,

    financial_goal: "Retirement",
    goal_amount: 50000000,
    current_goal_savings: 500000,

    time_horizon_years: 30,

    preferred_investment: "Equity"
};
       

        const response = await axios.post(
            "http://127.0.0.1:8000/generate-plan",
            customer
        );

        res.json(response.data);

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
});

app.listen(3000, () => {
    console.log("Node.js server running on http://localhost:3000");
});