const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const profileRoutes = require("./routes/profileRoutes");
const planRoutes = require("./routes/planRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/profile", profileRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "AI Finance Planner Backend is running"
    });
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});