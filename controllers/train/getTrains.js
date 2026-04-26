const Train = require("../../models/Train");

module.exports = async (req, res) => {
    try {
        const trains = await Train.find();
        res.status(200).json(trains);
    } catch (error) {
        console.error("Read Error:", error);
        res.status(500).json({ message: "Error fetching trains" });
    }
};