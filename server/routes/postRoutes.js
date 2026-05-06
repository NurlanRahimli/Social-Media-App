const express = require("express");
const router = express.Router();

const {
    createPost,
    getPosts,
    deletePost,
    updatePost,
    addComment,
    deleteComment,
    getPostById,
    searchPosts,
    getFollowingPosts,
    toggleLikePost,
    getPostsByUser,
    getLikedPosts
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/", protect, upload.array("images", 5), createPost);
router.get("/", getPosts);
router.get("/search", searchPosts);
router.put("/:id/like", protect, toggleLikePost);
router.get("/liked", protect, getLikedPosts);
router.get("/feed/following", protect, getFollowingPosts);
router.get("/user/:id", getPostsByUser);
router.get("/:id", getPostById);
router.put("/:id", protect, upload.array("images", 5), updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/comment", protect, addComment);
router.delete("/:postId/comment/:commentId", protect, deleteComment);



module.exports = router;