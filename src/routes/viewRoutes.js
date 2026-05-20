const express = require("express");
const Train = require("../models/Train");
const prisma = require("../config/prisma");
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
    const bookings = await prisma.booking.findMany({
        where: { userId: Number(res.locals.user.id) }
    });
    
    const trainIds = bookings.map(b => b.trainId);
    const trains = await Train.find({ _id: { $in: trainIds } });
    const trainMap = {};
    trains.forEach(t => trainMap[t._id.toString()] = t);

    const formattedBookings = bookings.map(b => {
        const train = trainMap[b.trainId];
        return {
            _id: b.id,
            passengerName: b.passengerName,
            date: b.date,
            trainName: train ? train.trainName : 'Unknown Train',
            destination: train ? train.destination : 'Unknown Destination',
            status: b.status
        };
    });

    res.render("bookings", { currentPage: "bookings", bookings: formattedBookings });
});

// AI Itinerary Proxy (Gemini API with retry + model fallback)
router.post("/ai-itinerary", requireAuth, async (req, res) => {
    const apiKey = 'AIzaSyD4MSUdULv7Zkjj3qNsoCVjTBigF1aFccQ';
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    const maxRetries = 2;

    for (const model of models) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                console.log(`AI Itinerary: Trying ${model} (attempt ${attempt + 1})`);
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: req.body.prompt }] }],
                            generationConfig: {
                                temperature: 0.3,
                                responseMimeType: "application/json"
                            }
                        })
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log(`AI Itinerary: Success with ${model}`);
                    return res.json(data);
                }

                const errBody = await response.json().catch(() => ({}));
                console.error(`AI Itinerary: ${model} returned ${response.status}`, errBody.error?.message?.substring(0, 100));

                // If 503 (overloaded) or 429 (rate limit), wait and retry
                if (response.status === 503 || response.status === 429) {
                    if (attempt < maxRetries) {
                        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                        continue;
                    }
                }
                // For other errors (404, 401, etc.), skip to next model immediately
                break;

            } catch (error) {
                console.error(`AI Itinerary: Fetch error with ${model}:`, error.message);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                break;
            }
        }
    }

    // All models failed
    res.status(500).json({ error: "All AI models are temporarily unavailable. Please try again in a moment." });
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