const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    trainId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Train",
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