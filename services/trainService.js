const Train = require("../models/Train");

const getAllTrains = async () => {
    return Train.find();
};

const getTrainById = async (id) => {
    const train = await Train.findById(id);
    if (!train) {
        const err = new Error("Train not found");
        err.statusCode = 404;
        throw err;
    }
    return train;
};

const createTrain = async (trainData) => {
    const existing = await Train.findOne({ trainNo: trainData.trainNo });
    if (existing) {
        const err = new Error("Train number already exists");
        err.statusCode = 400;
        throw err;
    }

    const newTrain = new Train({
        ...trainData,
        availableSeats: trainData.totalSeats
    });

    return newTrain.save();
};

const updateTrain = async (id, updateData) => {
    const train = await Train.findById(id);
    if (!train) {
        const err = new Error("Train not found");
        err.statusCode = 404;
        throw err;
    }

    const duplicate = await Train.findOne({
        trainNo: updateData.trainNo,
        _id: { $ne: id }
    });

    if (duplicate) {
        const err = new Error("Train number already exists for another train");
        err.statusCode = 400;
        throw err;
    }

    Object.assign(train, updateData);
    return train.save();
};

const deleteTrain = async (id) => {
    const train = await Train.findByIdAndDelete(id);
    if (!train) {
        const err = new Error("Train not found");
        err.statusCode = 404;
        throw err;
    }
    return train;
};

module.exports = {
    getAllTrains,
    getTrainById,
    createTrain,
    updateTrain,
    deleteTrain
};
