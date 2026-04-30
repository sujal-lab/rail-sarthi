const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const { getChatsByRoom, createMessage, createPoll, votePoll } = require("../controllers/chatController");

// Secure ALL chat routes
router.use(auth);

// GET /chats/:room — Get all messages/polls in a room
router.get("/:room", getChatsByRoom);

// POST /chats/:room/message — Post a new message
router.post("/:room/message", createMessage);

// POST /chats/:room/poll — Create a poll
router.post("/:room/poll", createPoll);

// POST /chats/:room/vote/:pollId — Vote on a poll
router.post("/:room/vote/:pollId", votePoll);

module.exports = router;