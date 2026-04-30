const trainService = require("../../services/trainService");

// Get a single train by ID (Thin Controller)
module.exports = async (req, res, next) => {
    try {
        const train = await trainService.getTrainById(req.params.id);
        res.status(200).json(train);
    } catch (error) {
        next(error);
    }
};