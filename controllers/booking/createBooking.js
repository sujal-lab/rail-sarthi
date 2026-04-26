const Booking = require("../../models/Booking");
const Train = require("../../models/Train");

module.exports = async (req, res) => {
    try {
        const { trainId, passengerName, age, date } = req.body;

        // Find train from DB using MongoDB _id
        console.log("Received trainId:", trainId);
        const train = await Train.findById(trainId);
        console.log("Train found:", train);

        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        // Create new booking
        const newBooking = new Booking({
            trainId,
            trainName: train.trainName,
            destination: train.destination,
            passengerName,
            age: Number(age),
            date
        });

        await newBooking.save();

        res.status(201).json({
            message: "Booking successful",
            booking: newBooking
        });

    } catch (error) {
        console.error("Create Error:", error);
        res.status(500).json({ message: "Error processing booking" });
    }
};