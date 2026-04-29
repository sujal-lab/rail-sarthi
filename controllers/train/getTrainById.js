const Train = require("../../models/Train");

module.exports = async (req, res, next) => {
    try {
        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        res.status(200).json(train);
    } catch (error) {
        next(error);
    }
};