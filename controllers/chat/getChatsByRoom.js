const Chat = require("../../models/Chat");

module.exports = async (req, res) => {
    try {
        const chats = await Chat.find({ room: req.params.room });
        res.status(200).json(chats);
    } catch (error) {
        console.error("Read Chats Error:", error);
        res.status(500).json({ message: "Error fetching chats" });
    }
};