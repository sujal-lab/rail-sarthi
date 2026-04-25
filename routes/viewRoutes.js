const express = require("express");
const Train = require("../models/Train");
const Booking = require("../models/Booking");

const router = express.Router();

// Home page
router.get("/home", (req, res) => {
    res.render("home", { currentPage: "home" });
});

// Tickets — search + server-rendered results
router.get("/tickets", async (req, res) => {
    const { from, to, date } = req.query;
    let trains = null; // null = no search performed yet

    if (from && to && date) {
        const allTrains = await Train.find();
        trains = allTrains.filter(t => {
            const routeMatch = t.source.toLowerCase().includes(from.toLowerCase())
                            && t.destination.toLowerCase().includes(to.toLowerCase());

            // If train has no dates (old data), skip date check
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

module.exports = router;
