import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import socket from "../../api/socket";
import { useAuth } from "../../context/useAuth";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ChatWindow({ selectedUserId }) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const initialLoadDoneRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editText, setEditText] = useState("");

    const { user } = useAuth();

    const bottomRef = useRef(null);
    const containerRef = useRef(null);

    // ✅ check if user is near bottom
    const isNearBottom = () => {
        const el = containerRef.current;
        if (!el) return false;

        return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    };


    const handleEditMessage = (msg) => {
        setEditingMessage(msg._id);
        setEditText(msg.text);
    };



    const handleSaveEdit = async () => {
        try {
            const res = await api.put(
                `/messages/${editingMessage}`,
                {
                    text: editText,
                }
            );

            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === editingMessage
                        ? {
                            ...msg,
                            text: res.data.text,
                            edited: true,
                        }
                        : msg
                )
            );

            setEditingMessage(null);
            setEditText("");
        } catch (err) {
            console.log(err);
        }
    };




    // ✅ fetch user + messages
    useEffect(() => {
        if (!selectedUserId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const userRes = await api.get(`/users/${selectedUserId}`);
                const msgRes = await api.get(`/messages/${selectedUserId}`);

                setSelectedUser(userRes.data.user);
                setMessages(msgRes.data);

                await api.put(`/messages/seen/${selectedUserId}`);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedUserId]);

    // INITIAL SCROLL (ONLY ONCE)
    useEffect(() => {
        if (
            loading ||
            !messages.length ||
            initialLoadDoneRef.current
        ) return;

        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({
                behavior: "auto",
            });

            initialLoadDoneRef.current = true;
        });
    }, [messages, loading]);


    useEffect(() => {
        initialLoadDoneRef.current = false;
    }, [selectedUserId]);

    // ✅ SMART SCROLL (only if near bottom)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        if (isNearBottom()) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // ✅ socket listeners
    useEffect(() => {
        if (!user) return;

        socket.emit("join", user._id);

        const handleReceive = async (msg) => {
            if (msg.senderId === selectedUserId) {

                // ✅ detect if user is already near bottom
                const shouldAutoScroll = isNearBottom();

                setMessages((prev) => {

                    // ✅ prevent duplicates
                    const alreadyExists = prev.some(
                        (m) => m._id === msg.messageId
                    );

                    if (alreadyExists) return prev;

                    return [
                        ...prev,
                        {
                            _id: msg.messageId,
                            text: msg.text,
                            sender: msg.senderId,
                            createdAt: msg.createdAt,
                        },
                    ];
                });

                // ✅ if user scrolled up → show button
                if (!shouldAutoScroll) {
                    setShowScrollButton(true);
                }

                await api.put(`/messages/seen/${selectedUserId}`);
            }
        };

        const handleDelivered = ({ messageId }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, delivered: true }
                        : msg
                )
            );
        };

        const handleSeen = ({ by }) => {
            if (by === selectedUserId) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.sender === user._id ||
                            msg.sender?._id === user._id
                            ? { ...msg, seen: true }
                            : msg
                    )
                );
            }
        };

        const handleTyping = ({ senderId }) => {
            if (senderId === selectedUserId) setIsTyping(true);
        };

        const handleStopTyping = ({ senderId }) => {
            if (senderId === selectedUserId) setIsTyping(false);
        };


        const handleDeleted = ({ messageId }) => {
            setMessages((prev) =>
                prev.filter((msg) => msg._id !== messageId)
            );
        };


        const handleOnline = (users) => setOnlineUsers(users);

        socket.on("receiveMessage", handleReceive);
        socket.on("messageDelivered", handleDelivered);
        socket.on("messagesSeen", handleSeen);
        socket.on("typing", handleTyping);
        socket.on("stopTyping", handleStopTyping);
        socket.on("onlineUsers", handleOnline);
        socket.on("messageDeleted", handleDeleted);

        return () => {
            socket.off("receiveMessage", handleReceive);
            socket.off("messageDelivered", handleDelivered);
            socket.off("messagesSeen", handleSeen);
            socket.off("typing", handleTyping);
            socket.off("stopTyping", handleStopTyping);
            socket.off("onlineUsers", handleOnline);
            socket.off("messageDeleted", handleDeleted);
        };
    }, [selectedUserId, user]);


    if (loading) {
        return (
            <div className="flex flex-col w-full h-full animate-fadeIn">

                {/* header skeleton */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>

                    <div className="space-y-2">
                        <div className="w-32 h-4 rounded bg-gray-300 dark:bg-gray-700"></div>
                        <div className="w-20 h-3 rounded bg-gray-200 dark:bg-gray-600"></div>
                    </div>
                </div>

                {/* messages */}
                <div className="flex-1 p-4 space-y-4">
                    <div className="w-40 h-10 rounded-2xl bg-gray-300 dark:bg-gray-700"></div>

                    <div className="w-52 h-10 rounded-2xl ml-auto bg-gray-300 dark:bg-gray-700"></div>

                    <div className="w-32 h-10 rounded-2xl bg-gray-300 dark:bg-gray-700"></div>
                </div>
            </div>
        );
    }



    if (!selectedUser) {
        return <div className="flex items-center justify-center w-full">Select a chat</div>;
    }


    const handleDeleteMessage = async (messageId) => {

        const result = await Swal.fire({
            title: "Unsend message?",
            text: "This message will disappear for everyone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Unsend",
            cancelButtonText: "Cancel",
            background: "#1e293b",
            color: "#fff",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/messages/${messageId}`);

            setMessages((prev) =>
                prev.filter((msg) => msg._id !== messageId)
            );

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Message unsent",
                showConfirmButton: false,
                timer: 2000,
                background: "#1e293b",
                color: "#fff",
            });

        } catch (err) {
            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Could not unsend message",
                background: "#1e293b",
                color: "#fff",
            });
        }
    };

    return (
        <div className="flex flex-col w-full h-full">

            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex gap-3 items-center">
                <button
                    onClick={() => navigate("/chat")}
                    className="cursor-pointer dark:text-white"
                >
                    <ArrowLeft />
                </button>
                {selectedUser.profileImage?.url ? (
                    <img
                        src={selectedUser.profileImage.url}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="font-semibold dark:text-white">{selectedUser.username}</span>
                    <span className="text-xs text-gray-500">
                        {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-800"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        No messages yet
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg._id || msg.messageId}>

                            {editingMessage === msg._id ? (

                                <div className="flex gap-2 items-center">

                                    <input
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-xl border dark:bg-[#1e293b] dark:border-gray-700 dark:text-white"
                                    />

                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-3 py-2 rounded-xl bg-[#7393B3] text-white cursor-pointer"
                                    >
                                        Save
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditingMessage(null);
                                            setEditText("");
                                        }}
                                        className="px-3 py-2 rounded-xl bg-[#D32F2F] text-white cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                </div>

                            ) : (

                                <MessageBubble
                                    msg={msg}
                                    onDelete={handleDeleteMessage}
                                    onEdit={handleEditMessage}
                                />

                            )}

                        </div>
                    ))
                )}

                <div ref={bottomRef} />
                {showScrollButton && (
                    <button
                        onClick={() => {
                            bottomRef.current?.scrollIntoView({
                                behavior: "smooth",
                            });

                            setShowScrollButton(false);
                        }}
                        className="fixed bottom-24 right-6 bg-insta-gradient text-white px-4 py-2 rounded-full shadow-lg text-sm cursor-pointer"
                    >
                        ↓ New messages
                    </button>
                )}
            </div>

            {isTyping && (
                <div className="px-4 pb-2 text-sm text-gray-500 dark:text-white">
                    {selectedUser.username} is typing...
                </div>
            )}

            {/* Input */}
            <ChatInput selectedUser={selectedUser} setMessages={setMessages} />
        </div>
    );
}

export default ChatWindow;