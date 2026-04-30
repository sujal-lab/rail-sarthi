const authService = require("../services/authService");

// Login controller (Thin)
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Call Service Logic
        const { token, user } = await authService.login({ email, password });

        // Save token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        // Send JSON for API, Redirect for Browser
        if (req.is("json")) {
            return res.json({ token, user });
        }

        if (user.role === "admin") {
            return res.redirect("/view/admin");
        } else {
            return res.redirect("/view/home");
        }

    } catch (err) {
        // If service throws error, this caught it
        if (err.statusCode === 400 && !req.is("json")) {
            return res.status(400).send(`${err.message}. <a href='/view/login'>Try again</a>`);
        }
        next(err);
    }
};

// Signup controller (Thin)
const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Call Service Logic
        const { token, user } = await authService.signup({ name, email, password });

        // Set cookie for authentication
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        // Send JSON for API, Redirect for Browser
        if (req.is("json")) {
            return res.status(201).json({ token, user });
        }

        res.redirect("/view/login");
    } catch (err) {
        if (err.statusCode === 400 && !req.is("json")) {
            return res.status(400).send(`${err.message}. <a href='/view/signup'>Try again</a>`);
        }
        next(err);
    }
};

// Logout controller
const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/view/login");
};

module.exports = {
    login,
    signup,
    logout
};
