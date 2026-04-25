const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    trainId: String,
    trainName: String,
    destination: String,
    passengerName: String,
    age: Number,
    date: String
});

module.exports = mongoose.model("Booking", bookingSchema);