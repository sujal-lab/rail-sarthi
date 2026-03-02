const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const bookingsFile = path.join(__dirname, "../data/bookings.json");
const trainsFile = path.join(__dirname, "../data/trains.json");

// ===============================
// Helper: Read JSON File
// ===============================
function readData(filePath) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

// ===============================
// Helper: Write JSON File
// ===============================
function writeData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===============================
// 1️⃣ GET /bookings
// ===============================
router.get("/", (req, res) => {
    const bookings = readData(bookingsFile);
    res.json(bookings);
});

// ===============================
// 2️⃣ POST /bookings
// ===============================
router.post("/", (req, res) => {
    const { trainId, passengerName } = req.body;

    // Basic validation
    if (!trainId || !passengerName) {
        return res.status(400).json({
            message: "trainId and passengerName are required"
        });
    }

    // Read trains
    const trains = readData(trainsFile);

    // Check if train exists
    const train = trains.find(t => t.id === trainId);

    if (!train) {
        return res.status(404).json({
            message: "Train not found"
        });
    }

    // Read existing bookings
    const bookings = readData(bookingsFile);

    // Create new booking
    const newBooking = {
        id: bookings.length + 1,
        trainId,
        passengerName
    };

    // Save booking
    bookings.push(newBooking);
    writeData(bookingsFile, bookings);

    res.status(201).json({
        message: "Booking successful",
        booking: newBooking
    });
});
// ===============================
// 3️⃣ DELETE /bookings/:id
// ===============================
router.delete("/:id", (req, res) => {
    const bookingId = parseInt(req.params.id);

    const bookings = readData(bookingsFile);

    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
        return res.status(404).json({
            message: "Booking not found"
        });
    }

    const deletedBooking = bookings.splice(bookingIndex, 1);

    writeData(bookingsFile, bookings);

    res.json({
        message: "Booking cancelled successfully",
        booking: deletedBooking[0]
    });
});

module.exports = router;