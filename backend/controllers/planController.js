const {
    generateFinancialPlan
} = require("../services/mlService");
const {
    analyzeFinancialPlan
} = require("../services/geminiService");

const generatePlan = async (req, res) => {
    try {
        const customerData = req.body;
        
        // Ensure customer data is associated with the authenticated user
        customerData.customer_id = req.user._id.toString();

        const mlResult = await generateFinancialPlan(
            customerData
        );

        const geminiAnalysis = await analyzeFinancialPlan(mlResult);

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

module.exports = {
    generatePlan
};