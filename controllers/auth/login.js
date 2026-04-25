const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // 2. Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // 3. Create the JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // 4. NEW: Send token in a secure HttpOnly cookie (This is what your friend asked for)
        res.cookie("token", token, {
            httpOnly: true, // Secure: prevents frontend scripts from accessing it
            secure: false,  // Set to true only if using HTTPS
            maxAge: 3600000 // Expires in 1 hour
        });

        // 5. Send success response
        res.json({ 
            message: "Login successful", 
            user: { id: user._id, name: user.name } 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = login;