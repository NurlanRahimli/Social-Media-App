import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import Button from "../ui/Button";
import { User } from "lucide-react";

function RightSidebar() {
    const [suggestions, setSuggestions] = useState([]);
    const [followingIds, setFollowingIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const currentUserId = JSON.parse(
        atob(localStorage.getItem("token").split(".")[1])
    ).id;

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await api.get("/users");
                const currentUserRes = await api.get("/auth/me");

                const currentUser = currentUserRes.data.user;

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

                setSuggestions(filtered.slice(0, 5));

            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchSuggestions();
    }, []);

    // 🔥 toggle follow/unfollow
    const handleFollowUser = async (userId) => {
        try {
            await api.put(`/users/${userId}/follow`);

            setFollowingIds((prev) => {
                const updated = new Set(prev);

                if (updated.has(userId)) {
                    updated.delete(userId); // unfollow
                } else {
                    updated.add(userId); // follow
                }

                return updated;
            });

        } catch (err) {
            console.error(err);
        }
    };

    const isFollowingUser = (userId) => {
        return followingIds.has(userId);
    };

    return (
        <aside className="space-y-4 ">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:bg-app-dark">
                <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                    Who to follow
                </h2>

                <div className="space-y-4">

                    {/* 🔄 LOADING */}
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 animate-pulse ">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-300" />
                                    <div className="h-3 w-20 bg-slate-300 rounded" />
                                </div>
                                <div className="h-6 w-16 bg-slate-300 rounded-full" />
                            </div>
                        ))
                    ) : suggestions.length === 0 ? (
                        /* ❗ EMPTY STATE */
                        <p className="text-sm text-slate-400 text-center dark:text-white">
                            No suggestions available
                        </p>
                    ) : (
                        /* ✅ USERS */
                        suggestions.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center justify-between gap-3"
                            >
                                <Link to={`/profile/${user._id}`} className="flex min-w-0 items-center gap-3">
                                    <div className="shrink-0 rounded-full bg-insta-gradient p-[2px] ">
                                        {user.profileImage?.url ? (
                                            <img
                                                src={
                                                    user.profileImage?.url
                                                }
                                                alt={user.username}
                                                className="h-10 w-10 rounded-full border-2 border-white object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:bg-app-dark dark:border-[#282f3c]">
                                                <User className="w-5 h-5 text-slate-500 dark:text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs text-slate-500 dark:text-white">
                                            {user.username}
                                        </p>
                                    </div>
                                </Link>



                                <button
                                    onClick={() => handleFollowUser(user._id)}
                                    className={`cursor-pointer text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 active:scale-95 ${isFollowingUser(user._id)
                                        ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                        : "bg-insta-gradient text-white shadow-md hover:opacity-90"
                                        }`}
                                >
                                    {isFollowingUser(user._id)
                                        ? "Following"
                                        : "Follow"}
                                </button>
                            </div>
                        ))
                    )}

                    {/* SEE MORE (only if not loading) */}
                    {!loading && suggestions.length > 0 && (
                        <button
                            onClick={() => navigate("/users")}
                            className="cursor-pointer mt-4 w-full text-sm font-medium text-insta-purple hover:underline"
                        >
                            See more
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}

export default RightSidebar;