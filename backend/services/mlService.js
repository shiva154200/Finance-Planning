const axios = require("axios");

const ML_SERVICE_URL =
    process.env.ML_SERVICE_URL || "http://localhost:8000";

const generateFinancialPlan = async (customerData) => {
    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/generate-plan`,
            customerData
        );

        return response.data;

    } catch (error) {

        if (error.response) {
            throw new Error(
                `ML Service Error: ${error.response.data.detail || "Request failed"}`
            );
        }

        throw new Error(
            `ML Service unavailable: ${error.message}`
        );
    }
};

module.exports = {
    generateFinancialPlan
};