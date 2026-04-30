const trainService = require("../services/trainService");

const createTrain = async (req, res, next) => {
    try {
        const newTrain = await trainService.createTrain(req.body);
        res.status(201).json(newTrain);
    } catch (error) {
        next(error);
    }
};

const deleteTrain = async (req, res, next) => {
    try {
        await trainService.deleteTrain(req.params.id);
        res.status(200).json({ message: "Train deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const getTrainById = async (req, res, next) => {
    try {
        const train = await trainService.getTrainById(req.params.id);
        res.status(200).json(train);
    } catch (error) {
        next(error);
    }
};

const getTrains = async (req, res, next) => {
    try {
        const trains = await trainService.getAllTrains();
        res.status(200).json(trains);
    } catch (error) {
        next(error);
    }
};

const updateTrain = async (req, res, next) => {
    try {
        const train = await trainService.updateTrain(req.params.id, req.body);
        res.status(200).json(train);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTrain,
    deleteTrain,
    getTrainById,
    getTrains,
    updateTrain
};
