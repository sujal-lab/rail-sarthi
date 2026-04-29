const { createBooking } = require("../../services/bookingService");

module.exports = async (req, res, next) => {
    try {
        const { trainId, passengerName, age, date } = req.body;
        const userId = req.user.id;

        const booking = await createBooking({ userId, trainId, passengerName, age: Number(age), date });

        res.status(201).json(booking);
    } catch (error) {
        next(error);
    }
};