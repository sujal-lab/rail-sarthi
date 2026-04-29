const { getUserBookings } = require("../../services/bookingService");

module.exports = async (req, res, next) => {
    try {
        const bookings = await getUserBookings(req.user.id);
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};