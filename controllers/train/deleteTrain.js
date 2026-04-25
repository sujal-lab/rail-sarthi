const Train = require("../../models/Train");

module.exports = async (req, res) => {
    try {
        const deleted = await Train.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Train not found" });
        }

        res.status(200).json({
            message: "Train deleted successfully"
        });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Error deleting train" });
    }
};