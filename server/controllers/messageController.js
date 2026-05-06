// controllers/messageController.js

const Message = require("../models/Message");
const User = require("../models/User");


const sendMessage = async (req, res) => {
    console.log("REQ.USER:", req.user);
    try {
        const { receiverId, text } = req.body;

        const sender = await User.findById(req.user._id);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = sender.following?.includes(receiverId);
        const isFollowedBack = receiver.following?.includes(req.user._id);

        if (!isFollowing || !isFollowedBack) {
            return res.status(403).json({
                message: "You can only message users you follow and who follow you back",
            });
        }

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            text,
        });

        res.status(201).json(message);

    } catch (err) {
        console.log(err); // 👈 VERY IMPORTANT FOR DEBUG
        res.status(500).json({ message: "Failed to send message" });
    }
};


const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id },
            ],
        })
            .sort({ createdAt: 1 })
            .populate("sender", "username profileImage")
            .populate("receiver", "username profileImage")

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};



const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // ❌ Only sender can edit
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        message.text = text;
        message.edited = true;

        await message.save();

        // 🔥 REAL-TIME UPDATE
        const io = req.app.get("io");

        io.to(message.receiver.toString()).emit("messageEdited", {
            messageId: message._id,
            text: message.text,
            edited: true,
        });

        io.to(message.sender.toString()).emit("messageEdited", {
            messageId: message._id,
            text: message.text,
            edited: true,
        });

        res.json(message);
    } catch (err) {
        res.status(500).json({ message: "Failed to edit message" });
    }
};


const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }

        // ✅ only sender can delete
        if (
            message.sender.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Not authorized",
            });
        }

        await message.deleteOne();

        // 🔥 realtime delete
        const io = req.app.get("io");

        io.to(message.receiver.toString()).emit(
            "messageDeleted",
            {
                messageId,
            }
        );

        io.to(message.sender.toString()).emit(
            "messageDeleted",
            {
                messageId,
            }
        );

        res.json({
            message: "Message deleted",
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Failed to delete message",
        });
    }
};


const markAsSeen = async (req, res) => {
    try {
        const { userId } = req.params;

        await Message.updateMany(
            {
                sender: userId,
                receiver: req.user._id,
                seen: false,
            },
            {
                seen: true,
                seenAt: new Date(),
            }
        );

        const io = req.app.get("io");

        // 🔥 notify sender
        io.to(userId).emit("messagesSeen", {
            by: req.user._id,
        });

        res.json({ message: "Messages marked as seen" });
    } catch (err) {
        res.status(500).json({ message: "Failed to mark as seen" });
    }
};



module.exports = { sendMessage, getMessages, editMessage, markAsSeen, deleteMessage };