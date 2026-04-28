const User = require("../../models/User");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).send("User already exists. <a href='/view/signup'>Try again</a>");
        }

        const user = new User({ name, email, password });
        await user.save();

        res.redirect("/view/login");
    } catch (err) {
        res.status(500).send("Internal Server Error: " + err.message);
    }
};

module.exports = signup;