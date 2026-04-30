const trainService = require("../../services/trainService");

// Create a new train (Thin Controller)
module.exports = async (req, res, next) => {
    try {
        const newTrain = await trainService.createTrain(req.body);
        res.status(201).json(newTrain);
    } catch (error) {
        next(error);
    }
};