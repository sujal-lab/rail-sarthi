const Booking = require("../../models/Booking");

module.exports = async (req, res) => {
    try {
        const bookingId = req.params.id;

        const deleted = await Booking.findByIdAndDelete(bookingId);

        if (!deleted) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking: deleted
        });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Error cancelling booking" });
    }
};