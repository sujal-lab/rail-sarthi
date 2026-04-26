const Chat = require("../../models/Chat");

module.exports = async (req, res) => {
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
        console.error("Create Poll Error:", error);
        res.status(500).json({ message: "Error creating poll" });
    }
};