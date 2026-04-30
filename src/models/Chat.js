const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
    id: String,
    text: String,
    votes: { type: Number, default: 0 }
});

const chatSchema = new mongoose.Schema({
    room: { type: String, required: true },
    type: { type: String, enum: ["message", "poll"], required: true },

    senderName: {
        type: String,
        default: "Anonymous Traveler"
    },

    text: String,       // for message
    question: String,   // for poll

    options: [optionSchema],
    totalVotes: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);