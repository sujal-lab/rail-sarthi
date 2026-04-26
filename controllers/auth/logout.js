const logout = (req, res) => {
    res.clearCookie("token"); // Cookie delete karein
    res.redirect("/view/home"); // Wapas landing page par bhejein
};

module.exports = logout;