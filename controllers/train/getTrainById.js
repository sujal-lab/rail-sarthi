const Train = require("../../models/Train");

module.exports = async (req, res) => {
    try {
        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        res.status(200).json(train);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Error fetching train" });
    }
};