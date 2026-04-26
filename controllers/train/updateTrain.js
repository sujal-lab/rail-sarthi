const Train = require("../../models/Train");

module.exports = async (req, res) => {
    try {
        const {
            trainNo, trainName, source, destination,
            dep, arr, totalSeats, price,
            startDate, endDate
        } = req.body;

        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        const duplicate = await Train.findOne({
            trainNo,
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(400).json({
                message: "Train number already exists for another train"
            });
        }

        train.trainNo = trainNo;
        train.trainName = trainName;
        train.source = source;
        train.destination = destination;
        train.dep = dep;
        train.arr = arr;
        train.startDate = startDate;
        train.endDate = endDate;
        train.totalSeats = totalSeats;
        train.price = price;

        await train.save();

        res.status(200).json(train);

    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Error updating train" });
    }
};