import { useEffect, useState, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Share2, ArrowLeft, ChevronLeft, ChevronRight, User } from "lucide-react";
import CommentSection from "../../components/comments/CommentSection";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function PostDetails() {
    const { id } = useParams();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const commentId = queryParams.get("commentId");

    const [post, setPost] = useState(null);
    const [localLikes, setLocalLikes] = useState([]);
    const swiperRef = useRef(null);

    // ✅ FIRST define userId
    const userId = JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id;
    // ✅ THEN use it
    const isFollowing =
        post?.user?.followers?.some(
            (id) => id.toString() === userId
        ) || false;

    const [showLikes, setShowLikes] = useState(false);
    const [search, setSearch] = useState("");
    const [following, setFollowing] = useState([]);


    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                const fetchedPost = res.data.post || res.data;

                setPost(fetchedPost);
                setLocalLikes(fetchedPost.likes || []);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchMe = async () => {
            try {
                const res = await api.get("/auth/me");
                setFollowing(res.data.user.following || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMe();
        fetchPost();
    }, [id]);

    useEffect(() => {
        if (!commentId || !post) return;

        // small delay to ensure DOM is rendered
        setTimeout(() => {
            const el = document.getElementById(commentId);
            if (el) {
                el.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });

                // 🔥 optional highlight effect
                el.classList.add("bg-yellow-100");
                setTimeout(() => {
                    el.classList.remove("bg-yellow-100");
                }, 2000);
            }
        }, 300);
    }, [commentId, post]);


    const handleFollow = async () => {
        try {
            const res = await api.put(`/users/${post.user._id}/follow`);

            // 🔥 normalize followers to IDs ONLY
            const normalizedFollowers = res.data.followers.map((f) =>
                typeof f === "object" ? f._id : f
            );

            setPost((prev) => ({
                ...prev,
                user: {
                    ...prev.user,
                    followers: normalizedFollowers,
                },
            }));

        } catch (err) {
            console.error(err);
        }
    };


    const handleFollowUser = async (targetUserId) => {
        try {
            // 🔥 STEP 1: instant UI update (optimistic)
            setFollowing((prev) =>
                isFollowingUser(targetUserId)
                    ? prev.filter((id) => id !== targetUserId)
                    : [...prev, targetUserId]
            );

            // 🔥 STEP 2: backend request
            const res = await api.put(`/users/${targetUserId}/follow`);

            // 🔥 STEP 3: sync with backend (ensures correctness)
            setFollowing(
                res.data.following.map((u) =>
                    typeof u === "object" ? u._id : u
                )
            );

        } catch (err) {
            console.error(err);
        }
    };


    if (!post) return <p className="text-center mt-10">Loading...</p>;

    const liked = localLikes.some((u) => u._id === userId);


    const isFollowingUser = (id) => {
        return following.some((f) => f.toString() === id);
    };


    const handleLike = async () => {
        try {
            const res = await api.put(`/posts/${post._id}/like`);

            setLocalLikes(res.data.likes);

            setPost((prev) => ({
                ...prev,
                likes: res.data.likes,
            }));

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <main className="min-h-screen bg-app-light px-4 py-6 md:px-8 lg:px-12 dark:text-white dark:bg-app-dark">
            <div className="mx-auto max-w-6xl">

                <Link
                    to="/home"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-insta-pink dark:text-white transition duration-300"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

                    {/* LEFT */}
                    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

                        {/* IMAGE / SLIDER */}
                        {post.images?.length > 1 ? (
                            <div className="relative">
                                <Swiper
                                    modules={[Pagination]}
                                    pagination={{ clickable: true }}
                                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                                >
                                    {post.images.map((img) => (
                                        <SwiperSlide key={img._id}>
                                            <img
                                                src={img.url}
                                                className="h-[400px] w-full object-cover"
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                <button
                                    onClick={() => swiperRef.current?.slidePrev()}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full z-10 cursor-pointer"
                                >
                                    <ChevronLeft className="text-white" />
                                </button>

                                <button
                                    onClick={() => swiperRef.current?.slideNext()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full z-10 cursor-pointer"
                                >
                                    <ChevronRight className="text-white" />
                                </button>
                            </div>
                        ) : post.images?.length === 1 ? (
                            <img src={post.images[0].url} className="h-[400px] w-full object-cover" />
                        ) : post.image?.url ? (
                            <img src={post.image.url} className="h-[400px] w-full object-cover" />
                        ) : null}

                        <div className="p-5 dark:text-white dark:bg-app-dark">

                            {/* USER */}
                            <div className="mb-5 flex items-center gap-3">
                                {post.user?.profileImage?.url ? (
                                    <img
                                        src={post.user?.profileImage?.url}
                                        className="h-12 w-12 rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:bg-app-dark dark:border-[#282f3c]">
                                        <User className="w-5 h-5 text-slate-500 dark:text-white" />
                                    </div>
                                )}


                                <div>
                                    <h2 className="font-bold">{post.user?.username}</h2>
                                    <p className="text-sm text-slate-500 dark:text-white">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* CONTENT */}
                            <p className="mb-6">{post.content}</p>

                            {/* ACTIONS */}
                            <div className="flex gap-3 border-y py-4">

                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-[#282f3c]">
                                    {/* LIKE BUTTON */}
                                    <button
                                        onClick={handleLike}
                                        className={`flex cursor-pointer items-center justify-center ${liked ? "text-insta-pink" : "text-slate-600"
                                            }`}
                                    >
                                        <Heart
                                            size={18}
                                            className={`transition  ${liked ? "fill-insta-pink text-insta-pink" : "dark:text-white"
                                                }`}
                                        />
                                    </button>

                                    {/* COUNT (SEPARATE CLICK) */}
                                    <span
                                        onClick={() => setShowLikes(true)}
                                        className="cursor-pointer text-sm font-medium hover:underline"
                                    >
                                        {localLikes.length}
                                    </span>

                                </div>

                                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full dark:text-white dark:bg-[#282f3c]">
                                    <MessageCircle size={18} />
                                    {post.comments?.length}
                                </div>
                            </div>

                            <CommentSection
                                postId={post._id}
                                comments={post.comments}
                                setPost={setPost}
                            />
                        </div>
                    </section>

                    {/* RIGHT */}
                    <aside className="space-y-5">
                        <div className="bg-white p-5 rounded-2xl shadow-sm dark:bg-[#282f3c]">
                            {post.user?.profileImage?.url ? (
                                <img
                                    src={post.user?.profileImage?.url}
                                    className="h-12 w-12 rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:bg-app-dark dark:border-[#282f3c]">
                                    <User className="w-8 h-8 text-slate-500 dark:text-white" />
                                </div>
                            )}
                            <h3 className="mt-3 font-bold">{post.user?.username}</h3>
                            <p className="text-sm text-slate-500 dark:text-white">
                                {post.user?.followers?.length || 0} followers
                            </p>

                            {post.user._id !== userId && (
                                <button
                                    onClick={handleFollow}
                                    className={`mt-4 text-sm px-4 py-1.5 rounded-full rounded w-full cursor-pointer ${isFollowing
                                        ? "bg-slate-200 text-slate-700"
                                        : "bg-insta-gradient text-white"
                                        }`}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                            )}
                        </div>
                    </aside>

                </div>
            </div>
            {showLikes && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white w-[400px] rounded-2xl p-4 shadow-lg dark:text-white dark:bg-app-dark">

                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-bold">Likes</h2>
                            <button onClick={() => setShowLikes(false)} className="cursor-pointer">✕</button>
                        </div>

                        {/* SEARCH */}
                        <input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border p-2 rounded-lg mb-3 outline-none"
                        />

                        {/* USERS LIST */}
                        <div className="max-h-[300px] overflow-y-auto space-y-3">

                            {post.likes
                                ?.filter((u) =>
                                    u?.username?.toLowerCase()?.includes(search.toLowerCase())
                                )
                                .map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#282f3c] p-2 rounded-lg transition duration-300"
                                    >
                                        {/* LEFT */}
                                        <Link
                                            to={`/profile/${user._id}`}
                                            className="flex items-center gap-3"
                                        >

                                            {user?.profileImage?.url ? (
                                                <img
                                                    src={
                                                        user.profileImage?.url
                                                    }
                                                    className="h-8 w-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300 dark:bg-app-dark dark:border-white">
                                                    <User className="w-5 h-5 text-slate-500 dark:text-white" />
                                                </div>
                                            )}

                                            <span className="font-medium">
                                                {user._id === userId ? "You" : user.username}
                                            </span>
                                        </Link>

                                        {/* RIGHT BUTTON */}
                                        {user._id !== userId && (
                                            <button
                                                onClick={() => handleFollowUser(user._id)}
                                                className={`cursor-pointer text-sm px-4 py-1.5 rounded-full font-medium transition ${isFollowingUser(user._id)
                                                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300 bg-none"
                                                    : "bg-insta-gradient text-white hover:opacity-90"
                                                    }`}
                                            >
                                                {isFollowingUser(user._id) ? "Following" : "Follow"}
                                            </button>
                                        )}
                                    </div>
                                ))}

                            {post.likes?.length === 0 && (
                                <p className="text-center text-slate-500">
                                    No likes yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default PostDetails;