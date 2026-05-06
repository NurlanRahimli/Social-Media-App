const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: String,
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        bio: {
            type: String,
            default: "",
            trim: true,
        },

        profileImage: {
            url: String,
            publicId: String,
        },

        savedPosts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
        ],

        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);