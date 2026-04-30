const trainService = require("../../services/trainService");

// Update a train (Thin Controller)
module.exports = async (req, res, next) => {
    try {
        const train = await trainService.updateTrain(req.params.id, req.body);
        res.status(200).json(train);
    } catch (error) {
        next(error);
    }
};