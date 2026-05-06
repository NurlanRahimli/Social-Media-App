import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import PostCard from "../../components/post/PostCard";
import Button from "../../components/ui/Button";
import { Calendar, MapPin, Link as LinkIcon, User } from "lucide-react";
import api from "../../api/axios";
import ProfileSkeleton from "../../components/skeletons/ProfileSkeleton";

function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("followers"); // or "following"
    const [modalUsers, setModalUsers] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let userData;

                // 🔥 get CURRENT USER (always)
                const meRes = await api.get("/auth/me");
                setCurrentUser(meRes.data.user);

                if (id) {
                    // 🔥 OTHER USER
                    const res = await api.get(`/users/${id}`);
                    userData = res.data.user;
                } else {
                    // 🔥 MY PROFILE
                    userData = meRes.data.user;
                }

                setUser(userData);

                const postsRes = await api.get(`/posts/user/${userData._id}`);
                setPosts(postsRes.data.posts);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);


    const handleFollow = async () => {
        if (!currentUser) return;

        const isFollowing = user.followers?.includes(currentUser._id);

        // ✅ OPTIMISTIC UPDATE (instant UI)
        setUser((prev) => ({
            ...prev,
            followers: isFollowing
                ? prev.followers.filter((id) => id !== currentUser._id)
                : [...prev.followers, currentUser._id],
        }));

        try {
            await api.put(`/users/${user._id}/follow`);
        } catch (err) {
            console.error(err);

            // ❗ rollback if error
            setUser((prev) => ({
                ...prev,
                followers: isFollowing
                    ? [...prev.followers, currentUser._id]
                    : prev.followers.filter((id) => id !== currentUser._id),
            }));
        }
    };



    const handleFollowUser = async (targetUserId) => {
        if (!currentUser) return;

        const isFollowing = currentUser.following?.includes(targetUserId);

        // ✅ update currentUser (not modalUsers)
        setCurrentUser((prev) => ({
            ...prev,
            following: isFollowing
                ? prev.following.filter((id) => id !== targetUserId)
                : [...prev.following, targetUserId],
        }));

        try {
            await api.put(`/users/${targetUserId}/follow`);
        } catch (err) {
            console.error(err);
        }
    };



    if (loading) {
        return (
            <MainLayout>
                <ProfileSkeleton />
            </MainLayout>
        );
    }


    const openModal = async (type) => {
        setModalType(type);
        setShowModal(true);
        setModalLoading(true);

        try {
            const res = await api.get(`/users/${user._id}/${type}`);
            setModalUsers(res.data.users);
        } catch (err) {
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };



    const isMutualFollow =
        currentUser &&
        user.followers?.includes(currentUser._id) &&
        user.following?.includes(currentUser._id);


    return (
        <MainLayout>
            {/* PROFILE HEADER */}
            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:text-white dark:bg-app-dark">
                <div className="h-36 bg-insta-gradient sm:h-44" />

                <div className="px-5 pb-6 sm:px-8">
                    <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left">
                            <div className="rounded-full bg-insta-gradient p-[3px] shadow-md">

                                {user.profileImage?.url ? (
                                    <img
                                        src={user?.profileImage?.url}
                                        alt={user.username}
                                        className="h-28 w-28 rounded-full border-4 border-white object-cover sm:h-36 sm:w-36"
                                    />
                                ) : (
                                    <div className="h-28 w-28 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:border-[#474e5c] dark:bg-app-dark">
                                        <User className="h-20 w-20 text-slate-500 dark:text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 sm:mb-3 sm:ml-5 sm:mt-0">
                                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                                    {user.username}
                                </h1>
                                <p className="text-slate-500 dark:text-white">@{user.username}</p>
                                {currentUser && user._id !== currentUser._id && (

                                    <div className="mt-3 flex gap-3">

                                        {/* FOLLOW BUTTON */}
                                        <button
                                            onClick={handleFollow}
                                            className={`px-4 py-2 text-sm rounded-full cursor-pointer font-semibold transition
            ${user.followers?.includes(currentUser._id)
                                                    ? "bg-slate-200 text-slate-700 dark:bg-[#282f3c] dark:text-white dark:hover:bg-[#3b4454]"
                                                    : "bg-insta-gradient text-white"
                                                }`}
                                        >
                                            {user.followers?.includes(currentUser._id)
                                                ? "Following"
                                                : "Follow"}
                                        </button>

                                        {/* CHAT BUTTON */}
                                        {isMutualFollow && (
                                            <button
                                                onClick={() => navigate(`/chat/${user._id}`)}
                                                className="
                px-4 py-2
                text-sm
                rounded-full
                cursor-pointer
                bg-slate-200
                text-slate-700
                font-semibold
                dark:bg-[#282f3c]
                dark:text-white
                dark:hover:bg-[#3b4454]
                transition
                "
                                            >
                                                Chat
                                            </button>
                                        )}

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BIO */}
                    <p className="mt-5 max-w-2xl text-center leading-relaxed text-slate-700 sm:text-left dark:text-white">
                        {user.bio || "No bio yet"}
                    </p>

                    {/* EXTRA INFO */}
                    <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-slate-500 sm:justify-start">
                        <span className="flex items-center gap-1 dark:text-white">
                            <Calendar size={16} />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* STATS */}
                    <div className="mt-6 grid md:grid-cols-3 grid-cols-1 gap-3">
                        <div className="rounded-2xl bg-pink-50 p-4 text-center dark:bg-[#282f3c]">
                            <p className="text-xl font-bold text-insta-pink">
                                {posts.length}
                            </p>
                            <p className="text-xs font-medium text-slate-500 dark:text-white">Posts</p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4 text-center dark:bg-[#282f3c]">
                            <p onClick={() => openModal("followers")} className="text-xl font-bold text-insta-purple cursor-pointer">
                                {user.followers?.length || 0}
                            </p>
                            <p className="text-xs font-medium text-slate-500 dark:text-white">Followers</p>
                        </div>

                        <div className="rounded-2xl bg-orange-50 p-4 text-center dark:bg-[#282f3c]">
                            <p onClick={() => openModal("following")} className="text-xl font-bold text-insta-red cursor-pointer">
                                {user.following?.length || 0}
                            </p>
                            <p className="text-xs font-medium text-slate-500 dark:text-white">Following</p>
                        </div>
                    </div>
                </div>
            </section>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg dark:text-white dark:bg-app-dark">

                        {/* HEADER */}
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold capitalize">
                                {modalType}
                            </h2>
                            <button className="cursor-pointer" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {/* CONTENT */}
                        {modalLoading ? (
                            <p className="text-center text-slate-500 dark:text-white">Loading...</p>
                        ) : modalUsers.length === 0 ? (
                            <p className="text-center text-slate-500 dark:text-white">
                                No {modalType} yet
                            </p>
                        ) : (
                            <div className="max-h-80 overflow-y-auto space-y-3">
                                {modalUsers.map((u) => (
                                    <div
                                        key={u._id}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#282f3c] transition"
                                    >
                                        {/* LEFT SIDE (clickable) */}
                                        <div
                                            onClick={() => {
                                                setShowModal(false);

                                                if (u._id === currentUser._id) {
                                                    navigate("/profile");
                                                } else {
                                                    navigate(`/profile/${u._id}`);
                                                }
                                            }}
                                            className="flex items-center gap-3 cursor-pointer"
                                        >
                                            {u.profileImage?.url ? (
                                                <img
                                                    src={u.profileImage.url}
                                                    alt={u.username}
                                                    className="h-10 w-10 rounded-full border-4 border-white object-cover dark:border-[#474e5c]"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:border-[#474e5c] dark:bg-app-dark">
                                                    <User className="h-5 w-5 text-slate-500 dark:text-white" />
                                                </div>
                                            )}

                                            <span className="font-medium">{u.username}</span>
                                        </div>

                                        {/* RIGHT SIDE (follow button) */}
                                        {currentUser && u._id !== currentUser._id && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // prevents navigation
                                                    handleFollowUser(u._id);
                                                }}
                                                className={`text-xs px-4 py-2 font-semibold cursor-pointer rounded-full ${currentUser.following?.includes(u._id)
                                                    ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white"
                                                    : "bg-insta-gradient text-white"
                                                    }`}
                                            >
                                                {currentUser.following?.includes(u._id)
                                                    ? "Following"
                                                    : "Follow"}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* POSTS */}
            {posts.length === 0 ? (
                <p className="text-center text-slate-500">No posts yet</p>
            ) : (
                posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))
            )}
        </MainLayout>
    );
}

export default Profile;