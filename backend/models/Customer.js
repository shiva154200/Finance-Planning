const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        // Personal
        age: {
            type: Number,
            required: true
        },

        occupation: {
            type: String,
            required: true
        },

        dependents: {
            type: Number,
            required: true
        },

        // Financial
        monthlyIncome: {
            type: Number,
            required: true
        },

        monthlyExpenses: {
            type: Number,
            required: true
        },

        monthlyDebtEmi: {
            type: Number,
            required: true
        },

        cashSavings: {
            type: Number,
            required: true
        },

        existingInvestments: {
            type: Number,
            required: true
        },

        propertyValue: {
            type: Number,
            default: 0
        },

        otherAssets: {
            type: Number,
            default: 0
        },

        totalLiabilities: {
            type: Number,
            required: true
        },

        // Risk
        riskAnswers: {
            type: [Number],
            required: true
        },

        // Goal
        financialGoal: {
            type: String,
            required: true
        },

        goalAmount: {
            type: Number,
            required: true
        },

        currentGoalSavings: {
            type: Number,
            required: true
        },

        timeHorizon: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Customer", customerSchema);