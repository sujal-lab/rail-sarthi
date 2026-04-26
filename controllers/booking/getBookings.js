const Booking = require("../../models/Booking");

module.exports = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Read Error:", error);
        res.status(500).json({ message: "Error fetching bookings" });
    }
};