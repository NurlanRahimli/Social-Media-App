import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import socket from "../../api/socket"; // 🔥 ADD THIS
import { Menu, Bell, MessageCircle, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ onMenuClick }) {
    const [user, setUser] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showMessages, setShowMessages] = useState(false);
    const [messageNotifications, setMessageNotifications] = useState([]);
    const [messageUnreadCount, setMessageUnreadCount] = useState(0);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const dropdownRef = useRef();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/auth/me");
                setUser(res.data.user);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUser();
    }, []);

    // JOIN SOCKET ROOM (runs once)
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        const userId = JSON.parse(atob(token.split(".")[1])).id;

        socket.emit("join", userId);
    }, []);

    // FETCH WITH PAGINATION
    const fetchNotifications = async (pageNumber = 1) => {
        try {
            setLoading(true);

            const res = await api.get(`/notifications?page=${pageNumber}&limit=5`);

            if (pageNumber === 1) {
                setNotifications(res.data.notifications);
            } else {
                setNotifications((prev) => [...prev, ...res.data.notifications]);
            }

            setHasMore(res.data.notifications.length === 5);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // REAL-TIME LISTENER
    useEffect(() => {
        socket.on("newNotification", () => {
            fetchNotifications(1); // refresh instantly
        });

        return () => socket.off("newNotification");
    }, []);


    useEffect(() => {

        const handleNewMessageNotification = (data) => {

            setMessageNotifications((prev) => {

                // prevent duplicates
                const exists = prev.some(
                    (n) =>
                        n.senderId === data.senderId &&
                        n.createdAt === data.createdAt
                );

                if (exists) return prev;

                return [data, ...prev];
            });

            setMessageUnreadCount((prev) => prev + 1);
        };

        socket.on(
            "newMessageNotification",
            handleNewMessageNotification
        );

        return () => {
            socket.off(
                "newMessageNotification",
                handleNewMessageNotification
            );
        };
    }, []);



    // OPEN DROPDOWN
    const handleBellClick = async () => {
        const next = !showNotifications;
        setShowMessages(false);
        setShowNotifications(next);

        if (next) {
            setPage(1);
            setNotifications([]);
            await fetchNotifications(1);

            await api.put("/notifications/read-all");
            setUnreadCount(0);
        }
    };

    // SCROLL LOAD MORE
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;

        // 🔥 allow small margin (10px)
        if (scrollHeight - scrollTop <= clientHeight + 10) {
            if (hasMore && !loading) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchNotifications(nextPage);
            }
        }
    };

    // CLOSE OUTSIDE
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
                setShowMessages(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // AUTO REFRESH (backup)
    useEffect(() => {
        const interval = setInterval(() => {
            if (showNotifications) {
                fetchNotifications(1);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [showNotifications]);

    // TIME FORMAT
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return "just now";
        if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
        if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
        return Math.floor(seconds / 86400) + "d ago";
    };

    // GROUPING (fixed)
    const groupedNotifications = Object.values(
        notifications.reduce((acc, n) => {
            const key = `${n.type}_${n.post?._id || ""}`;

            if (!acc[key]) {
                acc[key] = {
                    ...n,
                    users: [n.sender],
                };
            } else {
                const exists = acc[key].users.some(
                    (u) => u._id === n.sender._id
                );

                if (!exists) {
                    acc[key].users.push(n.sender);
                }
            }

            return acc;
        }, {})
    ).map((n) => ({
        ...n,
        count: n.users.length,
    }));


    const fetchUnreadCount = async () => {
        try {
            const res = await api.get("/notifications/unread-count");
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        const load = async () => {
            await fetchUnreadCount();
        };

        load();
    }, []);


    useEffect(() => {
        const handleNotification = () => {
            fetchUnreadCount();
        };

        socket.on("newNotification", handleNotification);

        return () => socket.off("newNotification", handleNotification);
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:bg-app-dark">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 xl:hidden dark:text-white dark:hover:bg-[#282f3c] cursor-pointer transitions duration-300"
                    >
                        <Menu size={24} />
                    </button>

                    <Link to="/home">
                        <h1 className="text-xl font-extrabold text-insta-gradient">
                            SocialApp
                        </h1>
                    </Link>
                </div>

                <div className="relative flex items-center gap-2 overflow-visible" ref={dropdownRef}>

                    {/* 🔔 BELL */}
                    <div className="relative">
                        <button
                            onClick={handleBellClick}
                            className="rounded-full p-2 text-slate-700 hover:bg-pink-50 hover:text-insta-pink dark:text-white cursor-pointer dark:hover:bg-[#282f3c] transition duration-300"
                        >
                            <Bell size={21} />

                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* 💬 MESSAGE */}
                    <div className="relative">

                        <button
                            onClick={() => {
                                setShowNotifications(false);
                                setShowMessages((prev) => !prev);

                                if (!showMessages) {
                                    setMessageUnreadCount(0);
                                }
                            }}
                            className="rounded-full p-2 text-slate-700 hover:bg-purple-50 hover:text-insta-purple dark:text-white cursor-pointer dark:hover:bg-[#282f3c] transition duration-300"
                        >
                            <MessageCircle size={21} />

                            {messageUnreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                                    {messageUnreadCount}
                                </span>
                            )}
                        </button>

                        {showMessages && (
                            <div className="absolute right-14 top-12 w-80 animate-fadeIn rounded-2xl bg-white shadow-lg border border-slate-200 p-3 z-50 dark:text-white dark:bg-app-dark">

                                <h3 className="font-semibold mb-3">
                                    Messages
                                </h3>

                                {messageNotifications.length === 0 ? (

                                    <p className="text-sm text-slate-500 text-center py-6">
                                        No messages yet
                                    </p>

                                ) : (

                                    <div className="space-y-2 max-h-64 overflow-y-auto">

                                        {messageNotifications.map((n, index) => (

                                            <div
                                                key={index}
                                                onClick={() => {
                                                    // remove viewed notifications
                                                    setMessageNotifications((prev) =>
                                                        prev.filter(
                                                            (m) => m.senderId !== n.senderId
                                                        )
                                                    );
                                                    setShowMessages(false);
                                                    navigate(`/chat/${n.senderId}`);
                                                }}
                                                className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-[#282f3c] transition"
                                            >

                                                {n.profileImage ? (
                                                    <img
                                                        src={n.profileImage}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                )}

                                                <div className="flex flex-col text-sm min-w-0">

                                                    <span className="truncate">
                                                        <span className="font-semibold">
                                                            @{n.username}
                                                        </span>{" "}
                                                        texted you
                                                    </span>

                                                    <span className="text-xs text-slate-400 truncate">
                                                        {n.text}
                                                    </span>

                                                </div>

                                            </div>
                                        ))}

                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* 👤 PROFILE */}
                    <Link to="/profile">
                        <button className="rounded-full bg-insta-gradient p-[2px] cursor-pointer hover:brightness-95">
                            <span className="flex rounded-full bg-white p-[2px]">
                                {user?.profileImage?.url ? (
                                    <img
                                        src={user.profileImage.url}
                                        alt="profile"
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center dark:bg-app-dark dark:border-[#282f3c]">
                                        <User className="w-5 h-5 text-slate-500 dark:text-white" />
                                    </div>
                                )}
                            </span>
                        </button>
                    </Link>

                    {/* 🔥 DROPDOWN (IMPORTANT — OUTSIDE BELL) */}
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 animate-fadeIn rounded-2xl bg-white shadow-lg border border-slate-200 p-3 z-50 dark:text-white dark:bg-app-dark">

                            <h3 className="font-semibold mb-2">Notifications</h3>

                            <div
                                onScroll={handleScroll}
                                className="max-h-64 overflow-y-auto"
                            >
                                {!loading && groupedNotifications.length === 0 ? (
                                    <p className="text-center text-sm text-slate-500 py-6 dark:text-slate-400">
                                        No notifications
                                    </p>
                                ) : (groupedNotifications.map((n) => (
                                    <div
                                        key={n._id}
                                        onClick={() => {
                                            setShowNotifications(false);

                                            if (n.type === "like") {
                                                navigate(`/post/${n.post._id}`);
                                            }

                                            if (n.type === "comment" || n.type === "reply") {
                                                navigate(
                                                    n.commentId
                                                        ? `/post/${n.post._id}?commentId=${n.commentId}`
                                                        : `/post/${n.post._id}`
                                                );
                                            }

                                            if (n.type === "follow") {
                                                navigate(`/profile/${n.sender._id}`);
                                            }
                                        }}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition
                        ${!n.isRead ? "bg-blue-50" : "hover:bg-slate-100 dark:hover:bg-[#282F3C]"}`}
                                    >
                                        <div className="flex -space-x-2">
                                            {n.users.slice(0, 3).map((u, i) => (
                                                u.profileImage?.url ? (
                                                    <img
                                                        key={i}
                                                        src={u?.profileImage?.url}
                                                        className="h-8 w-8 rounded-full border-2 border-white"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white">
                                                        <User className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                )
                                            ))}
                                        </div>

                                        <div className="text-sm flex flex-col">
                                            <span>
                                                <span className="font-medium">
                                                    {n.users[0]?.username}
                                                </span>{" "}
                                                {n.count > 1 && `and ${n.count - 1} others `}
                                                {n.type === "follow" && "started following you"}
                                                {n.type === "like" && "liked your post"}
                                                {n.type === "comment" && "commented on your post"}
                                                {n.type === "reply" && `replied: "${n.commentText}"`}
                                            </span>

                                            <span className="text-xs text-slate-400">
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                )))}

                                {loading && (
                                    <p style={{ textAlign: "center", padding: "10px" }}>
                                        Loading...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;