const express = require("express");

const {
    generatePlan
} = require("../controllers/planController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, generatePlan);

module.exports = router;