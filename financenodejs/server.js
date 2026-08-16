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
    customer_id: "TEST_NODE_002",

    age: 50,
    occupation: "Teacher",
    dependents: 2,

    monthly_income: 90000,
    monthly_expenses: 45000,
    monthly_debt_payment: 5000,

    cash_savings: 800000,
    existing_investments: 600000,
    property_value: 2500000,
    other_assets: 200000,

    total_assets: 4100000,
    total_liabilities: 500000,

    emergency_fund: 500000,
    insurance_coverage: 2500000,

    credit_score: 780,

    risk_tolerance: "Conservative",
    investment_experience: "Beginner",
    risk_score: 30,

    financial_goal: "House Renovation",
    goal_amount: 3000000,
    current_goal_savings: 1000000,

    time_horizon_years: 3,

    preferred_investment: "FD"
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