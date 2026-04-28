const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Train = require("../models/Train");
const auth = require("../middleware/auth");

// Secure all booking routes
router.use(auth);

// ----------------------
// BOOK TICKET
// ----------------------
router.post("/", async (req, res) => {
    try {
        console.log("POST /bookings hit:", req.body);
        const { trainId, passengerName, age, date } = req.body;
        const userId = req.user.id; // Extract from JWT safely

        // 1. Input Validation
        if (!passengerName || age <= 0 || !date || !trainId) {
            return res.status(400).json({ error: "Invalid input" });
        }

        const train = await Train.findById(trainId);
        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        let status = "CONFIRMED";
        let queuePosition = null;

        // Seat available → Confirm
        if (train.availableSeats > 0) {
            train.availableSeats -= 1;
            await train.save();
        } 
        // No seat → WAITING
        else {
            status = "WAITING";

            const waitingCount = await Booking.countDocuments({
                trainId,
                status: "WAITING"
            });

            queuePosition = waitingCount + 1;
        }

        const booking = await Booking.create({
            userId,
            trainId,
            passengerName,
            age,
            date,
            status,
            queuePosition
        });

        res.status(201).json(booking);

    } catch (error) {
        console.error("BOOK ERROR:", error);
        res.status(500).json({ message: error.message });
    }
});


// ----------------------
// GET ALL BOOKINGS (For the authenticated user)
// ----------------------
router.get("/", async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id });
        return res.json(bookings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


// ----------------------
// CANCEL BOOKING (QUEUE LOGIC)
// ----------------------
router.delete("/:id", async (req, res) => {
    try {
        // Atomic find and delete with ownership check
        const booking = await Booking.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or not authorized" });
        }

        const train = await Train.findById(booking.trainId);
        if (!train) {
            return res.status(404).json({ message: "Train not found for this booking" });
        }

        // If confirmed → free seat
        if (booking.status === "CONFIRMED") {
            train.availableSeats += 1;

            // Find first waiting user
            const nextBooking = await Booking.findOne({
                trainId: booking.trainId,
                status: "WAITING"
            }).sort({ queuePosition: 1 });

            if (nextBooking) {
                nextBooking.status = "CONFIRMED";
                nextBooking.queuePosition = null;
                await nextBooking.save();

                train.availableSeats -= 1;
            }

            // Update queue positions for remaining waiting users
            const waitingBookings = await Booking.find({
                trainId: booking.trainId,
                status: "WAITING"
            }).sort({ queuePosition: 1 });

            for (let i = 0; i < waitingBookings.length; i++) {
                waitingBookings[i].queuePosition = i + 1;
                await waitingBookings[i].save();
            }
        } else if (booking.status === "WAITING") {
            // Update queue positions for remaining waiting users
            const waitingBookings = await Booking.find({
                trainId: booking.trainId,
                status: "WAITING"
            }).sort({ queuePosition: 1 });

            for (let i = 0; i < waitingBookings.length; i++) {
                waitingBookings[i].queuePosition = i + 1;
                await waitingBookings[i].save();
            }
        }

        await train.save();

        res.json({ message: "Booking cancelled successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting booking" });
    }
});

module.exports = router;