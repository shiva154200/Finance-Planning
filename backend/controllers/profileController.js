const Customer = require("../models/Customer");

const createProfile = async (req, res) => {
    try {
        const profileData = { ...req.body, user: req.user._id };
        const customer = await Customer.create(profileData);

        res.status(201).json({
            success: true,
            message: "Customer profile created",
            data: customer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createProfile
};