const express = require("express");  

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(express.json());

app.use(logger);

// Route mounting
app.use("/trains", trainRoutes);
app.use("/bookings", bookingRoutes);
app.use("/chats", chatRoutes);

// Serve static files
app.use(express.static("public"));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

module.exports = app;