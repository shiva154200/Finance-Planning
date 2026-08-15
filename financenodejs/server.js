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
            customer_id: "TEST_NODE_001",
            age: 30,
            occupation: "Software Engineer",
            dependents: 1,

            monthly_income: 100000,
            monthly_expenses: 40000,
            monthly_debt_payment: 10000,

            cash_savings: 300000,
            existing_investments: 500000,
            property_value: 0,
            other_assets: 100000,

            total_assets: 900000,
            total_liabilities: 200000,

            emergency_fund: 200000,
            insurance_coverage: 1000000,

            credit_score: 750,

            risk_tolerance: "Moderate",
            investment_experience: "Intermediate",
            risk_score: 65,

            financial_goal: "Wealth Creation",
            goal_amount: 5000000,
            current_goal_savings: 500000,

            time_horizon_years: 10,

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