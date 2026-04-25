const Train = require("../../models/Train");

module.exports = async (req, res) => {
    try {
        const {
            trainNo, trainName, source, destination,
            dep, arr, totalSeats, price,
            startDate, endDate
        } = req.body;

        const existing = await Train.findOne({ trainNo });

        if (existing) {
            return res.status(400).json({ message: "Train number already exists" });
        }

        const newTrain = new Train({
            id: Date.now().toString(),
            trainNo,
            trainName,
            source,
            destination,
            dep,
            arr,
            startDate,
            endDate,
            totalSeats,
            availableSeats: totalSeats,
            price
        });

        await newTrain.save();

        res.status(201).json(newTrain);

    } catch (error) {
        res.status(500).json({ message: "Error adding train" });
    }
};