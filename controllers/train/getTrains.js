const Train = require("../../models/Train");

module.exports = async (req, res, next) => {
    try {
        const trains = await Train.find();
        res.status(200).json(trains);
    } catch (error) {
        next(error);
    }
};