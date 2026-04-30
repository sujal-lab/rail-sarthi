const chatService = require("../../services/chatService");

// Get messages for a room (Thin Controller)
module.exports = async (req, res, next) => {
    try {
        const chats = await chatService.getMessagesByRoom(req.params.room);
        res.status(200).json(chats);
    } catch (error) {
        next(error);
    }
};