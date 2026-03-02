const express = require("express");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Parse JSON bodies
app.use(express.json());

// Application-level middleware
app.use(logger);

// Route mounting
app.use("/trains", trainRoutes);
app.use("/bookings", bookingRoutes);

// Serve static files
app.use(express.static("public"));

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;