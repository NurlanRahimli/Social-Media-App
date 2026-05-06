import { useState, useRef, useEffect } from "react";
import PostActions from "./PostActions";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";


import { ChevronLeft, ChevronRight, MoreHorizontal, User } from "lucide-react";

import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import toast from "react-hot-toast";


function PostCard({ post }) {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef();
    const swiperRef = useRef(null);

    const userId = JSON.parse(atob(localStorage.getItem("token").split('.')[1])).id;
    const isOwner = post.user._id === userId;

    const [localLikes, setLocalLikes] = useState(post.likes || []);

    const liked = localLikes.some((u) => u._id === userId);

    const handleLike = async () => {
        try {
            const res = await api.put(`/posts/${post._id}/like`);

            setLocalLikes(res.data.likes);

        } catch (err) {
            console.error(err);
        }
    };



    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);



    const handleDelete = async (postId) => {
        const result = await Swal.fire({
            title: "Delete post?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it",
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/posts/${postId}`);

            // ✅ Toast success
            toast.success("Post deleted");

            // ❗ quick version
            setTimeout(() => {
                window.location.reload();
            }, 800);

        } catch (err) {
            console.error(err);
            toast.error("Failed to delete post");
        }
    };

    return (
        <article className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:text-white dark:bg-app-dark">

            {/* HEADER */}
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">

                    {/* Avatar */}
                    <div className="shrink-0 rounded-full bg-insta-gradient p-[2px]">

                        {post.user.profileImage?.url ? (
                            <img
                                src={
                                    post.user?.profileImage?.url
                                }
                                alt={post.user?.username}
                                className="h-11 w-11 rounded-full border-2 border-white object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:bg-app-dark dark:border-[#282f3c]">
                                <User className="w-5 h-5 text-slate-500 dark:text-white" />
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div>
                        <Link to={`/profile/${post.user._id}`}>
                            <h3 className="font-semibold text-slate-900 dark:text-white ">
                                {post.user?.username || "Unknown"}
                            </h3>


                            <p className="text-xs text-slate-500 dark:text-white">
                                @{post.user?.username || "user"} ·{" "}
                                {post.createdAt
                                    ? new Date(post.createdAt).toLocaleString()
                                    : "now"}
                            </p>
                        </Link>
                    </div>
                </div>

                {/* MENU */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(!openMenu);
                        }}
                        className="rounded-full p-2 text-slate-500 hover:bg-pink-50 hover:text-insta-pink dark:text-white outline-none cursor-pointer transition duration-300"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {openMenu && (
                        <div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-slate-100 bg-white shadow-md overflow-hidden dark:text-white dark:bg-app-dark">

                            {/* GO TO DETAILS */}
                            <button
                                onClick={() => navigate(`/post/${post._id}`)}
                                className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100 cursor-pointer hover:dark:text-white hover:dark:bg-[#282f3c] transition duration-300"
                            >
                                Go to Details
                            </button>

                            {/* EDIT (ONLY OWNER) */}
                            {isOwner && (
                                <button
                                    onClick={() => navigate(`/edit-post/${post._id}`)}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100 cursor-pointer hover:dark:text-white hover:dark:bg-[#282f3c] transition duration-300"
                                >
                                    Edit Post
                                </button>
                            )}

                            {/* DELETE (ONLY OWNER) */}
                            {isOwner && (
                                <button
                                    onClick={() => handleDelete(post._id)}
                                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 cursor-pointer font-semibold hover:dark:bg-[#282f3c] transition duration-300"
                                >
                                    Delete Post
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <p className="mb-4 text-sm leading-relaxed text-slate-800 sm:text-base dark:text-white dark:bg-app-dark">
                {post.content}
            </p>

            {/* IMAGE / SLIDER */}
            {post.images?.length > 1 ? (
                <div className="relative mb-4">
                    <Swiper
                        modules={[Pagination]}
                        pagination={{ clickable: true }}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        className="rounded-2xl"
                    >
                        {post.images.map((img) => (
                            <SwiperSlide key={img._id}>
                                <img
                                    src={img.url}
                                    alt="Post"
                                    className="h-[400px] w-full object-cover sm:h-[450px] lg:h-[500px]"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {/* LEFT ARROW */}
                    <button
                        onClick={() => swiperRef.current?.slidePrev()}
                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 backdrop-blur transition hover:scale-110 hover:bg-insta-gradient cursor-pointer"
                    >
                        <ChevronLeft className="text-white" size={22} />
                    </button>

                    {/* RIGHT ARROW */}
                    <button
                        onClick={() => swiperRef.current?.slideNext()}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 backdrop-blur transition hover:scale-110 hover:bg-insta-gradient cursor-pointer"
                    >
                        <ChevronRight className="text-white" size={22} />
                    </button>
                </div>
            ) : post.images?.length === 1 ? (
                <img
                    src={post.images[0].url}
                    alt="Post"
                    className="mb-4 h-[400px] w-full rounded-2xl object-cover sm:h-[450px] lg:h-[500px]"
                />
            ) : post.image?.url ? (
                <img
                    src={post.image.url}
                    alt="Post"
                    className="mb-4 h-[400px] w-full rounded-2xl object-cover sm:h-[450px] lg:h-[500px]"
                />
            ) : null}

            {/* STATS */}
            <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                <p className="font-medium text-insta-pink">
                    {localLikes.length} likes
                </p>

                <p className="dark:text-white dark:bg-app-dark">
                    {post.comments?.length || 0} comments
                </p>
            </div>

            {/* ACTIONS */}
            <PostActions
                liked={liked}
                likesCount={localLikes.length}
                likes={localLikes}
                onLike={handleLike}
            />
        </article>
    );
}

export default PostCard;