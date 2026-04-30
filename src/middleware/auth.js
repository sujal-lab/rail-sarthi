const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    // Get token from cookies or headers
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        req.user = null;
        return res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = auth;