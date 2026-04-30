const trainService = require("../../services/trainService");

// Get all trains (Thin Controller)
module.exports = async (req, res, next) => {
    try {
        const trains = await trainService.getAllTrains();
        res.status(200).json(trains);
    } catch (error) {
        next(error);
    }
};