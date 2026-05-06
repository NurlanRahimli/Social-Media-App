import { useState, useEffect } from "react";
import { Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/axios";
import { Images } from "lucide-react";
import postBg from "../../assets/post-bg.png.png";

import PostSkeleton from "../../components/skeletons/PostSkeleton";
import UserSkeleton from "../../components/skeletons/UserSkeleton";

function SearchPage() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const [activeTab, setActiveTab] = useState("posts");

    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const highlightText = (text, query) => {
        if (!text) return "";

        const regex = new RegExp(`(${query})`, "gi");

        return text.split(regex).map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={i} className="bg-yellow-200 text-black rounded">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };


    const trimDescription = (text, maxWords = 30) => {
        if (!text) return "";

        const words = text.split(" ");
        if (words.length <= maxWords) return text;

        return words.slice(0, maxWords).join(" ") + "...";
    };



    // debounce (wait 400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);



    // fetch results
    useEffect(() => {
        if (!debouncedQuery.trim()) return;

        let isCancelled = false;

        const fetchResults = async () => {
            try {
                setLoading(true);

                const [postsRes, usersRes] = await Promise.all([
                    api.get(`/posts/search?q=${debouncedQuery}`),
                    api.get(`/users/search?q=${debouncedQuery}`)
                ]);

                if (isCancelled) return;

                setPosts(postsRes.data);
                setUsers(usersRes.data);

            } catch (err) {
                console.error(err);
            } finally {
                if (!isCancelled) {
                    setTimeout(() => {
                        setLoading(false);
                    }, 300);
                }
            }
        };

        fetchResults();

        return () => {
            isCancelled = true;
        };
    }, [debouncedQuery]);


    const gradients = [
        "linear-gradient(135deg, #833ab4, #f00073, #fd1d1d)",
        "linear-gradient(135deg, #667eea, #764ba2)",
        "linear-gradient(135deg, #f093fb, #f5576c)",
        "linear-gradient(135deg, #4facfe, #00f2fe)",
        "linear-gradient(135deg, #43e97b, #38f9d7)",
        "linear-gradient(135deg, #fa709a, #fee140)"
    ];

    const getGradient = (id) => {
        let hash = 0;

        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }

        return gradients[Math.abs(hash) % gradients.length];
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-3xl mx-auto">

                {/* 🔍 Search Input */}
                <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 mb-6 dark:text-white dark:bg-app-dark">
                    <Search size={18} className="text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search posts or users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent px-2 text-sm outline-none"
                    />
                </div>

                {/* 📑 Tabs */}
                <div className="flex gap-6 border-b mb-6 dark:border-white">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`cursor-pointer pb-2 font-medium ${activeTab === "posts"
                            ? "text-insta-pink border-b-2 border-insta-pink"
                            : "text-slate-500"
                            }`}
                    >
                        Posts
                    </button>

                    <button
                        onClick={() => setActiveTab("users")}
                        className={`cursor-pointer pb-2 font-medium ${activeTab === "users"
                            ? "text-insta-purple border-b-2 border-insta-purple"
                            : "text-slate-500"
                            }`}
                    >
                        Users
                    </button>
                </div>

                {/* Loading */}
                {loading && activeTab === "posts" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <PostSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* 👤 USERS skeleton (ADD THIS HERE) */}
                {loading && activeTab === "users" && (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <UserSkeleton key={i} />
                        ))}
                    </div>
                )}


                {/* Empty state */}
                {!loading && debouncedQuery && activeTab === "posts" && posts.length === 0 && (
                    <p className="text-center text-slate-400">No posts found</p>
                )}

                {!loading && debouncedQuery && activeTab === "users" && users.length === 0 && (
                    <p className="text-center text-slate-400">No users found</p>
                )}

                {/* RESULTS */}

                {/* POSTS */}
                {!loading && debouncedQuery && activeTab === "posts" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {posts.map((post) => {
                            const hasImage = post.images && post.images.length > 0;

                            return (
                                <div
                                    key={post._id}
                                    onClick={() => navigate(`/post/${post._id}`)}
                                    className="relative cursor-pointer rounded-xl overflow-hidden group aspect-square hover:scale-[1.02] transition-transform duration-300"
                                >
                                    {hasImage ? (
                                        <>
                                            {/* 🖼 IMAGE */}
                                            <img
                                                src={post.images[0].url}
                                                className="w-full h-full object-cover group-hover:scale-105 transition"
                                            />

                                            {/* ❤️ OVERLAY */}
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition">
                                                <span className="text-white opacity-0 group-hover:opacity-100 transition">
                                                    ❤️ {post.likesCount}
                                                </span>
                                            </div>

                                            {/* 📷 MULTI IMAGE ICON */}
                                            {post.images.length > 1 && (
                                                <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-md">
                                                    <Images className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // 📝 TEXT CARD
                                        <div className="relative h-full rounded-xl overflow-hidden">

                                            {/* Background */}
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background: getGradient(post._id),
                                                }}
                                            />

                                            {/* Gradient overlay (VERY IMPORTANT) */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                            {/* Content */}
                                            <div className="relative z-10 flex flex-col justify-end h-full p-4">

                                                {/* TITLE */}
                                                <p className="text-sm text-white leading-snug line-clamp-4">
                                                    {highlightText(
                                                        trimDescription(post.content, 20),
                                                        debouncedQuery
                                                    )}
                                                </p>

                                                {/* ❤️ */}
                                                <div className="mt-2 text-xs text-gray-300">
                                                    ❤️ {post.likesCount}
                                                </div>

                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 👤 USERS */}
                {!loading && debouncedQuery && activeTab === "users" && (
                    <div className="space-y-3">
                        {users.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => navigate(`/profile/${user._id}`)}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer dark:text-white dark:hover:bg-[#282f3c]"
                            >

                                {user.profileImage?.url ? (
                                    <img
                                        src={user.profileImage?.url}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                )}

                                <span className="font-medium">{user.username}</span>
                            </div>
                        ))}
                    </div>
                )}

                {!debouncedQuery && (
                    <div className="flex flex-col items-center justify-center mt-16 text-center text-slate-400">

                        <Search size={40} className="mb-3 opacity-50" />

                        <p className="text-lg font-medium">
                            Search for posts or users
                        </p>

                        <p className="text-sm mt-1 text-slate-400">
                            Start typing to discover posts and people
                        </p>

                    </div>
                )}

            </div>
        </MainLayout>
    );
}

export default SearchPage;