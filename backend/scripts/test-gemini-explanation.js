require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { analyzeFinancialPlan } = require("../services/geminiService");

const mockMlResult = {
    success: true,
    data: {
        customer: {
            customer_id: "TEST_USER",
            age: 35,
            occupation: "Engineer",
            dependents: 1,
            financial_metrics: {
                monthly_savings: 25000,
                savings_rate: 25,
                debt_to_income_ratio: 15,
                net_worth: 1500000
            },
            risk_profile: {
                risk_tolerance_score: 80,
                risk_capacity_score: 90,
                final_risk_score: 85,
                risk_profile: "Moderately Aggressive",
                investment_experience: "Intermediate",
                preferred_investment: "Mutual Funds"
            },
            financial_goal: {
                financial_goal: "Retirement",
                goal_amount: 50000000,
                current_goal_savings: 1000000,
                goal_gap: 49000000,
                time_horizon_years: 20
            }
        },
        plans: {
            plan_a: {
                name: "Balanced Plan",
                type: "Balanced",
                risk_profile: "Moderately Aggressive",
                financial_goal: "Retirement",
                time_horizon_years: 20,
                allocation: {
                    Equity: 52.5,
                    Debt: 27.5,
                    Gold: 15,
                    FD: 5
                },
                expected_annual_return_percent: 7.11,
                expected_volatility_percent: 5.39,
                required_monthly_investment: 85000
            },
            plan_b: {
                name: "Growth Plan",
                type: "Growth",
                risk_profile: "Moderately Aggressive",
                financial_goal: "Retirement",
                time_horizon_years: 20,
                allocation: {
                    Equity: 59.5,
                    Debt: 27.5,
                    Gold: 15,
                    FD: 0
                },
                expected_annual_return_percent: 7.4,
                expected_volatility_percent: 6.31,
                required_monthly_investment: 82000
            }
        }
    }
};

const assertExplanation = (analysis) => {
    const text = JSON.stringify(analysis).toLowerCase();
    const checks = [
        {
            name: "JSON schema: executive_summary",
            pass: typeof analysis.executive_summary === "string" && analysis.executive_summary.length > 0
        },
        {
            name: "JSON schema: plan_analysis array",
            pass: Array.isArray(analysis.plan_analysis) && analysis.plan_analysis.length >= 2
        },
        {
            name: "JSON schema: actionable_steps array",
            pass: Array.isArray(analysis.actionable_steps) && analysis.actionable_steps.length > 0
        },
        {
            name: "JSON schema: final_recommendation",
            pass: typeof analysis.final_recommendation === "string" && analysis.final_recommendation.length > 0
        },
        {
            name: "Plan B higher expected return mentioned",
            pass:
                /plan b.*(higher|greater|more).*expected return|expected return.*plan b.*(higher|greater|more)|7\.4.*7\.11|7\.40.*7\.11/.test(text) ||
                text.includes("7.4") && text.includes("7.11")
        },
        {
            name: "Plan B higher volatility mentioned",
            pass:
                /plan b.*(higher|greater|more).*volatil|volatil.*plan b.*(higher|greater|more)|6\.31.*5\.39|6\.31.*greater|higher volatility.*plan b/.test(text) &&
                !/plan b.*lower volatility|lower volatility.*plan b/.test(text)
        },
        {
            name: "High risk capacity mentioned",
            pass:
                /high risk capacity|risk capacity.*high|risk_capacity_score.*90|score of 90.*high|90.*high risk capacity/.test(text) &&
                !/low risk capacity.*90|90.*low risk capacity/.test(text)
        }
    ];

    console.log("\nVerification checks:");
    let allPassed = true;

    for (const check of checks) {
        const status = check.pass ? "PASS" : "FAIL";
        console.log(`  [${status}] ${check.name}`);
        if (!check.pass) {
            allPassed = false;
        }
    }

    return allPassed;
};

const main = async () => {
    if (!process.env.Gemini_API_Key) {
        console.error("Gemini_API_Key is missing from backend/.env — cannot run live test.");
        process.exit(1);
    }

    console.log("Calling Gemini with mock ML result...\n");

    const analysis = await analyzeFinancialPlan(mockMlResult);

    console.log("Gemini JSON response:\n");
    console.log(JSON.stringify(analysis, null, 2));

    const passed = assertExplanation(analysis);

    if (!passed) {
        console.error("\nOne or more verification checks failed.");
        process.exit(1);
    }

    console.log("\nAll verification checks passed.");
};

main().catch((error) => {
    console.error("Test failed:", error.message);
    process.exit(1);
});
