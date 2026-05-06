const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const { followUnfollowUser } = require("../controllers/userController");
const { getUserProfile } = require("../controllers/userController");
const { getUsers } = require("../controllers/userController");
const { searchUsers } = require("../controllers/userController");
const { updateProfile } = require("../controllers/userController");
const { changePassword } = require("../controllers/userController");
const { saveUnsavePost } = require("../controllers/userController");
const { deleteMyAccount } = require("../controllers/userController");
const { checkUsername } = require("../controllers/userController");
const { getFollowers } = require("../controllers/userController");
const { getFollowing } = require("../controllers/userController");



router.get("/", protect, getUsers);
router.get("/search", protect, searchUsers);
router.get("/check-username", protect, checkUsername);

router.get("/:id/followers", protect, getFollowers);
router.get("/:id/following", protect, getFollowing);
router.put("/:id/follow", protect, followUnfollowUser);
router.put("/profile", protect, upload.single("profileImage"), updateProfile);
router.put("/profile/change-password", protect, changePassword);
router.put("/save-post/:postId", protect, saveUnsavePost);
router.delete("/me", protect, deleteMyAccount);

// 🔥 ALWAYS LAST
router.get("/:id", protect, getUserProfile);


module.exports = router;