const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const bookingsFile = path.join(__dirname, "../data/bookings.json");
const trainsFile = path.join(__dirname, "../data/trains.json");

// Ensure files exist to prevent read errors
if (!fs.existsSync(bookingsFile)) {
    fs.writeFileSync(bookingsFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(trainsFile)) {
    fs.writeFileSync(trainsFile, JSON.stringify([], null, 2));
}

// ===============================
// Helper: Read JSON File
// ===============================
function readData(filePath) {
    const data = fs.readFileSync(filePath, "utf-8");
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
    try {
        const bookings = readData(bookingsFile);
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Read Error:", error);
        res.status(500).json({ message: "Error reading bookings file" });
    }
});

// ===============================
// 2️⃣ POST /bookings
// ===============================
router.post("/", (req, res) => {
    try {
        // Extract the new age and date fields sent from the frontend
        const { trainId, passengerName, age, date } = req.body;

        // Basic validation updated for new fields
        if (!trainId || !passengerName || !age || !date) {
            return res.status(400).json({
                message: "trainId, passengerName, age, and date are required"
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

        // Create new booking with the updated payload and a string ID
        const newBooking = {
            id: "BKG" + Date.now().toString(), // BKG prefix matches frontend UI expectations
            trainId,
            trainName: train.trainName, // Storing trainName prevents needing a join on the frontend
            passengerName,
            age: Number(age),
            date
        };

        // Save booking
        bookings.push(newBooking);
        writeData(bookingsFile, bookings);

        res.status(201).json({
            message: "Booking successful",
            booking: newBooking
        });
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: "Error processing booking" });
    }
});

// ===============================
// 3️⃣ DELETE /bookings/:id
// ===============================
router.delete("/:id", (req, res) => {
    try {
        // IDs are now strings (e.g., "BKG123456789"), so we remove parseInt()
        const bookingId = req.params.id; 

        const bookings = readData(bookingsFile);

        const bookingIndex = bookings.findIndex(b => b.id === bookingId || b.id == bookingId);

        if (bookingIndex === -1) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        const deletedBooking = bookings.splice(bookingIndex, 1);

        writeData(bookingsFile, bookings);

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking: deletedBooking[0]
        });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Error cancelling booking" });
    }
});

module.exports = router;