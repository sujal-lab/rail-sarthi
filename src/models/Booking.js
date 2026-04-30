const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    trainId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Train",
        required: true
    },
    passengerName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["CONFIRMED", "WAITING"],
        default: "CONFIRMED"
    },
    queuePosition: {
        type: Number,
        default: null
    }
});

module.exports = mongoose.model("Booking", bookingSchema);