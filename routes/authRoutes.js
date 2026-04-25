const express = require("express");
const router = express.Router();
const login = require("../controllers/auth/login");
const signup = require("../controllers/auth/signup");

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;