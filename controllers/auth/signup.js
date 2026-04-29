const User = require("../../models/User");
const jwt = require("jsonwebtoken");

// Admin emails should ideally come from env, but kept here for backward compatibility.
// To move to env: ADMIN_EMAILS=a@x.com,b@x.com  →  process.env.ADMIN_EMAILS.split(",")
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "sujalkandari11@gmail.com,salaj7534@gmail.com,simonhambiria@gmail.com")
    .split(",")
    .map(e => e.trim().toLowerCase());

const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).send("User already exists. <a href='/view/signup'>Try again</a>");
        }

        const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";

        const user = new User({ name, email, password, role });
        await user.save();

        // Issue JWT so API clients (e.g. Postman) can authenticate immediately after register
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Set cookie for browser-based flow
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        // Smart Response: JSON for API/Postman, Redirect for Browser Forms
        if (req.is("json")) {
            return res.status(201).json({ 
                token, 
                user: { id: user._id, name: user.name, email: user.email, role: user.role } 
            });
        }

        // Default to redirect for browser form submissions
        res.redirect("/view/login");
    } catch (err) {
        next(err);
    }
};

module.exports = signup;