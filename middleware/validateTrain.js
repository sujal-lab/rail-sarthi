module.exports = function validateTrain(req, res, next) {

    let { trainNo, trainName, source, destination, dep, arr, totalSeats, price } = req.body;

    trainNo = trainNo?.trim();
    trainName = trainName?.trim();
    source = source?.trim();
    destination = destination?.trim();
    dep = dep?.trim();
    arr = arr?.trim();

    totalSeats = Number(totalSeats);
    price = Number(price);

    if (
        !trainNo ||
        !trainName ||
        !source ||
        !destination ||
        !dep ||
        !arr ||
        isNaN(totalSeats) ||
        isNaN(price)
    ) {
        return res.status(400).json({
            message: "Invalid train data"
        });
    }

    next(); // move to route
};