const User = require("../../models/User");

// Define a list of authorized admin emails
const ADMIN_EMAILS = [
    "sujalkandari11@gmail.com",
    "salaj7534@gmail.com",
    "simonhambiria@gmail.com"
];

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).send("User already exists. <a href='/view/signup'>Try again</a>");
        }

        // Automatically assign admin role if email matches
        const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";

        const user = new User({ name, email, password, role });
        await user.save();

        res.redirect("/view/login");
    } catch (err) {
        res.status(500).send("Internal Server Error: " + err.message);
    }
};

module.exports = signup;