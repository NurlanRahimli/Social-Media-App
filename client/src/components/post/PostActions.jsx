import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function PostActions({ liked, likesCount, onLike, likes }) {

    const [showLikes, setShowLikes] = useState(false);
    const [search, setSearch] = useState("");
    const [following, setFollowing] = useState([]);

    const userId = JSON.parse(
        atob(localStorage.getItem("token").split(".")[1])
    ).id;

    // 🔥 fetch current user following
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await api.get("/auth/me");
                setFollowing(res.data.user.following || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMe();
    }, []);

    const isFollowingUser = (id) => {
        return following.some((f) => f.toString() === id);
    };

    const handleFollowUser = async (targetUserId) => {
        try {
            // 🔥 instant UI
            setFollowing((prev) =>
                isFollowingUser(targetUserId)
                    ? prev.filter((id) => id !== targetUserId)
                    : [...prev, targetUserId]
            );

            const res = await api.put(`/users/${targetUserId}/follow`);

            setFollowing(
                res.data.following.map((u) =>
                    typeof u === "object" ? u._id : u
                )
            );

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">

                {/* LIKE */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onLike}
                        className={`flex items-center gap-2 rounded-full px-3 py-2 transition cursor-pointer
                        ${liked
                                ? "text-insta-pink bg-pink-50 dark:bg-[#282f3c]"
                                : "text-slate-600 hover:bg-pink-50 hover:text-insta-pink dark:hover:bg-[#282f3c]"
                            }`}
                    >
                        <Heart
                            size={20}
                            className={`transition-transform duration-200  ${liked
                                ? "fill-insta-pink text-insta-pink scale-110 "
                                : "dark:text-white"
                                }`}
                        />
                    </button>

                    {/* 🔢 COUNT (SEPARATE CLICK) */}
                    <span
                        onClick={() => setShowLikes(true)}
                        className="cursor-pointer text-sm font-medium hover:underline"
                    >
                        {likesCount} Likes
                    </span>
                </div>

                {/* COMMENT */}
                <button className="flex items-center gap-2 rounded-full px-3 py-2 text-slate-600 transition hover:bg-purple-50 hover:text-insta-purple dark:text-white dark:bg-app-dark">
                    <MessageCircle size={20} />
                    <span className="text-sm font-medium">Comment</span>
                </button>
            </div>

            {/* 🔥 MODAL */}
            {showLikes && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white w-[400px] rounded-2xl p-4 shadow-lg dark:text-white dark:bg-app-dark">

                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-bold">Likes</h2>
                            <button className="cursor-pointer" onClick={() => setShowLikes(false)}>✕</button>
                        </div>

                        <input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border p-2 rounded-lg mb-3"
                        />

                        <div className="max-h-[300px] overflow-y-auto space-y-3">

                            {likes
                                ?.filter((u) =>
                                    u?.username
                                        ?.toLowerCase()
                                        ?.includes(search.toLowerCase())
                                )
                                .map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between hover:bg-slate-100 hover:dark:bg-[#282f3c] p-2 rounded-lg"
                                    >
                                        <Link
                                            to={`/profile/${user._id}`}
                                            className="flex items-center gap-3"
                                        >

                                            {user.profileImage?.url ? (
                                                <img
                                                    src={
                                                        user.profileImage?.url
                                                    }
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white">
                                                    <User className="w-5 h-5 text-slate-500" />
                                                </div>
                                            )}

                                            <span className="font-medium">
                                                {user._id === userId
                                                    ? "You"
                                                    : user.username}
                                            </span>
                                        </Link>

                                        {user._id !== userId && (
                                            <button
                                                onClick={() =>
                                                    handleFollowUser(user._id)
                                                }
                                                className={`cursor-pointer text-sm px-3 py-1 rounded-full ${isFollowingUser(user._id)
                                                    ? "bg-slate-200 text-slate-700"
                                                    : "bg-insta-gradient text-white"
                                                    }`}
                                            >
                                                {isFollowingUser(user._id)
                                                    ? "Following"
                                                    : "Follow"}
                                            </button>
                                        )}
                                    </div>
                                ))}

                            {likes?.length === 0 && (
                                <p className="text-center text-slate-500 dark:text-white dark:bg-app-dark">
                                    No likes yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PostActions;