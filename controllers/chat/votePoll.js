const Chat = require("../../models/Chat");

module.exports = async (req, res) => {
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
        console.error("Vote Poll Error:", error);
        res.status(500).json({ message: "Error recording vote" });
    }
};