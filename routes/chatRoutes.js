const express = require("express");

const getChatsByRoom = require("../controllers/chat/getChatsByRoom");
const createMessage = require("../controllers/chat/createMessage");
const createPoll = require("../controllers/chat/createPoll");
const votePoll = require("../controllers/chat/votePoll");

const router = express.Router();

router.get("/:room", getChatsByRoom);

router.post("/:room/message", createMessage);

router.post("/:room/poll", createPoll);

router.post("/:room/vote/:pollId", votePoll);

module.exports = router;