const express = require("express");
const router = express.Router();

const Train = require("../models/Train");

// ----------------------
// GET ALL TRAINS
// ----------------------
router.get("/", async (req, res) => {
    try {
        const trains = await Train.find();
        res.json(trains);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching trains" });
    }
});


// ----------------------
// ADD TRAIN
// ----------------------
router.post("/", async (req, res) => {
    try {
        const train = await Train.create(req.body);
        res.status(201).json(train);
    } catch (error) {
    console.error("REAL ERROR:", error);
    res.status(500).json({ message: error.message });
}
});

module.exports = router;