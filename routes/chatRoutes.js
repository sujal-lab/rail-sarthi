const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const getChatsByRoom = require("../controllers/chat/getChatsByRoom");
const createMessage = require("../controllers/chat/createMessage");
const createPoll = require("../controllers/chat/createPoll");
const votePoll = require("../controllers/chat/votePoll");

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