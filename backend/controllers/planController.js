const {
    generateFinancialPlan,
    predictRiskProfile
} = require("../services/mlService");
const {
    analyzeFinancialPlan,
    generateDeterministicAnalysis
} = require("../services/geminiService");

const generatePlan = async (req, res) => {
    try {
        const customerData = req.body;
        
        // Ensure customer data is associated with the authenticated user
        if (req.user && req.user._id) {
            customerData.customer_id = req.user._id.toString();
        }

        // Call ML Service to generate data-driven financial plan
        const mlResult = await generateFinancialPlan(customerData);

        // Run Gemini natural language analysis (or resilient fallback)
        let geminiAnalysis;
        try {
            geminiAnalysis = await analyzeFinancialPlan(mlResult);
        } catch (geminiError) {
            console.warn("Gemini Analysis Warning:", geminiError.message);
            geminiAnalysis = generateDeterministicAnalysis(mlResult);
        }

        res.status(200).json({
            success: true,
            data: mlResult,
            analysis: geminiAnalysis
        });

    } catch (error) {
        console.error("Generate Plan Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getRiskPrediction = async (req, res) => {
    try {
        const customerData = req.body;
        const result = await predictRiskProfile(customerData);
        res.status(200).json(result);
    } catch (error) {
        console.error("Predict Risk Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    generatePlan,
    getRiskPrediction
};