const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
    trainNo: { type: String, required: true, unique: true },
    trainName: { type: String, required: true },
    source: String,
    destination: String,
    dep: String,
    arr: String,
    startDate: String,
    endDate: String,
    totalSeats: Number,
    availableSeats: Number,
    price: Number
}, { timestamps: true });

module.exports = mongoose.model("Train", trainSchema);