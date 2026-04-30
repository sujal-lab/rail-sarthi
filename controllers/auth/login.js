const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
// Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send("Invalid credentials. <a href='/view/login'>Try again</a>");

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid credentials. <a href='/view/login'>Try again</a>");

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        // Save token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        // Send JSON for API, Redirect for Browser
        if (req.is("json")) {
            return res.json({ 
                token, 
                user: { id: user._id, name: user.name, email: user.email, role: user.role } 
            });
        }

        // Default to redirect for browser form submissions
        if (user.role === "admin") {
            return res.redirect("/view/admin");
        } else {
            return res.redirect("/view/home");
        }

    } catch (err) {
        next(err);
    }
};


module.exports = login;