const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Train route working");
});
router.get("/error-test", (req, res) => {
    throw new Error("Testing global error handler");
});

module.exports = router;