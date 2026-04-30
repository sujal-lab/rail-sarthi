const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Respect custom statusCode thrown from service layer (e.g. 404, 403)
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message || "Something went wrong",
    });
};

module.exports = errorHandler;