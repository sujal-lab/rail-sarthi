const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser"); // Ek baar import
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const viewRoutes = require("./routes/viewRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// 1. SETTINGS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 2. MIDDLEWARE (Order is very important!)
app.use(cookieParser()); // Cookie parser pehle
app.use(express.json()); // JSON parser uske baad
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.use(express.static("public")); // Static files like CSS

// 3. ROUTES
app.use("/auth", authRoutes); // Auth routes (Signup/Login)
app.use("/view", viewRoutes); // View routes (EJS Pages)
app.use("/trains", trainRoutes);
app.use("/bookings", bookingRoutes);
app.use("/chats", chatRoutes);

// Root redirect
app.get("/", (req, res) => {
    res.redirect("/view/home");
});

// 4. ERROR HANDLING
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);

module.exports = app;