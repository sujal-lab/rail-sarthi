const express = require("express");
const router = express.Router();
const login = require("../controllers/auth/login");
const signup = require("../controllers/auth/signup");
const logout = require("../controllers/auth/logout"); // NEW

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout); // NEW

module.exports = router;