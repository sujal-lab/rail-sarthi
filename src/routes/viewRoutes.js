const express = require("express");
const Train = require("../models/Train");
const Booking = require("../models/Booking");
const jwt = require("jsonwebtoken");

const router = express.Router();

// 1. Global Middleware: Extract user from token
router.use((req, res, next) => {
    const token = req.cookies ? req.cookies.token : null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded; // Attach to res.locals for EJS templates
        } catch (err) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
});

// Middleware to protect routes (Authentication required)
const requireAuth = (req, res, next) => {
    if (!res.locals.user) {
        return res.redirect("/view/login");
    }
    next();
};

// Middleware to protect admin routes (Admin role required)
const requireAdmin = (req, res, next) => {
    if (!res.locals.user || res.locals.user.role !== "admin") {
        return res.redirect("/view/login");
    }
    next();
};


// Auth Views
router.get("/login", (req, res) => {
    // If already logged in, redirect based on role
    if (res.locals.user) {
        return res.redirect(res.locals.user.role === "admin" ? "/view/admin" : "/view/home");
    }
    res.render("login", { currentPage: "login" });
});

router.get("/signup", (req, res) => {
    if (res.locals.user) {
        return res.redirect(res.locals.user.role === "admin" ? "/view/admin" : "/view/home");
    }
    res.render("signup", { currentPage: "signup" });
});

// Public View: Home
router.get("/home", (req, res) => {
    res.render("home", { currentPage: "home" }); 
});

// Public View: Tickets
router.get("/tickets", async (req, res) => {
    const { from, to, date } = req.query;
    let trains = null; 

    if (from && to && date) {
        const allTrains = await Train.find();
        trains = allTrains.filter(t => {
            const routeMatch = t.source.toLowerCase().includes(from.toLowerCase())
                            && t.destination.toLowerCase().includes(to.toLowerCase());

            if (!t.startDate || !t.endDate) return routeMatch;

            const travel = new Date(date).setHours(0, 0, 0, 0);
            const start  = new Date(t.startDate).setHours(0, 0, 0, 0);
            const end    = new Date(t.endDate).setHours(0, 0, 0, 0);

            return routeMatch && (travel >= start && travel <= end);
        });
    }

    res.render("tickets", { currentPage: "tickets", trains, from, to, date });
});

// Protected View: Bookings
router.get("/bookings", requireAuth, async (req, res) => {
    const bookings = await Booking.find({ userId: res.locals.user.id }).populate("trainId");
    
    const formattedBookings = bookings.map(b => ({
        _id: b._id,
        passengerName: b.passengerName,
        date: b.date,
        trainName: b.trainId ? b.trainId.trainName : 'Unknown Train',
        destination: b.trainId ? b.trainId.destination : 'Unknown Destination',
        status: b.status
    }));

    res.render("bookings", { currentPage: "bookings", bookings: formattedBookings });
});

// Admin View: Train list
router.get("/admin", requireAdmin, async (req, res) => {
    const trains = await Train.find();
    res.render("admin", { currentPage: "admin", trains });
});

// Default redirect
router.get("/", (req, res) => {
    res.redirect("/view/home"); 
});

module.exports = router;