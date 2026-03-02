const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Train route working");
});

module.exports = router;