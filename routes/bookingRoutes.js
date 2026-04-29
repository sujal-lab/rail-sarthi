const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const validateBooking = require("../middleware/validateBooking");
const validateId = require("../middleware/validateId");

const createBooking = require("../controllers/booking/createBooking");
const getBookings = require("../controllers/booking/getBookings");
const deleteBooking = require("../controllers/booking/deleteBooking");

// Secure ALL booking routes
router.use(auth);

// POST /bookings — Create a new booking
router.post("/", validateBooking, createBooking);

// GET /bookings — Get all bookings for the authenticated user
router.get("/", getBookings);

// DELETE /bookings/:id — Cancel a booking (ownership enforced in service)
router.delete("/:id", validateId, deleteBooking);

module.exports = router;