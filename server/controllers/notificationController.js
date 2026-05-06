const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 5, 20);
        const skip = (page - 1) * limit;

        const total = await Notification.countDocuments({
            recipient: req.user._id,
        });

        const notifications = await Notification.find({
            recipient: req.user._id,
        })
            .populate("sender", "username profileImage")
            .populate("post", "title images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalNotifications: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getNotifications,
    markAllNotificationsAsRead,
    getUnreadCount,
};