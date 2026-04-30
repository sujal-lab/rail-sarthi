const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const validateTrain = require("../middleware/validateTrain");
const validateId = require("../middleware/validateId");

const { getTrains, getTrainById, createTrain, updateTrain, deleteTrain } = require("../controllers/trainController");

// GET /trains — Public: get all trains
router.get("/", getTrains);

// GET /trains/:id — Public: get a single train by ID
router.get("/:id", validateId, getTrainById);

// POST /trains — Admin only: add a new train
router.post("/", auth, adminAuth, validateTrain, createTrain);

// PUT /trains/:id — Admin only: update a train
router.put("/:id", auth, adminAuth, validateId, validateTrain, updateTrain);

// DELETE /trains/:id — Admin only: remove a train
router.delete("/:id", auth, adminAuth, validateId, deleteTrain);

module.exports = router;