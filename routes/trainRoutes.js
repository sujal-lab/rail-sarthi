const express = require("express");

const validateTrain = require("../middleware/validateTrain");
const validateId = require("../middleware/validateId");

const getTrains = require("../controllers/train/getTrains");
const getTrainById = require("../controllers/train/getTrainById");
const createTrain = require("../controllers/train/createTrain");
const updateTrain = require("../controllers/train/updateTrain");
const deleteTrain = require("../controllers/train/deleteTrain");

const router = express.Router();

router.get("/", getTrains);
router.get("/:id", validateId, getTrainById);
router.post("/", validateTrain, createTrain);
router.put("/:id", validateTrain, validateId, updateTrain);
router.delete("/:id", validateId, deleteTrain);

module.exports = router;