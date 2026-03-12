const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Path to chats.json
const filePath = path.join(__dirname, '../data/chats.json');

// Ensure file exists
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
}

function readChats() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

function writeChats(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 1. Get all messages/polls for a specific room
router.get('/:room', (req, res) => {
    try {
        const chats = readChats();
        // A room is just a string, e.g., "trainId_date"
        const roomChats = chats.filter(c => c.room === req.params.room);
        res.status(200).json(roomChats);
    } catch (error) {
        console.error("Read Chats Error:", error);
        res.status(500).json({ message: "Error reading chats" });
    }
});

// 2. Post a text message to a room
router.post('/:room/message', (req, res) => {
    try {
        const { senderName, text } = req.body;
        const chats = readChats();

        const newMessage = {
            id: Date.now().toString(),
            room: req.params.room,
            type: 'message', // 'message' or 'poll'
            senderName: senderName || 'Anonymous Traveler',
            text,
            timestamp: new Date().toISOString()
        };

        chats.push(newMessage);
        writeChats(chats);
        
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Post Message Error:", error);
        res.status(500).json({ message: "Error posting message" });
    }
});

// 3. Create a Custom Poll in a room
router.post('/:room/poll', (req, res) => {
    try {
        const { senderName, question, options } = req.body;
        
        if (!options || options.length < 2) {
             return res.status(400).json({ message: "Poll must have at least 2 options." });
        }

        const chats = readChats();

        // Format options into objects with a vote count of 0
        const formattedOptions = options.map((opt, index) => ({
            id: index.toString(),
            text: opt,
            votes: 0
        }));

        const newPoll = {
            id: Date.now().toString(),
            room: req.params.room,
            type: 'poll',
            senderName: senderName || 'Anonymous Traveler',
            question,
            options: formattedOptions,
            totalVotes: 0,
            timestamp: new Date().toISOString()
        };

        chats.push(newPoll);
        writeChats(chats);
        
        res.status(201).json(newPoll);
    } catch (error) {
        console.error("Create Poll Error:", error);
        res.status(500).json({ message: "Error creating poll" });
    }
});

// 4. Vote on a given Poll option
router.post('/:room/vote/:pollId', (req, res) => {
    try {
        const { optionId } = req.body; // The ID of the option selected
        const chats = readChats();

        const pollIndex = chats.findIndex(c => c.id === req.params.pollId && c.type === 'poll');
        
        if (pollIndex === -1) {
            return res.status(404).json({ message: "Poll not found" });
        }

        const poll = chats[pollIndex];
        const optionIndex = poll.options.findIndex(o => o.id === optionId);

        if (optionIndex === -1) {
             return res.status(400).json({ message: "Invalid poll option" });
        }

        // Increment the vote counts
        poll.options[optionIndex].votes += 1;
        poll.totalVotes += 1;

        chats[pollIndex] = poll;
        writeChats(chats);
        
        res.status(200).json(poll);
    } catch (error) {
        console.error("Vote Poll Error:", error);
        res.status(500).json({ message: "Error recording vote" });
    }
});

module.exports = router;
