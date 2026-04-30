const chatService = require("../services/chatService");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Join a specific train room
        socket.on("joinRoom", (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
        });

        // Handle Chat Message
        socket.on("sendMessage", async (data) => {
            try {
                const newMessage = await chatService.saveMessage(data);
                // Broadcast message to everyone in the room
                io.to(data.room).emit("receiveMessage", newMessage);
            } catch (err) {
                console.error("Socket Message Error:", err);
            }
        });

        // Handle New Poll
        socket.on("createPoll", async (data) => {
            try {
                const newPoll = await chatService.createPoll(data);
                // Broadcast poll to everyone in the room
                io.to(data.room).emit("receivePoll", newPoll);
            } catch (err) {
                console.error("Socket Poll Error:", err);
            }
        });

        // Handle Vote
        socket.on("votePoll", async (data) => {
            try {
                const updatedPoll = await chatService.votePoll(data.pollId, data.optionId);
                if (updatedPoll) {
                    // Broadcast updated poll to everyone in the room
                    io.to(data.room).emit("updatePoll", updatedPoll);
                }
            } catch (err) {
                console.error("Socket Vote Error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
};
