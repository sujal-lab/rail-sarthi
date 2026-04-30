const Booking = require("../models/Booking");
const Train = require("../models/Train");

// Handles seat booking logic (Confirm/Waiting)
const createBooking = async ({ userId, trainId, passengerName, age, date }) => {
    const train = await Train.findById(trainId);
    if (!train) {
        const err = new Error("Train not found");
        err.statusCode = 404;
        throw err;
    }

    let status = "CONFIRMED";
    let queuePosition = null;

    if (train.availableSeats > 0) {
        train.availableSeats -= 1;
        await train.save();
    } else {
        status = "WAITING";
        const waitingCount = await Booking.countDocuments({ trainId, status: "WAITING" });
        queuePosition = waitingCount + 1;
    }

    const booking = await Booking.create({
        userId,
        trainId,
        passengerName,
        age,
        date,
        status,
        queuePosition,
    });

    return booking;
};

// Cancels booking and moves next person from waiting list
const cancelBooking = async ({ bookingId, userId }) => {
    // Atomic delete with ownership check
    const booking = await Booking.findOneAndDelete({
        _id: bookingId,
        userId,
    });

    if (!booking) {
        const err = new Error("Booking not found or not authorized");
        err.statusCode = 404;
        throw err;
    }

    const train = await Train.findById(booking.trainId);
    if (!train) {
        const err = new Error("Train associated with this booking no longer exists");
        err.statusCode = 404;
        throw err;
    }

    if (booking.status === "CONFIRMED") {
        // Free the seat
        train.availableSeats += 1;

        // Promote the first waiting booking
        const nextBooking = await Booking.findOne({
            trainId: booking.trainId,
            status: "WAITING",
        }).sort({ queuePosition: 1 });

        if (nextBooking) {
            nextBooking.status = "CONFIRMED";
            nextBooking.queuePosition = null;
            await nextBooking.save();
            train.availableSeats -= 1;
        }
    }

    // Rebalance queue positions for all remaining WAITING bookings
    const waitingBookings = await Booking.find({
        trainId: booking.trainId,
        status: "WAITING",
    }).sort({ queuePosition: 1 });

    for (let i = 0; i < waitingBookings.length; i++) {
        waitingBookings[i].queuePosition = i + 1;
        await waitingBookings[i].save();
    }

    await train.save();

    return booking;
};

// Get all bookings for a specific user
const getUserBookings = async (userId) => {
    return Booking.find({ userId });
};

module.exports = { createBooking, cancelBooking, getUserBookings };
