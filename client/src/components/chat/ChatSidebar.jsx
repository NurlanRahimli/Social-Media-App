import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";
import socket from "../../api/socket";
import { Home, MessageCircle, User } from "lucide-react";

function ChatSidebar({ activeChatId }) {
    const [users, setUsers] = useState([]);
    const [unread, setUnread] = useState({});
    const { user } = useAuth();
    const navigate = useNavigate();
    const [lastMessages, setLastMessages] = useState({});
    const [search, setSearch] = useState("");


    useEffect(() => {
        const handleReceive = (msg) => {

            // ✅ update sidebar preview instantly
            setLastMessages((prev) => ({
                ...prev,
                [msg.senderId]: {
                    _id: msg.messageId,
                    text: msg.text,
                    sender: msg.senderId,
                    createdAt: msg.createdAt,
                },
            }));

            // ✅ if already inside chat → don't show unread
            if (msg.senderId === activeChatId) return;

            // ✅ otherwise increase unread count
            setUnread((prev) => ({
                ...prev,
                [msg.senderId]: (prev[msg.senderId] || 0) + 1,
            }));
        };

        socket.on("receiveMessage", handleReceive);

        return () => socket.off("receiveMessage", handleReceive);
    }, [activeChatId]);



    useEffect(() => {
        if (!user) return; // 🛑 WAIT until user exists

        const fetchUsers = async () => {
            const res = await api.get("/users");

            const filtered = res.data.filter(
                (u) =>
                    user.following?.includes(u._id) &&
                    u.following?.includes(user._id)
            );

            setUsers(filtered);

            const previews = {};

            for (const u of filtered) {
                try {
                    const res = await api.get(`/messages/${u._id}`);

                    const last = res.data[res.data.length - 1];

                    if (last) {
                        previews[u._id] = last;
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            setLastMessages(previews);
        };

        fetchUsers();
    }, [user]);


    const filteredUsers = users.filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase())
    );



    return (
        <div className="h-full overflow-y-auto p-3 dark:text-white dark:bg-app-dark">
            <div className="mb-4 space-y-2">

                <div
                    onClick={() => navigate("/home")}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <Home size={20} />
                    <span>Home</span>
                </div>

                <div
                    onClick={() => navigate("/chat")}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer bg-gray-100 dark:bg-gray-800"
                >
                    <MessageCircle size={20} />
                    <span>Messages</span>
                </div>

            </div>


            <h2 className="text-lg font-semibold mb-4">Chats</h2>

            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="w-full mb-4 px-3 py-2 rounded-xl border dark:bg-[#1e293b] dark:border-gray-700 dark:text-white outline-none"
            />

            {filteredUsers.length === 0 ? (
                <div className="text-gray-500 text-sm mt-4 dark:text-white">
                    No chats yet
                </div>
            ) : (
                filteredUsers.map((u) => (
                    <div
                        key={u._id}
                        onClick={() => {
                            setUnread((prev) => ({ ...prev, [u._id]: 0 }));
                            navigate(`/chat/${u._id}`);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]
${activeChatId === u._id
                                ? "bg-gray-200 dark:bg-[#282f3c]"
                                : "hover:bg-gray-100 dark:hover:bg-[#25292E]"
                            }`}
                    >
                        {u.profileImage?.url ? (
                            <img
                                src={u.profileImage?.url}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <User size={20} className="text-gray-500" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">

                            <div className="flex items-center justify-between">
                                <span className="font-medium truncate">
                                    {u.username}
                                </span>

                                {lastMessages[u._id]?.createdAt && (
                                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                        {new Date(
                                            lastMessages[u._id].createdAt
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 truncate">
                                {lastMessages[u._id]?.sender === user._id ||
                                    lastMessages[u._id]?.sender?._id === user._id
                                    ? "You: "
                                    : ""}

                                {lastMessages[u._id]?.text || "Start chatting"}
                            </p>

                        </div>
                        {unread[u._id] > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {unread[u._id]}
                            </span>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default ChatSidebar;