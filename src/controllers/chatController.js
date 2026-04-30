const Chat = require("../models/Chat");
const chatService = require("../services/chatService");

const createMessage = async (req, res, next) => {
    try {
        const { senderName, text } = req.body;

        const message = new Chat({
            room: req.params.room,
            type: "message",
            senderName: senderName || "Anonymous Traveler",
            text
        });

        await message.save();

        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};

const createPoll = async (req, res, next) => {
    try {
        const { senderName, question, options } = req.body;

        if (!options || options.length < 2) {
            return res.status(400).json({
                message: "Poll must have at least 2 options."
            });
        }

        const formattedOptions = options.map((opt, index) => ({
            id: index.toString(),
            text: opt,
            votes: 0
        }));

        const poll = new Chat({
            room: req.params.room,
            type: "poll",
            senderName: senderName || "Anonymous Traveler",
            question,
            options: formattedOptions,
            totalVotes: 0
        });

        await poll.save();

        res.status(201).json(poll);
    } catch (error) {
        next(error);
    }
};

const getChatsByRoom = async (req, res, next) => {
    try {
        const chats = await chatService.getMessagesByRoom(req.params.room);
        res.status(200).json(chats);
    } catch (error) {
        next(error);
    }
};

const votePoll = async (req, res, next) => {
    try {
        const { optionId } = req.body;

        const poll = await Chat.findById(req.params.pollId);

        if (!poll || poll.type !== "poll") {
            return res.status(404).json({ message: "Poll not found" });
        }

        const option = poll.options.find(o => o.id === optionId);

        if (!option) {
            return res.status(400).json({ message: "Invalid poll option" });
        }

        option.votes += 1;
        poll.totalVotes += 1;

        await poll.save();

        res.status(200).json(poll);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createMessage,
    createPoll,
    getChatsByRoom,
    votePoll
};
