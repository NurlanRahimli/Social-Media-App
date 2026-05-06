const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    sendMessage,
    getMessages,
    editMessage,
    markAsSeen,
    deleteMessage
} = require("../controllers/messageController");


router.get("/", (req, res) => {
    res.send("Messages route works");
});


router.post("/", protect, sendMessage);
router.put("/seen/:userId", protect, markAsSeen);
router.put("/:messageId", protect, editMessage);
router.get("/:userId", protect, getMessages);
router.delete("/:messageId", protect, deleteMessage);

module.exports = router;