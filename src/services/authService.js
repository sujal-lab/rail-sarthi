const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());

// Logic for User Signup
const signup = async ({ name, email, password }) => {
    const userExists = await User.findOne({ email });
    if (userExists) {
        const err = new Error("User already exists");
        err.statusCode = 400;
        throw err;
    }

    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";
    const user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

// Logic for User Login
const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error("Invalid credentials");
        err.statusCode = 400;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const err = new Error("Invalid credentials");
        err.statusCode = 400;
        throw err;
    }

    const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

module.exports = { signup, login };
