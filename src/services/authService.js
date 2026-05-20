const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase());

// Signup
const signup = async ({ name, email, password }) => {

    const userExists = await prisma.user.findUnique({
        where: { email }
    });

    if (userExists) {
        const err = new Error("User already exists");
        err.statusCode = 400;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        }
    });

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

// Login
const login = async ({ email, password }) => {

    const user = await prisma.user.findUnique({
        where: { email }
    });

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
        { id: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

module.exports = { signup, login };