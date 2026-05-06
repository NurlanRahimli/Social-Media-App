const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    verifyEmail
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

router.get("/me", protect, (req, res) => {
    res.json({
        message: "Protected route worked",
        user: req.user,
    });
});

module.exports = router;