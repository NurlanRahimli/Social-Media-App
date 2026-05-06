const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { verificationEmailTemplate } = require("../utils/emailTemplates");
const { resetPasswordTemplate } = require("../utils/emailTemplates");


const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};


const registerUser = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        // 🔥 NORMALIZE INPUTS
        username = username?.trim().toLowerCase();
        email = email?.trim().toLowerCase();

        // 🔥 VALIDATION
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        if (username.length < 3) {
            return res.status(400).json({
                message: "Username must be at least 3 characters long",
            });
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
            return res.status(400).json({
                message:
                    "Username can only contain lowercase letters, numbers, and underscores",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address",
            });
        }

        // 🔥 CHECK IF EXISTS
        const userExists = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // 🔐 HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔥 CREATE USER (NOT VERIFIED YET)
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
        });

        // 🔥 GENERATE VERIFICATION TOKEN
        const verifyToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(verifyToken)
            .digest("hex");

        user.verificationToken = hashedToken;
        await user.save();

        // 🔗 CREATE VERIFY LINK
        const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

        // 🔥 SEND EMAIL
        await sendEmail(
            user.email,
            "Verify your email",
            verificationEmailTemplate(user.username, verifyUrl)
        );



        // 🔥 RESPONSE (NO TOKEN YET)
        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account.",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};


const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        let user = await User.findOne({
            verificationToken: hashedToken,
        });

        // 🔥 If token not found
        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired link",
            });
        }

        // 🔥 If already verified
        if (user.isVerified) {
            return res.json({
                message: "Email already verified",
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;

        await user.save();

        res.json({
            message: "Email verified successfully",
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        // 🔥 normalize email (important)
        email = email?.trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // 🔥 NEW: check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }


        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "If an account with that email exists, a reset link has been sent." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendEmail(
            user.email,
            "Reset your password",
            resetPasswordTemplate(user.username, resetUrl)
        );

        res.json({
            message: "Password reset email sent",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token",
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};



module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    verifyEmail
};