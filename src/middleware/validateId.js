module.exports = function validateId(req, res, next) {

    const id = req.params.id;

    if (!id || id.trim() === "") {
        return res.status(400).json({
            message: "Invalid ID format"
        });
    }

    next();
};