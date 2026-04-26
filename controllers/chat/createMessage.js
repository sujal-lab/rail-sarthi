const Chat = require("../../models/Chat");

module.exports = async (req, res) => {
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
        console.error("Post Message Error:", error);
        res.status(500).json({ message: "Error posting message" });
    }
};