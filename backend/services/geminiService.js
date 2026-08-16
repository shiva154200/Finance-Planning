const { GoogleGenAI, Type } = require("@google/genai");

// Use the exact variable name from your .env
const API_KEY = process.env.Gemini_API_Key;

if (!API_KEY) {
    console.error("Gemini API key is missing from .env");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analyzeFinancialPlan = async (mlResult) => {
    try {
        const prompt = `
You are an AI financial planning assistant.

Analyze the following financial profile and ML-generated financial plans.

IMPORTANT RULES:
- Use the ML result as the source of truth.
- Do not invent financial values.
- Do not change the ML recommendations.
- Do not create fake investment returns.
- Do not invent customer information.
- Explain the plans in simple language.
- Provide practical and actionable suggestions.
- Return ONLY valid JSON matching the requested schema.

ML GENERATED RESULT:

${JSON.stringify(mlResult, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executive_summary: {
                            type: Type.STRING,
                            description:
                                "A clear and simple summary of the user's financial situation and generated plans."
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
                                required: [
                                    "plan_name",
                                    "pros",
                                    "cons"
                                ]
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
                                "The recommended plan and a clear explanation of why it suits the user."
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

        console.log("Gemini response received successfully.");

        return JSON.parse(responseText);

    } catch (error) {
        console.error("Gemini Analysis Error:", error.message);
        console.error(error);

        throw new Error("Failed to generate AI analysis");
    }
};

module.exports = {
    analyzeFinancialPlan
};
