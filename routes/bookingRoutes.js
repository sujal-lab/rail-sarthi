const express = require("express");

const validateBooking = require("../middleware/validateBooking");
const validateId = require("../middleware/validateId");

const getBookings = require("../controllers/booking/getBookings");
const createBooking = require("../controllers/booking/createBooking");
const deleteBooking = require("../controllers/booking/deleteBooking");

const router = express.Router();

router.get("/", getBookings);
router.post("/", validateBooking, createBooking);
router.delete("/:id", validateId, deleteBooking);

module.exports = router;