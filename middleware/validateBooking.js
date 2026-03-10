module.exports = function validateBooking(req, res, next) {

    const { trainId, passengerName, age, date } = req.body;

    if (!trainId || !passengerName || !age || !date) {
        return res.status(400).json({
            message: "trainId, passengerName, age, and date are required"
        });
    }

    if (isNaN(Number(age))) {
        return res.status(400).json({
            message: "Age must be a number"
        });
    }

    next();
};