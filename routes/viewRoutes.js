const express = require("express");
const Train = require("../models/Train");
const Booking = require("../models/Booking");
const jwt = require("jsonwebtoken"); // New logic integrated

const router = express.Router();


router.get("/home", (req, res) => {
   
    const token = req.cookies ? req.cookies.token : null; 
    let user = null;

    if (token) {
        try {
            // 2. Token verify karke user info nikalna
            user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            user = null; 
        }
    }

    res.render("home", { 
        currentPage: "home", 
        user: user 
    }); 
});

// Tickets — search + server-rendered results
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

// Bookings — server-rendered table
router.get("/bookings", async (req, res) => {
    const bookings = await Booking.find();
    res.render("bookings", { currentPage: "bookings", bookings });
});

// Admin — server-rendered train list
router.get("/admin", async (req, res) => {
    const trains = await Train.find();
    res.render("admin", { currentPage: "admin", trains });
});

// Default redirect
router.get("/", (req, res) => {
    res.redirect("/view/home"); 
});

module.exports = router;