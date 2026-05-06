import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";
import { Search, User } from "lucide-react";

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [followingIds, setFollowingIds] = useState(new Set());

    const navigate = useNavigate();

    const currentUserId = JSON.parse(
        atob(localStorage.getItem("token").split(".")[1])
    ).id;

    // 🔥 fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get("/users");
                const meRes = await api.get("/auth/me");

                const currentUser = meRes.data.user;

                setFollowingIds(
                    new Set(
                        currentUser.following?.map((f) =>
                            (f._id || f).toString()
                        )
                    )
                );

                const filtered = res.data.filter(
                    (u) =>
                        u._id !== currentUserId &&
                        !currentUser.following?.some(
                            (f) => (f._id || f).toString() === u._id
                        )
                );

                setUsers(filtered);
            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchUsers();
    }, []);

    // 🔍 search filter (derived state)
    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(query.toLowerCase())
    );

    // check if following
    const isFollowingUser = (userId) => {
        return followingIds.has(userId);
    };

    // follow / unfollow
    const handleFollowUser = async (userId) => {
        try {
            await api.put(`/users/${userId}/follow`);

            setFollowingIds((prev) => {
                const updated = new Set(prev);

                if (updated.has(userId)) {
                    updated.delete(userId); // 🔥 unfollow
                } else {
                    updated.add(userId); // 🔥 follow
                }

                return updated;
            });

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-2xl mx-auto dark:text-white dark:bg-app-dark">

                {/* 🔍 SEARCH */}
                <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 mb-6 dark:text-white dark:bg-app-dark">
                    <Search size={18} className="text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent px-2 text-sm outline-none"
                    />
                </div>

                {/* 🔄 LOADING */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-10 h-10 bg-slate-300 rounded-full dark:text-white dark:bg-app-dark" />
                                <div className="h-4 w-32 bg-slate-300 rounded dark:text-white dark:bg-app-dark" />
                            </div>
                        ))}
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <p className="text-center text-slate-400">No users found</p>
                ) : (
                    <div className="space-y-3">
                        {filteredUsers.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => navigate(`/profile/${user._id}`)}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 cursor-pointer transition dark:hover:bg-[#282f3c]"
                            >
                                <div className="flex items-center gap-3">

                                    {user.profileImage?.url ? (
                                        <img
                                            src={
                                                user.profileImage?.url
                                            }
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white">
                                            <User className="w-5 h-5 text-slate-500" />
                                        </div>
                                    )}
                                    <span className="font-medium">
                                        {user.username}
                                    </span>
                                </div>

                                {/* 🔥 FOLLOW BUTTON */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFollowUser(user._id);
                                    }}
                                    className={`cursor-pointer text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 active:scale-95 ${isFollowingUser(user._id)
                                        ? "bg-slate-200 text-slate-700"
                                        : "bg-insta-gradient text-white shadow-md hover:opacity-90"
                                        }`}
                                >
                                    {isFollowingUser(user._id) ? "Following" : "Follow"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default UsersPage;