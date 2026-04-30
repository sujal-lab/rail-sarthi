const trainService = require("../../services/trainService");

// Delete a train (Thin Controller)
module.exports = async (req, res, next) => {
    try {
        await trainService.deleteTrain(req.params.id);
        res.status(200).json({ message: "Train deleted successfully" });
    } catch (error) {
        next(error);
    }
};