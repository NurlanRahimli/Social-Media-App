const Post = require("../models/Post");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const cloudinary = require("../utils/cloudinary");

const Notification = require("../models/Notification");


const createPost = async (req, res) => {
    try {
        const { title, description, content } = req.body || {};

        if (!content) {
            return res.status(400).json({ message: "Post content is required" });
        }

        const images = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer, "social-posts");

                images.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        }

        const post = await Post.create({
            user: req.user._id,
            title,
            description,
            content,
            images,
        });

        const populatedPost = await post.populate("user", "username profileImage");

        res.status(201).json({
            message: "Post created successfully",
            post,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};


const getPosts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalPosts = await Post.countDocuments();

        const posts = await Post.find()
            .populate("user", "username email profileImage")
            .populate("likes", "username profileImage")
            .populate("comments.user", "username profileImage")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        posts.forEach((post) => {
            post.comments.sort((a, b) => b.createdAt - a.createdAt);
        });

        const postsWithCounts = posts.map((post) => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
        }));

        res.json({
            posts: postsWithCounts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasNextPage: page < Math.ceil(totalPosts / limit),
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPostsByUser = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const userId = req.params.id;

        const totalPosts = await Post.countDocuments({ user: userId });

        const posts = await Post.find({ user: userId })
            .populate("user", "username email profileImage")
            .populate("likes", "username profileImage")
            .populate("comments.user", "username profileImage")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        posts.forEach((post) => {
            post.comments.sort((a, b) => b.createdAt - a.createdAt);
        });

        const postsWithCounts = posts.map((post) => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
        }));

        res.json({
            posts: postsWithCounts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasNextPage: page < Math.ceil(totalPosts / limit),
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "username email profileImage followers")
            .populate("likes", "username profileImage")
            .populate("comments.user", "username profileImage");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.comments.sort((a, b) => b.createdAt - a.createdAt);

        res.json({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if current user is owner
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Delete all images from Cloudinary
        if (post.images && post.images.length > 0) {
            for (const img of post.images) {
                if (img.publicId) {
                    await cloudinary.uploader.destroy(img.publicId);
                }
            }
        }

        await post.deleteOne();

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};


// Update post - only owner
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // ✅ Check ownership
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // ✅ Update content
        if (req.body.content !== undefined) post.content = req.body.content;

        // =========================================
        // 🔥 STEP 1: Parse kept images FIRST
        // =========================================
        let keptImages = [];

        try {
            if (req.body.existingImages) {
                keptImages = JSON.parse(req.body.existingImages);
            }
        } catch (err) {
            return res.status(400).json({
                message: "Invalid existingImages format",
            });
        }

        if (!Array.isArray(keptImages)) {
            keptImages = [];
        }

        // =========================================
        // 🔥 STEP 2: VALIDATION (based on kept images)
        // =========================================
        const MAX_IMAGES = 5;
        const remainingImagesCount = keptImages.length;
        const newImagesCount = req.files ? req.files.length : 0;

        if (remainingImagesCount + newImagesCount > MAX_IMAGES) {
            return res.status(400).json({
                message: `You can only have up to ${MAX_IMAGES} images`,
            });
        }

        // =========================================
        // 🔥 STEP 3: FIND images to delete
        // =========================================
        const imagesToDelete = post.images.filter(
            (img) => !keptImages.includes(img.publicId)
        );

        // =========================================
        // 🔥 STEP 4: DELETE from Cloudinary
        // =========================================
        for (const img of imagesToDelete) {
            await cloudinary.uploader.destroy(img.publicId);
        }

        // =========================================
        // 🔥 STEP 5: KEEP only selected images
        // =========================================
        post.images = post.images.filter((img) =>
            keptImages.includes(img.publicId)
        );

        // =========================================
        // 🔥 STEP 6: ADD new images
        // =========================================
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer, "social-posts");

                post.images.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        }

        // =========================================
        // 🔥 STEP 7: SAVE
        // =========================================
        const updatedPost = await post.save();

        res.json({
            message: "Post updated successfully",
            post: updatedPost,
        });

    } catch (error) {
        console.error("UPDATE POST ERROR:", error);

        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};


const addComment = async (req, res) => {
    try {
        const { text, parentComment } = req.body;

        const trimmedText = text?.trim();

        if (!trimmedText) {
            return res.status(400).json({
                message: "Comment cannot be empty",
            });
        }

        if (trimmedText.length > 300) {
            return res.status(400).json({
                message: "Comment cannot exceed 300 characters",
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        // ✅ Check parent comment exists (for replies)
        if (parentComment) {
            const exists = post.comments.id(parentComment);
            if (!exists) {
                return res.status(400).json({
                    message: "Parent comment not found",
                });
            }
        }

        // ✅ Create comment
        const comment = {
            user: req.user._id,
            text: trimmedText,
            parentComment: parentComment || null,
        };

        post.comments.push(comment);
        await post.save();

        // 🔥 Get saved comment (IMPORTANT)
        const savedComment = post.comments[post.comments.length - 1];

        // 🔥 Populate users
        await post.populate({
            path: "comments.user",
            select: "username profileImage",
        });

        // 🔔 Notification logic
        let notificationRecipient = null;
        let type = parentComment ? "reply" : "comment";

        if (parentComment) {
            const parent = post.comments.find(
                (c) => c._id.toString() === parentComment.toString()
            );

            if (
                parent &&
                parent.user._id.toString() !== req.user._id.toString()
            ) {
                notificationRecipient = parent.user._id;
            }
        } else {
            if (post.user.toString() !== req.user._id.toString()) {
                notificationRecipient = post.user;
            }
        }

        // 🔥 CREATE NOTIFICATION (with duplicate protection)
        if (notificationRecipient) {

            const existingNotification = await Notification.findOne({
                recipient: notificationRecipient,
                sender: req.user._id,
                type,
                post: post._id,
                commentId: savedComment._id,
            });

            if (!existingNotification) {
                const notification = await Notification.create({
                    recipient: notificationRecipient,
                    sender: req.user._id,
                    type,
                    post: post._id,
                    commentText: trimmedText,
                    commentId: savedComment._id, // 🔥 REQUIRED FOR FRONTEND
                });

                const io = req.app.get("io");
                if (io) {
                    io.to(notificationRecipient.toString()).emit(
                        "newNotification",
                        notification
                    );
                }
            }
        }

        return res.status(200).json({
            message: "Comment added",
            comments: post.comments,
        });

    } catch (error) {
        console.error(error); // 🔥 ADD THIS FOR DEBUGGING
        return res.status(500).json({
            message: error.message,
        });
    }
};


const deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        comment.deleteOne();

        await post.save();

        res.json({
            message: "Comment deleted successfully",
            comments: post.comments,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const searchPosts = async (req, res) => {
    try {
        const keyword = req.query.q;

        if (!keyword) {
            return res.status(400).json({ message: "Search keyword is required" });
        }

        const posts = await Post.find({
            content: { $regex: keyword, $options: "i" },
        })
            .populate("user", "username email")
            .populate("comments.user", "username")
            .sort({ createdAt: -1 });

        const postsWithCounts = posts.map((post) => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
        }));

        res.json(postsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getFollowingPosts = async (req, res) => {
    try {
        const posts = await Post.find({
            user: { $in: req.user.following },
        })
            .populate("user", "username email")
            .populate("comments.user", "username")
            .sort({ createdAt: -1 });

        const postsWithCounts = posts.map((post) => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
        }));

        res.json(postsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const toggleLikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userId = req.user._id.toString();

        const alreadyLiked = post.likes.some(
            (id) => id.toString() === userId
        );

        if (alreadyLiked) {
            // ❌ UNLIKE
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId
            );

            await post.save(); // save immediately

            // 🔥 delete notification
            await Notification.findOneAndDelete({
                recipient: post.user,
                sender: req.user._id,
                type: "like",
                post: post._id,
            });

        } else {
            // ✅ LIKE
            post.likes.push(req.user._id);

            await post.save(); // save immediately

            // 🔥 avoid self-like notification
            if (post.user.toString() !== userId) {

                // 🔥 prevent duplicates
                const existingNotification = await Notification.findOne({
                    recipient: post.user,
                    sender: req.user._id,
                    type: "like",
                    post: post._id,
                });

                if (!existingNotification) {
                    const notification = await Notification.create({
                        recipient: post.user,
                        sender: req.user._id,
                        type: "like",
                        post: post._id,
                    });

                    // 🔥 REAL-TIME
                    const io = req.app.get("io");
                    if (io) {
                        io.to(post.user.toString()).emit("newNotification", notification);
                    }
                }
            }
        }

        // 🔥 re-fetch updated post (cleaner)
        const updatedPost = await Post.findById(post._id)
            .populate("likes", "username profileImage");

        res.json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likesCount: updatedPost.likes.length,
            likes: updatedPost.likes,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });
    }
};


const getLikedPosts = async (req, res) => {
    try {
        const posts = await Post.find({
            likes: req.user._id
        })
            .populate("user", "username profileImage")
            .populate("likes", "username profileImage")
            .sort({ createdAt: -1 });

        const postsWithCounts = posts.map((post) => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
        }));

        res.json(postsWithCounts);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
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
    getLikedPosts,
};