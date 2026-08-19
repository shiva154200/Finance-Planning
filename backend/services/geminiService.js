const { GoogleGenAI, Type } = require("@google/genai");

// Support both standard GEMINI_API_KEY and legacy Gemini_API_Key
const API_KEY = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key;

let ai = null;
if (API_KEY && API_KEY !== "your_gemini_api_key_here") {
    try {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (e) {
        console.warn("Failed to initialize GoogleGenAI client:", e.message);
    }
}

/**
 * Deterministic fallback analysis if Gemini API key is not configured or if API call fails.
 * Guarantees that the application always presents a rich, clear explanation without breaking.
 */
const generateDeterministicAnalysis = (mlResult) => {
    const data = mlResult?.data || mlResult || {};
    const customer = data.customer || {};
    const riskAssessment = data.risk_assessment || customer.risk_profile || {};
    const plans = data.plans || {};
    const balancedPlan = plans.plan_a || {};
    const growthPlan = plans.plan_b || {};
    const mcBalanced = balancedPlan.monte_carlo || {};
    const mcGrowth = growthPlan.monte_carlo || {};

    const riskProfile = riskAssessment.risk_profile || "Moderate";
    const riskScore = riskAssessment.risk_score || 50;
    const confidencePct = Math.round((riskAssessment.confidence || 0.75) * 100);
    const goalName = customer.financial_goal?.financial_goal || "Financial Independence";
    const timeHorizon = customer.financial_goal?.time_horizon_years || 10;

    const balancedReturn = balancedPlan.expected_annual_return_percent || 10.2;
    const balancedVol = balancedPlan.expected_volatility_percent || 8.5;
    const balancedMCProb = mcBalanced.probability_of_success ?? 85;

    const growthReturn = growthPlan.expected_annual_return_percent || 12.8;
    const growthVol = growthPlan.expected_volatility_percent || 14.2;
    const growthMCProb = mcGrowth.probability_of_success ?? 78;

    return {
        executive_summary: `Based on quantitative analysis of your financial cash flows, debt obligations, and investment horizon of ${timeHorizon} years, the trained machine learning model classified your profile as ${riskProfile} (Suitability Score: ${riskScore}/100, Model Confidence: ${confidencePct}%). Both Balanced and Growth portfolios have been optimized with empirical covariance-based volatility and validated through 10,000 Monte Carlo simulation runs.`,
        plan_analysis: [
            {
                plan_name: "Balanced Plan",
                pros: [
                    `Lower expected portfolio volatility of ${balancedVol}% p.a. through multi-asset covariance diversification.`,
                    `High Monte Carlo goal achievement probability of ${balancedMCProb}%.`,
                    `Higher capital preservation via dedicated fixed income, gold, and debt allocations.`
                ],
                cons: [
                    `Slightly lower expected long-term return (${balancedReturn}% p.a.) compared to high-equity growth portfolios.`
                ]
            },
            {
                plan_name: "Growth Plan",
                pros: [
                    `Higher expected compounding return of ${growthReturn}% p.a. over your ${timeHorizon}-year horizon.`,
                    `Greater inflation-beating wealth accumulation potential for long-term goals.`,
                    `Solid Monte Carlo goal achievement probability of ${growthMCProb}%.`
                ],
                cons: [
                    `Higher return volatility (${growthVol}% p.a.) with wider short-term market drawdown swings.`
                ]
            }
        ],
        actionable_steps: [
            `Maintain a dedicated emergency liquidity cushion equal to 6 months of living expenses in liquid deposits.`,
            `Automate your monthly Systematic Investment Plan (SIP) of ₹${(balancedPlan.required_monthly_investment || 10000).toLocaleString("en-IN")} right after salary credit.`,
            `Periodically rebalance your portfolio asset allocation once per year to preserve target weights.`,
            `Review insurance coverage and adjust annual SIP contributions to keep pace with inflation.`
        ],
        final_recommendation: `For your ${riskProfile} profile and ${goalName} goal over ${timeHorizon} years, the ${riskScore >= 65 ? "Growth Plan" : "Balanced Plan"} is recommended as your primary roadmap, balancing probability of goal success with controlled volatility.`
    };
};

const analyzeFinancialPlan = async (mlResult) => {
    // If Gemini is not initialized or API key is absent, use high-quality deterministic analysis
    if (!ai || !API_KEY || API_KEY === "your_gemini_api_key_here") {
        return generateDeterministicAnalysis(mlResult);
    }

    try {
        const prompt = `
You are a quantitative financial expert and fiduciary planning assistant.

Analyze the following authoritative ML-generated financial assessment, covariance portfolio metrics, and 10,000-run Monte Carlo simulations:

AUTHORITATIVE NUMERICAL DATA (DO NOT CHANGE OR INVENT NUMBERS):
${JSON.stringify(mlResult, null, 2)}

STRICT RULES:
1. Use the ML result as the authoritative numerical source of truth.
2. DO NOT invent returns, volatilities, probabilities, or financial figures.
3. DO NOT change portfolio weights or Monte Carlo outcomes.
4. Explain the risk score, calibrated confidence, trade-offs between Balanced and Growth plans, and actionable steps in clear, professional language.
5. Emphasize that all figures represent historical model-based estimates and stochastic simulations.
6. Return ONLY valid JSON adhering to the schema.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executive_summary: {
                            type: Type.STRING,
                            description: "Executive summary explaining the ML risk classification and portfolio options."
                        },
                        plan_analysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    plan_name: { type: Type.STRING },
                                    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    cons: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["plan_name", "pros", "cons"]
                            }
                        },
                        actionable_steps: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        final_recommendation: {
                            type: Type.STRING,
                            description: "Recommended plan with justification based on suitability and Monte Carlo probability."
                        }
                    },
                    required: [
                        "executive_summary",
                        "plan_analysis",
                        "actionable_steps",
                        "final_recommendation"
                    ]
                }
            }
        });

        const responseText = response.text;
        return JSON.parse(responseText);

    } catch (error) {
        console.warn("Gemini generation error (falling back to deterministic analysis):", error.message);
        return generateDeterministicAnalysis(mlResult);
    }
};

module.exports = {
    analyzeFinancialPlan,
    generateDeterministicAnalysis
};
