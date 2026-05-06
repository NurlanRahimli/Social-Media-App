const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                text: {
                    type: String,
                    required: true,
                    trim: true,
                },
                parentComment: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: null,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        images: [
            {
                url: String,
                publicId: String,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);