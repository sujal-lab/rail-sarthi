const express = require("express");
const fs = require("fs");
const path = require("path");

const validateBooking = require("../middleware/validateBooking");
const validateId = require("../middleware/validateId");

const router = express.Router();

const bookingsFile = path.join(__dirname, "../data/bookings.json");
const trainsFile = path.join(__dirname, "../data/trains.json");

// Ensure files exist
if (!fs.existsSync(bookingsFile)) {
    fs.writeFileSync(bookingsFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(trainsFile)) {
    fs.writeFileSync(trainsFile, JSON.stringify([], null, 2));
}


// Helper: Read JSON File

function readData(filePath) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}


// Helper: Write JSON File

function writeData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


// GET /bookings

router.get("/", (req, res) => {
    try {
        const bookings = readData(bookingsFile);
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Read Error:", error);
        res.status(500).json({ message: "Error reading bookings file" });
    }
});




//  POST /bookings (Updated)

router.post("/", validateBooking, (req, res) => {
    try {
        const { trainId, passengerName, age, date } = req.body;
        const trains = readData(trainsFile);
        const train = trains.find(t => t.id === trainId);

        if (!train) return res.status(404).json({ message: "Train not found" });

        const bookings = readData(bookingsFile);
        const newBooking = {
            id: "BKG" + Date.now().toString(),
            trainId,
            trainName: train.trainName,
            destination: train.destination, 
            passengerName,
            age: Number(age),
            date
        };

        bookings.push(newBooking);
        writeData(bookingsFile, bookings);
        res.status(201).json({ message: "Booking successful", booking: newBooking });
    } catch (error) {   
        res.status(500).json({ message: "Error processing booking" });
    }
});
//  DELETE /bookings/:id
router.delete("/:id", validateId, (req, res) => {
    try {

        const bookingId = req.params.id;

        const bookings = readData(bookingsFile);

        const bookingIndex = bookings.findIndex(b => b.id === bookingId);

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