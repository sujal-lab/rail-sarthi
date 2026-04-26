const cookieParser = require("cookie-parser");
const express = require("express");  
const path = require("path");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const viewRoutes = require("./routes/viewRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cookieParser());
app.use("/view",viewRoutes);
app.use("/auth",authRoutes);

app.use("/auth", authRoutes);
app.use(cookieParser());
// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

// API route mounting (unchanged)
app.use("/trains", trainRoutes);
app.use("/bookings", bookingRoutes);
app.use("/chats", chatRoutes);

// View routes (EJS pages)
app.use("/view", viewRoutes);

// Root redirect to home page
app.get("/", (req, res) => {
    res.redirect("/view/home");
});

// Serve static files (CSS, any remaining JS)
app.use(express.static("public"));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

module.exports = app;