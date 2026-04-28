const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/view/login");
};

module.exports = logout;