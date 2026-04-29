const Chat = require("../../models/Chat");

module.exports = async (req, res, next) => {
    try {
        const chats = await Chat.find({ room: req.params.room });
        res.status(200).json(chats);
    } catch (error) {
        next(error);
    }
};