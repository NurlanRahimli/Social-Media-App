import { useState } from "react";
import api from "../../api/axios";
import socket from "../../api/socket";
import { useAuth } from "../../context/useAuth";

function ChatInput({ selectedUser, setMessages }) {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const { user } = useAuth();
    const [error, setError] = useState("");


    const handleSend = async () => {
        if (!text.trim() || sending) return;

        setSending(true);

        const receiverId = selectedUser?._id;

        if (!receiverId || !user?._id) {
            setSending(false);
            return;
        }

        try {
            setError("");
            const res = await api.post("/messages", {
                receiverId,
                text,
            });

            const message = res.data;

            setMessages((prev) => [...prev, message]);

            socket.emit("sendMessage", {
                senderId: user._id,
                receiverId,
                messageId: message._id,
                text,
                createdAt: message.createdAt,
            });

            setText("");
        } catch (err) {
            console.log("SEND ERROR:", err.response?.data || err.message);
            setError("Failed to send message");
        } finally {
            setSending(false);
        }
    };



    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };


    return (
        <>
            {error && (
                <div className="px-4 py-2 text-sm text-red-500 ">
                    {error}
                </div>
            )}
            <div className="p-3 border-t dark:border-gray-700 flex gap-2 dark:text-white">
                <input
                    value={text}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                        setText(e.target.value);

                        socket.emit("typing", {
                            senderId: user._id,
                            receiverId: selectedUser._id,
                        });

                        // stop typing after delay
                        clearTimeout(window.typingTimeout);
                        window.typingTimeout = setTimeout(() => {
                            socket.emit("stopTyping", {
                                senderId: user._id,
                                receiverId: selectedUser._id,
                            });
                        }, 1000);
                    }}
                    className="flex-1 p-3 rounded-xl border outline-none"
                    placeholder="Type a message..."
                />

                <button
                    onClick={handleSend}
                    disabled={sending || !text.trim()}
                    className="px-4 py-2 rounded-xl bg-insta-gradient text-white disabled:opacity-50 cursor-pointer"
                >
                    {sending ? "Sending..." : "Send"}
                </button>
            </div>
        </>
    );
}

export default ChatInput;