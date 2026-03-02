const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Path of trains.json file
const filePath = path.join(__dirname, '../data/trains.json');

module.exports = router;


// Function to read trains from file
function readTrains() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

// Function to write trains to file
function writeTrains(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

}



// GET /trains
router.get("/", (req, res) => {
    try {
        const trains = readTrains();
        res.json(trains);
    } catch (error) {
        res.status(500).json({ message: "Error reading trains file" });
    }
});


// GET /trains/:id
router.get("/:id", (req, res) => {
    try {
        const trains = readTrains();

        const train = trains.find(t => t.id === req.params.id);

        if (!train) {
            return res.status(404).json({ message: "Train not found" });
        }

        res.json(train);

    } catch (error) {
        res.status(500).json({ message: "Error fetching train" });
    }
});



// POST /trains
router.post('/', (req, res) => {
    try {
        const { trainName, source, destination } = req.body;

        // Basic validation
        if (!trainName || !source || !destination) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const trains = readTrains();

        // Generate sequential ID
        const newId = trains.length > 0 
            ? parseInt(trains[trains.length - 1].id) + 1 
            : 1;

        const newTrain = {
            id: newId.toString(),
            trainName,
            source,
            destination
        };

        trains.push(newTrain);
        writeTrains(trains);

        res.status(201).json(newTrain);

    } catch (error) {
        res.status(500).json({ message: "Error adding train" });
    }
});

// DELETE /trains/:id
router.delete('/:id', (req, res) => {
    try {
        const trains = readTrains();
        const updatedTrains = trains.filter(t => t.id !== req.params.id);

        if (trains.length === updatedTrains.length) {
            return res.status(404).json({ message: "Train not found" });
        }

        writeTrains(updatedTrains);

        res.json({ message: "Train deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error deleting train" });
    }
});