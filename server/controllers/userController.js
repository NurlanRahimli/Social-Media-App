const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

const cloudinary = require("../utils/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const bcrypt = require("bcryptjs");


const followUnfollowUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        if (userToFollow._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const alreadyFollowing = currentUser.following.includes(userToFollow._id);

        if (alreadyFollowing) {
            // ❌ UNFOLLOW
            currentUser.following = currentUser.following.filter(
                (id) => id.toString() !== userToFollow._id.toString()
            );

            userToFollow.followers = userToFollow.followers.filter(
                (id) => id.toString() !== currentUser._id.toString()
            );

            await currentUser.save();
            await userToFollow.save();

            // 🔥 DELETE follow notification
            await Notification.deleteOne({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: "follow",
            });

        } else {
            // ✅ FOLLOW
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);

            await currentUser.save();
            await userToFollow.save();

            // 🔥 prevent duplicates
            const existingNotification = await Notification.findOne({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: "follow",
            });

            if (!existingNotification) {
                const notification = await Notification.create({
                    recipient: userToFollow._id,
                    sender: currentUser._id,
                    type: "follow",
                });

                // 🔥 REAL-TIME
                const io = req.app.get("io");
                io.to(userToFollow._id.toString()).emit("newNotification", notification);
            }
        }

        const updatedCurrentUser = await User.findById(currentUser._id)
            .populate("following", "username profileImage");

        const updatedUserToFollow = await User.findById(userToFollow._id)
            .populate("followers", "username profileImage");

        res.json({
            message: alreadyFollowing ? "User unfollowed" : "User followed",
            followingCount: updatedCurrentUser.following.length,
            followersCount: updatedUserToFollow.followers.length,
            following: updatedCurrentUser.following,
            followers: updatedUserToFollow.followers,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("followers", "username profileImage");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ users: user.followers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("following", "username profileImage");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ users: user.following });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const posts = await Post.find({ user: req.params.id })
            .populate("user", "username email")
            .populate("comments.user", "username")
            .sort({ createdAt: -1 });

        const postsWithCounts = posts.map((post) => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
        }));

        res.json({
            user: {
                ...user.toObject(),
                followersCount: user.followers.length,
                followingCount: user.following.length,
            },
            posts: postsWithCounts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        const usersWithCounts = users.map((user) => ({
            ...user.toObject(),
            followersCount: user.followers.length,
            followingCount: user.following.length,
        }));

        res.json(usersWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q;

        if (!keyword) {
            return res.status(400).json({ message: "Search keyword is required" });
        }

        const users = await User.find({
            username: { $regex: keyword, $options: "i" },
        }).select("-password");

        const usersWithCounts = users.map((user) => ({
            ...user.toObject(),
            followersCount: user.followers.length,
            followingCount: user.following.length,
        }));

        res.json(usersWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateProfile = async (req, res) => {
    try {
        const { username, bio, removeProfileImage } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // USERNAME
        if (username !== undefined) {
            const normalizedUsername = username.trim().toLowerCase();

            if (normalizedUsername !== user.username) {
                const exists = await User.findOne({ username: normalizedUsername });

                if (exists) {
                    return res.status(400).json({
                        message: "Username already taken",
                    });
                }
            }

            if (normalizedUsername.length < 3) {
                return res.status(400).json({
                    message: "Username must be at least 3 characters",
                });
            }

            user.username = normalizedUsername;
        }

        // BIO
        if (bio !== undefined) user.bio = bio;

        // IMAGE LOGIC
        if (req.file) {
            if (user.profileImage?.publicId) {
                await cloudinary.uploader.destroy(user.profileImage.publicId);
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                "profile-images"
            );

            user.profileImage = {
                url: result.secure_url,
                publicId: result.public_id,
            };

        } else if (removeProfileImage === "true" || removeProfileImage === true) {
            if (user.profileImage?.publicId) {
                await cloudinary.uploader.destroy(user.profileImage.publicId);
            }

            user.profileImage = undefined;
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both passwords are required" });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const saveUnsavePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const user = await User.findById(req.user._id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadySaved = user.savedPosts.includes(post._id);

        if (alreadySaved) {
            user.savedPosts = user.savedPosts.filter(
                (id) => id.toString() !== post._id.toString()
            );

            await user.save();

            return res.json({
                message: "Post removed from saved posts",
                savedPostsCount: user.savedPosts.length,
            });
        }

        user.savedPosts.push(post._id);

        await user.save();

        res.json({
            message: "Post saved",
            savedPostsCount: user.savedPosts.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const deleteMyAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get user (for profile image)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Delete profile image from Cloudinary
        if (user.profileImage && user.profileImage.publicId) {
            await cloudinary.uploader.destroy(user.profileImage.publicId);
        }

        // 3. Get all posts by user (to delete post images)
        const userPosts = await Post.find({ user: userId });

        // 4. Delete all post images from Cloudinary
        for (const post of userPosts) {
            if (post.images && post.images.length > 0) {
                for (const img of post.images) {
                    if (img.publicId) {
                        await cloudinary.uploader.destroy(img.publicId);
                    }
                }
            }
        }

        // 5. Delete all posts
        await Post.deleteMany({ user: userId });

        // 6. Remove user's comments and likes from ALL posts
        await Post.updateMany(
            {},
            {
                $pull: {
                    comments: { user: userId },
                    likes: userId,
                },
            }
        );

        // 7. Remove from followers / following
        await User.updateMany(
            {},
            {
                $pull: {
                    followers: userId,
                    following: userId,
                },
            }
        );

        // 8. Delete notifications
        await Notification.deleteMany({
            $or: [
                { recipient: userId },
                { sender: userId },
            ],
        });

        // 9. Delete user
        await User.findByIdAndDelete(userId);

        res.json({ message: "Account deleted completely" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


const checkUsername = async (req, res) => {
    const { username } = req.query;

    const normalized = username.trim().toLowerCase();

    const exists = await User.findOne({ username: normalized });

    res.json({ available: !exists });
};




module.exports = { followUnfollowUser, getUserProfile, getUsers, searchUsers, updateProfile, changePassword, saveUnsavePost, deleteMyAccount, checkUsername, getFollowers, getFollowing };