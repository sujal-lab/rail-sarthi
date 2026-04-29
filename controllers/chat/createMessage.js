const Chat = require("../../models/Chat");

module.exports = async (req, res, next) => {
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