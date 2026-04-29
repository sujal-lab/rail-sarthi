const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send("Invalid credentials. <a href='/view/login'>Try again</a>");

        // 2. Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid credentials. <a href='/view/login'>Try again</a>");

        // 3. Create the JWT token with extended payload
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        // 4. Send token in a secure HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        // 5. Role-based redirection (browser) or JSON response (API clients)
        if (req.accepts("html")) {
            if (user.role === "admin") {
                return res.redirect("/view/admin");
            } else {
                return res.redirect("/view/home");
            }
        }

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        next(err);
    }
};


module.exports = login;