const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
    trainNo: { type: String, unique: true },
    trainName: String,
    source: String,
    destination: String,
    dep: String,
    arr: String,
    totalSeats: Number,
    availableSeats: Number,
    price: Number,
    startDate: String,
    endDate: String
});

module.exports = mongoose.model("Train", trainSchema);