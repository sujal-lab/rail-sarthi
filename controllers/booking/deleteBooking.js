const { cancelBooking } = require("../../services/bookingService");

module.exports = async (req, res, next) => {
    try {
        const booking = await cancelBooking({
            bookingId: req.params.id,
            userId: req.user.id,
        });

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        next(error);
    }
};