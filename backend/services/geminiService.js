const { GoogleGenAI, Type } = require("@google/genai");

const API_KEY = process.env.Gemini_API_Key;

if (!API_KEY) {
    console.error("Gemini API key is missing from .env");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const GEMINI_RESPONSE_SCHEMA = {
    type: Type.OBJECT,

    properties: {
        executive_summary: {
            type: Type.STRING,
            description:
                "A clear and simple summary of the user's financial situation and generated plans. Use only ML-provided numbers and classifications. Do not make guarantees about future financial outcomes."
        },

        plan_analysis: {
            type: Type.ARRAY,

            items: {
                type: Type.OBJECT,

                properties: {
                    plan_name: {
                        type: Type.STRING
                    },

                    pros: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    },

                    cons: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    }
                },

                required: ["plan_name", "pros", "cons"]
            }
        },

        actionable_steps: {
            type: Type.ARRAY,

            items: {
                type: Type.STRING
            }
        },

        final_recommendation: {
            type: Type.STRING,
            description:
                "The recommended plan and a clear explanation of why it may suit the user. Use only ML-provided values. Do not guarantee future returns or achievement of financial goals."
        }
    },

    required: [
        "executive_summary",
        "plan_analysis",
        "actionable_steps",
        "final_recommendation"
    ]
};


/* ============================================================
   COMPARE TWO NUMBERS
============================================================ */

const compareNumbers = (
    labelA,
    valueA,
    labelB,
    valueB,
    bHigherDescriptor,
    aHigherDescriptor,
    equalDescriptor
) => {
    if (valueA == null || valueB == null) {
        return null;
    }

    if (valueB > valueA) {
        return (
            `${labelB} (${valueB}) is HIGHER than ${labelA} (${valueA}). ` +
            `${bHigherDescriptor}`
        );
    }

    if (valueA > valueB) {
        return (
            `${labelA} (${valueA}) is HIGHER than ${labelB} (${valueB}). ` +
            `${aHigherDescriptor}`
        );
    }

    return (
        `${labelA} and ${labelB} are EQUAL (${valueA}). ` +
        `${equalDescriptor}`
    );
};


/* ============================================================
   RISK CAPACITY INTERPRETATION
============================================================ */

const describeRiskCapacityScore = (score) => {
    if (score == null) {
        return null;
    }

    let level;

    if (score >= 70) {
        level = "HIGH";
    } else if (score >= 40) {
        level = "MODERATE";
    } else {
        level = "LOW";
    }

    return (
        `ML risk_capacity_score = ${score} on a 0-100 scale, where ` +
        `higher scores mean greater financial capacity to bear risk. ` +
        `This score indicates ${level} risk capacity. ` +
        `Do NOT describe this score as low risk capacity if it is 70 or above.`
    );
};


/* ============================================================
   BUILD AUTHORITATIVE ML FACTS
============================================================ */

const buildMlComparisonFacts = (mlResult) => {
    const data = mlResult?.data ?? mlResult;

    const plans = data?.plans;
    const customer = data?.customer;

    const lines = [];

    if (!plans?.plan_a || !plans?.plan_b) {
        return "No plan comparison facts available from ML output.";
    }

    const planA = plans.plan_a;
    const planB = plans.plan_b;


    /* --------------------------------------------------------
       PLAN NAMES
    -------------------------------------------------------- */

    lines.push(
        "AUTHORITATIVE PLAN COMPARISON FACTS " +
        "(derived directly from ML output — DO NOT contradict):"
    );

    lines.push(`Plan A name: ${planA.name ?? "plan_a"}`);
    lines.push(`Plan B name: ${planB.name ?? "plan_b"}`);


    /* --------------------------------------------------------
       EXPECTED RETURN
    -------------------------------------------------------- */

    const returnComparison = compareNumbers(
        "Plan A expected_annual_return_percent",
        planA.expected_annual_return_percent,

        "Plan B expected_annual_return_percent",
        planB.expected_annual_return_percent,

        "Plan B has higher expected return.",

        "Plan A has higher expected return.",

        "Both plans have the same expected return."
    );

    if (returnComparison) {
        lines.push(returnComparison);
    }


    /* --------------------------------------------------------
       VOLATILITY
    -------------------------------------------------------- */

    const volatilityComparison = compareNumbers(
        "Plan A expected_volatility_percent",
        planA.expected_volatility_percent,

        "Plan B expected_volatility_percent",
        planB.expected_volatility_percent,

        "Plan B has HIGHER volatility and therefore greater risk and uncertainty.",

        "Plan A has HIGHER volatility and therefore greater risk and uncertainty.",

        "Both plans have the same volatility."
    );

    if (volatilityComparison) {
        lines.push(volatilityComparison);
    }


    /* --------------------------------------------------------
       REQUIRED MONTHLY INVESTMENT
    -------------------------------------------------------- */

    const monthlyComparison = compareNumbers(
        "Plan A required_monthly_investment",
        planA.required_monthly_investment,

        "Plan B required_monthly_investment",
        planB.required_monthly_investment,

        "Plan B requires a higher monthly investment.",

        "Plan A requires a higher monthly investment.",

        "Both plans require the same monthly investment."
    );

    if (monthlyComparison) {
        lines.push(monthlyComparison);
    }


    /* --------------------------------------------------------
       FIXED ALLOCATIONS
    -------------------------------------------------------- */

    if (planA.allocation) {
        lines.push(
            `Plan A allocation (FIXED — do not change): ${JSON.stringify(
                planA.allocation
            )}`
        );
    }

    if (planB.allocation) {
        lines.push(
            `Plan B allocation (FIXED — do not change): ${JSON.stringify(
                planB.allocation
            )}`
        );
    }


    /* --------------------------------------------------------
       RISK PROFILE
    -------------------------------------------------------- */

    if (planA.risk_profile != null) {
        lines.push(
            `Plan A risk_profile from ML: ${planA.risk_profile}`
        );
    }

    if (planB.risk_profile != null) {
        lines.push(
            `Plan B risk_profile from ML: ${planB.risk_profile}`
        );
    }


    /* --------------------------------------------------------
       TIME HORIZON
    -------------------------------------------------------- */

    if (planA.time_horizon_years != null) {
        lines.push(
            `Plan time_horizon_years from ML: ${planA.time_horizon_years}`
        );
    }


    /* --------------------------------------------------------
       FINANCIAL GOAL
    -------------------------------------------------------- */

    if (planA.financial_goal != null) {
        lines.push(
            `Financial goal from ML: ${planA.financial_goal}`
        );
    }


    /* ========================================================
       CUSTOMER RISK FACTS
    ======================================================== */

    const riskProfile = customer?.risk_profile;

    if (riskProfile) {
        lines.push(
            "AUTHORITATIVE RISK FACTS " +
            "(from ML customer analysis — DO NOT reinterpret):"
        );

        if (riskProfile.risk_tolerance_score != null) {
            lines.push(
                `ML risk_tolerance_score: ${riskProfile.risk_tolerance_score}`
            );
        }

        if (riskProfile.risk_capacity_score != null) {
            lines.push(
                describeRiskCapacityScore(
                    riskProfile.risk_capacity_score
                )
            );
        }

        if (riskProfile.final_risk_score != null) {
            lines.push(
                `ML final_risk_score: ${riskProfile.final_risk_score}`
            );
        }

        if (riskProfile.risk_profile != null) {
            lines.push(
                `ML final risk_profile classification: ${riskProfile.risk_profile}. ` +
                `Use this EXACT classification. Do not substitute your own classification.`
            );
        }

        if (riskProfile.investment_experience != null) {
            lines.push(
                `ML investment_experience: ${riskProfile.investment_experience}`
            );
        }

        if (riskProfile.preferred_investment != null) {
            lines.push(
                `ML preferred_investment: ${riskProfile.preferred_investment}`
            );
        }
    }


    /* ========================================================
       CUSTOMER FINANCIAL METRICS
    ======================================================== */

    const financialMetrics = customer?.financial_metrics;

    if (financialMetrics) {
        lines.push(
            "AUTHORITATIVE FINANCIAL METRICS FROM ML:"
        );

        if (financialMetrics.monthly_income != null) {
            lines.push(
                `ML monthly_income: ${financialMetrics.monthly_income}`
            );
        }

        if (financialMetrics.monthly_expenses != null) {
            lines.push(
                `ML monthly_expenses: ${financialMetrics.monthly_expenses}`
            );
        }

        if (financialMetrics.monthly_debt_payment != null) {
            lines.push(
                `ML monthly_debt_payment: ${financialMetrics.monthly_debt_payment}`
            );
        }

        if (financialMetrics.monthly_savings != null) {
            lines.push(
                `ML monthly_savings: ${financialMetrics.monthly_savings}`
            );
        }

        if (financialMetrics.savings_rate != null) {
            lines.push(
                `ML savings_rate: ${financialMetrics.savings_rate}`
            );
        }

        if (financialMetrics.debt_to_income_ratio != null) {
            lines.push(
                `ML debt_to_income_ratio: ${financialMetrics.debt_to_income_ratio}`
            );
        }

        if (financialMetrics.total_assets != null) {
            lines.push(
                `ML total_assets: ${financialMetrics.total_assets}`
            );
        }

        if (financialMetrics.total_liabilities != null) {
            lines.push(
                `ML total_liabilities: ${financialMetrics.total_liabilities}`
            );
        }

        if (financialMetrics.net_worth != null) {
            lines.push(
                `ML net_worth: ${financialMetrics.net_worth}`
            );
        }
    }


    /* ========================================================
       FINANCIAL GOAL FACTS
    ======================================================== */

    const goal = customer?.financial_goal;

    if (goal) {
        lines.push(
            "AUTHORITATIVE FINANCIAL GOAL FACTS FROM ML:"
        );

        if (goal.financial_goal != null) {
            lines.push(
                `ML financial_goal: ${goal.financial_goal}`
            );
        }

        if (goal.goal_amount != null) {
            lines.push(
                `ML goal_amount: ${goal.goal_amount}`
            );
        }

        if (goal.current_goal_savings != null) {
            lines.push(
                `ML current_goal_savings: ${goal.current_goal_savings}`
            );
        }

        if (goal.goal_gap != null) {
            lines.push(
                `ML goal_gap: ${goal.goal_gap}. ` +
                `Use this exact value. DO NOT recalculate it.`
            );
        }

        if (goal.time_horizon_years != null) {
            lines.push(
                `ML goal time_horizon_years: ${goal.time_horizon_years}`
            );
        }
    }

    return lines.join("\n");
};


/* ============================================================
   BUILD GEMINI PROMPT
============================================================ */

const buildGeminiPrompt = (mlResult) => {
    const comparisonFacts = buildMlComparisonFacts(mlResult);

    return `
You are an AI financial planning explanation assistant.

Your role is STRICTLY to explain the financial analysis generated by the ML service in clear, simple, practical language.

You are NOT the financial calculation engine.

The Python ML service performs the financial calculations, risk analysis, historical analysis, asset allocation, expected return calculation, volatility calculation, and required monthly investment calculation.

Gemini's role is ONLY to explain the ML-generated results.

============================================================
SOURCE OF TRUTH
============================================================

The ML service output is the SINGLE SOURCE OF TRUTH.

Treat every value and classification supplied by the ML service as an IMMUTABLE FACT.

This includes:

- income
- expenses
- monthly savings
- savings rate
- debt-to-income ratio
- assets
- liabilities
- net worth
- risk tolerance score
- risk capacity score
- final risk score
- final risk profile
- investment experience
- financial goal
- goal amount
- current goal savings
- goal gap
- time horizon
- asset allocations
- expected annual returns
- volatility
- required monthly investment
- historical returns
- historical volatility
- other ML-generated metrics

If a value appears unusual, DO NOT correct it.

If a value appears inconsistent with your own knowledge, DO NOT replace it.

Use the ML value exactly as supplied.

============================================================
MANDATORY NUMERICAL RULES
============================================================

1. NEVER recalculate a numerical value.

2. NEVER modify a numerical value.

3. NEVER invent a numerical value.

4. NEVER contradict a numerical value supplied by ML.

5. NEVER independently calculate risk scores.

6. NEVER independently calculate risk capacity.

7. NEVER independently calculate goal gap.

8. NEVER independently calculate required monthly investment.

9. NEVER independently calculate expected returns.

10. NEVER independently calculate volatility.

11. NEVER create a different asset allocation.

12. NEVER substitute your own risk classification for the ML classification.

13. When comparing two values, preserve the exact mathematical relationship supplied by ML.

14. If Plan B has higher volatility than Plan A, explicitly state that Plan B has higher volatility.

15. If Plan B has higher expected return than Plan A, explicitly state that Plan B has higher expected return.

16. If Plan B requires a lower monthly investment than Plan A, explicitly state that Plan B has a lower calculated required monthly investment.

17. Do not claim that a lower required monthly investment means guaranteed success.

============================================================
RISK CAPACITY RULE
============================================================

The ML service uses a 0-100 risk_capacity_score.

For this ML system:

- 0-39 = LOW risk capacity
- 40-69 = MODERATE risk capacity
- 70-100 = HIGH risk capacity

Higher risk_capacity_score means GREATER financial capacity to bear investment risk.

Therefore:

A score of 90 means HIGH risk capacity.

A score of 80 means HIGH risk capacity.

A score of 70 means HIGH risk capacity.

NEVER describe a score of 70 or above as low risk capacity.

Use the exact final risk_profile classification supplied by ML.

Do not create your own classification.

============================================================
PLAN COMPARISON RULE
============================================================

When comparing Plan A and Plan B, use the exact values supplied by ML.

If Plan B has:

- higher expected return
- AND higher volatility

then explain both facts.

For example:

"Plan B has a higher expected annual return, but it also has higher volatility, meaning greater risk and uncertainty."

NEVER say that Plan B has lower volatility if its ML volatility is higher.

Similarly, NEVER say that Plan A has higher return if the ML output shows Plan B has higher return.

============================================================
ASSET ALLOCATION RULE
============================================================

Asset allocations supplied by ML are FIXED.

Do not change them.

Do not recommend a different allocation.

Do not suggest increasing or decreasing any allocation percentage.

You may explain the characteristics of the supplied allocation.

For example:

"Plan B has a 72% Equity allocation, which gives it greater growth exposure than Plan A's 65% Equity allocation."

Only say this if those exact values are present in the ML output.

============================================================
FINANCIAL PROJECTION RULES
============================================================

Expected returns, volatility, required monthly investments, and goal calculations are MODEL-BASED estimates.

They are NOT guarantees.

NEVER describe an expected return as guaranteed.

NEVER describe a projected result as certain.

NEVER promise future investment performance.

NEVER say that a plan WILL achieve a financial goal.

============================================================
FORBIDDEN FINANCIAL GUARANTEE LANGUAGE
============================================================

DO NOT use phrases such as:

- "will secure your goal"
- "will achieve your goal"
- "will definitely achieve"
- "guarantees"
- "guaranteed return"
- "guaranteed profit"
- "you will reach your goal"
- "this plan ensures"
- "this investment will generate"
- "this plan will make you"
- "you are guaranteed to"
- "this will ensure your financial future"

Instead, use language such as:

- "is designed to help you work toward your goal"
- "provides a calculated path toward the goal"
- "may be better suited to the goal"
- "has higher expected growth potential"
- "based on the assumptions used by the planning engine"
- "according to the ML-generated calculation"
- "has a higher expected return"
- "has a lower calculated monthly investment"

============================================================
GOAL INTERPRETATION
============================================================

The following values from ML are FIXED:

- goal_amount
- current_goal_savings
- goal_gap
- required_monthly_investment

You may explain these values.

However, required_monthly_investment is a CALCULATED amount from the planning engine.

It is NOT a guarantee of achieving the financial goal.

For example, if:

goal_amount = 10000000
current_goal_savings = 1000000
goal_gap = 9000000
required_monthly_investment = 23294.49

You may say:

"The current goal gap is ₹90 lakh."

You may say:

"The Growth Plan has a calculated required monthly investment of ₹23,294.49 based on the planning engine's assumptions."

You may say:

"The plan is designed to help you work toward the ₹1 crore wealth-creation goal."

You MUST NOT say:

"The Growth Plan will secure your ₹1 crore goal."

You MUST NOT say:

"The Growth Plan guarantees that you will reach ₹1 crore."

You MUST NOT say:

"Investing ₹23,294.49 will ensure that you achieve the goal."

============================================================
EXPECTED RETURN RULE
============================================================

Expected annual return is an ML-generated estimate based on the planning engine and historical data.

Always describe it as an expected, estimated, projected, or historical-based value.

Correct:

"Plan B has an expected annual return of 9.23%."

Incorrect:

"Plan B will generate a 9.23% annual return."

Incorrect:

"Plan B guarantees a 9.23% return."

============================================================
VOLATILITY RULE
============================================================

Volatility represents the model's measure of variability/risk and uncertainty.

If Plan B volatility is 11.19% and Plan A volatility is 10.28%, say:

"Plan B has higher expected volatility than Plan A, indicating greater risk and uncertainty."

Never reverse this relationship.

============================================================
PLAN ANALYSIS REQUIREMENTS
============================================================

For each plan, analyze only the supplied ML information.

Where available, consider:

- expected annual return
- expected volatility
- asset allocation
- risk profile
- time horizon
- financial goal
- required monthly investment

The plan_analysis array must contain one entry for each generated plan.

Set plan_name to the EXACT ML plan name.

Pros and cons must be supported by the ML output.

Do not invent advantages or disadvantages that require information not supplied by ML.

============================================================
ACTIONABLE STEPS
============================================================

Actionable steps should be practical and based only on the ML-generated plan.

Do not introduce new financial numbers.

Do not invent new percentages.

Do not recommend a different asset allocation.

Do not promise future returns.

Do not guarantee achievement of the financial goal.

It is acceptable to tell the user to:

- review the two plans
- compare expected return and volatility
- choose the plan that better matches their supplied risk profile
- maintain the calculated monthly investment if they choose to follow the plan
- review their plan periodically

============================================================
RECOMMENDATION RULE
============================================================

The final recommendation must be based ONLY on the supplied ML output.

You may recommend a plan as "better suited" based on:

- risk profile
- risk capacity
- time horizon
- financial goal
- expected return
- volatility
- asset allocation
- required monthly investment

However, the recommendation MUST NOT guarantee future performance or goal achievement.

GOOD:

"We recommend the Growth Plan because it has a higher expected annual return and may be better suited to the supplied Moderately Aggressive risk profile and 15-year time horizon."

GOOD:

"Based on the ML-generated analysis, the Growth Plan may be better suited to the user's long-term wealth-creation objective."

BAD:

"We recommend the Growth Plan because it will secure the user's goal."

BAD:

"The Growth Plan guarantees that the user will achieve the goal."

============================================================
NUMBER FORMATTING
============================================================

You may format numbers for readability without changing their underlying values.

Examples:

10000000 → ₹1 crore

9000000 → ₹90 lakh

100000 → ₹1 lakh

23294.49 → ₹23,294.49/month

23934.6 → ₹23,934.60/month

Formatting is allowed.

Changing the underlying value is NOT allowed.

============================================================
ANTI-HALLUCINATION RULE
============================================================

If information required for an explanation is NOT present in the ML output:

- Do not guess.
- Do not invent.
- Do not calculate it yourself.
- Do not use outside financial assumptions.
- Do not introduce new numerical values.

Only explain information supported by the ML output.

============================================================
OUTPUT REQUIREMENTS
============================================================

Return ONLY valid JSON matching the supplied response schema.

The JSON must contain:

- executive_summary
- plan_analysis
- actionable_steps
- final_recommendation

Do not return Markdown.

Do not return explanations outside the JSON.

Do not add additional JSON fields that are not part of the schema.

============================================================
AUTHORITATIVE ML COMPARISON FACTS
============================================================

${comparisonFacts}

============================================================
FULL ML RESULT
============================================================

${JSON.stringify(mlResult, null, 2)}

============================================================
FINAL INSTRUCTION
============================================================

Remember:

ML SERVICE = SOURCE OF TRUTH AND CALCULATIONS.

GEMINI = EXPLANATION LAYER ONLY.

Calculate nothing.

Change nothing.

Contradict nothing.

Invent nothing.

Do not make financial guarantees.

Explain the supplied ML results clearly, accurately, and cautiously.
`;
};


/* ============================================================
   ANALYZE FINANCIAL PLAN
============================================================ */

const analyzeFinancialPlan = async (mlResult) => {
    try {
        const prompt = buildGeminiPrompt(mlResult);

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",

            contents: prompt,

            config: {
                responseMimeType: "application/json",
                responseSchema: GEMINI_RESPONSE_SCHEMA
            }
        });

        const responseText = response.text;

        if (!responseText) {
            throw new Error("Gemini returned an empty response");
        }

        const parsed = JSON.parse(responseText);

        console.log("Gemini response received successfully.");

        return parsed;

    } catch (error) {
        console.error("Gemini Analysis Error:", error.message);
        console.error(error);

        throw new Error("Failed to generate AI analysis");
    }
};


module.exports = {
    analyzeFinancialPlan,
    buildGeminiPrompt,
    buildMlComparisonFacts
};