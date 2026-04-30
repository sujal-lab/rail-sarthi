const Chat = require("../models/Chat");

// Get messages for a specific room
const getMessagesByRoom = async (room) => {
    return Chat.find({ room }).sort({ createdAt: 1 });
};

// Save a new text message
const saveMessage = async ({ room, senderName, text }) => {
    const newMessage = new Chat({
        room,
        type: "message",
        senderName: senderName || "Anonymous Traveler",
        text
    });
    return newMessage.save();
};

// Create a new poll
const createPoll = async ({ room, senderName, question, options }) => {
    const formattedOptions = options.map((opt, index) => ({
        id: index.toString(),
        text: opt,
        votes: 0
    }));

    const newPoll = new Chat({
        room,
        type: "poll",
        senderName: senderName || "Anonymous Traveler",
        question,
        options: formattedOptions,
        totalVotes: 0
    });
    return newPoll.save();
};

// Register a vote on a poll
const votePoll = async (pollId, optionId) => {
    const poll = await Chat.findById(pollId);
    if (!poll || poll.type !== "poll") return null;

    const option = poll.options.find(o => o.id === optionId);
    if (!option) return null;

    option.votes += 1;
    poll.totalVotes += 1;
    return poll.save();
};

module.exports = {
    getMessagesByRoom,
    saveMessage,
    createPoll,
    votePoll
};
