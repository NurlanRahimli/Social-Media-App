// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        delivered: {
            type: Boolean,
            default: false,
        },
        seen: {
            type: Boolean,
            default: false,
        },
        seenAt: {
            type: Date,
        },
        edited: {
            type: Boolean,
            default: false, // 👈 NEW
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);