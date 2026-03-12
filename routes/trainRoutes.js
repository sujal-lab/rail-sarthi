const express = require('express');
const fs = require('fs');
const path = require('path');

const validateTrain = require('../middleware/validateTrain');
const validateId = require('../middleware/validateId');

const router = express.Router();


const filePath = path.join(__dirname, '../data/trains.json');


if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
}


function readTrains() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}


function writeTrains(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}



router.get("/", (req, res) => {
    try {
        const trains = readTrains();
        res.status(200).json(trains);
    } catch (error) {
        console.error("Read Error:", error);
        res.status(500).json({ message: "Error reading trains file" });
    }
});


router.get("/:id", validateId, (req, res) => {
    try {
        const trains = readTrains();
        const train = trains.find(t => t.id === req.params.id);

        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        res.status(200).json(train);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Error fetching train" });
    }
});

router.post("/", validateTrain, (req, res) => {
    try {
        const { 
            trainNo, trainName, source, destination, 
            dep, arr, totalSeats, price, 
            startDate, endDate // <--- ADDED
        } = req.body;

        const trains = readTrains();

        if (trains.some(t => t.trainNo === trainNo)) {
            return res.status(400).json({ message: "Train number already exists" });
        }

        const newTrain = {
            id: Date.now().toString(),
            trainNo,
            trainName,
            source,
            destination,
            dep,
            arr,
            startDate, 
            endDate,   
            totalSeats,
            availableSeats: totalSeats,
            price
        };

        trains.push(newTrain);
        writeTrains(trains);
        res.status(201).json(newTrain);
    } catch (error) {
        res.status(500).json({ message: "Error adding train" });
    }
});


router.delete("/:id", validateId, (req, res) => {
    try {

        const trains = readTrains();
        const updatedTrains = trains.filter(t => t.id !== req.params.id);

        if (trains.length === updatedTrains.length) {
            return res.status(404).json({ message: "Train not found" });
        }

        writeTrains(updatedTrains);

        res.status(200).json({
            message: "Train deleted successfully"
        });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Error deleting train" });
    }
});

module.exports = router;