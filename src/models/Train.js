const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
    trainNo:       { type: String, required: true, unique: true, trim: true },
    trainName:     { type: String, required: true, trim: true },
    source:        { type: String, required: true, trim: true },
    destination:   { type: String, required: true, trim: true },
    dep:           { type: String, required: true },
    arr:           { type: String, required: true },
    totalSeats:    { type: Number, required: true, min: 1 },
    availableSeats:{ type: Number, required: true, min: 0 },
    price:         { type: Number, required: true, min: 0 },
    startDate:     { type: String, required: true },
    endDate:       { type: String, required: true },
});

module.exports = mongoose.model("Train", trainSchema);