const bookingService = require("../services/bookingService");

const createBooking = async (req, res, next) => {
    try {
        const { trainId, passengerName, age, date } = req.body;
        const userId = req.user.id;

        const booking = await bookingService.createBooking({ userId, trainId, passengerName, age: Number(age), date });

        res.status(201).json(booking);
    } catch (error) {
        next(error);
    }
};

const deleteBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.cancelBooking({
            bookingId: req.params.id,
            userId: req.user.id,
        });

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        next(error);
    }
};

const getBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.getUserBookings(req.user.id);
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    deleteBooking,
    getBookings
};
