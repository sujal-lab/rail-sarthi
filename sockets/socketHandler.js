const Chat = require("../models/Chat");

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
            const { room, senderName, text } = data;
            try {
                const newMessage = new Chat({
                    room,
                    type: "message",
                    senderName: senderName || "Anonymous Traveler",
                    text
                });
                await newMessage.save();

                // Broadcast message to everyone in the room
                io.to(room).emit("receiveMessage", newMessage);
            } catch (err) {
                console.error("Socket Message Error:", err);
            }
        });

        // Handle New Poll
        socket.on("createPoll", async (data) => {
            const { room, senderName, question, options } = data;
            try {
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
                await newPoll.save();

                // Broadcast poll to everyone in the room
                io.to(room).emit("receivePoll", newPoll);
            } catch (err) {
                console.error("Socket Poll Error:", err);
            }
        });

        // Handle Vote
        socket.on("votePoll", async (data) => {
            const { room, pollId, optionId } = data;
            try {
                const poll = await Chat.findById(pollId);
                if (poll && poll.type === "poll") {
                    const option = poll.options.find(o => o.id === optionId);
                    if (option) {
                        option.votes += 1;
                        poll.totalVotes += 1;
                        await poll.save();

                        // Broadcast updated poll to everyone in the room
                        io.to(room).emit("updatePoll", poll);
                    }
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
