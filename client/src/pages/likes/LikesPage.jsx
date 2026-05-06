import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Images } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import PostSkeleton from "../../components/skeletons/PostSkeleton";

function LikesPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLikedPosts = async () => {
            try {
                const res = await api.get("/posts/liked");
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 300);
            }
        };

        fetchLikedPosts();
    }, []);


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
            <div className="p-6 min-h-screen bg-[var(--color-app-light)] dark:bg-app-dark">
                {/* Title */}
                <h1 className="text-3xl font-bold mb-6 text-insta-gradient">
                    Liked Posts
                </h1>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[...Array(4)].map((_, i) => (
                            <PostSkeleton key={i} />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <p className="text-gray-500 dark:text-white">No liked posts yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {posts.map((post) => {
                            const hasImage =
                                (post.images && post.images.length > 0) ||
                                post.image?.url;

                            return (
                                <div
                                    key={post._id}
                                    onClick={() => navigate(`/post/${post._id}`)}
                                    className="group relative cursor-pointer rounded-2xl overflow-hidden aspect-square hover:scale-[1.02] transition-transform duration-300"
                                >
                                    {hasImage ? (
                                        // 🖼️ IMAGE CARD (Instagram style)
                                        <>
                                            <img
                                                src={post.images?.[0]?.url || post.image?.url}
                                                alt="post"
                                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                            />

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                                                <span className="text-white opacity-0 group-hover:opacity-100 transition text-sm font-medium">
                                                    ❤️ {post.likesCount}
                                                </span>
                                            </div>

                                            {/* Multiple images icon */}
                                            {post.images.length > 1 && (
                                                <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-md">
                                                    <Images className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // TEXT CARD
                                        <div className="relative h-full rounded-2xl overflow-hidden">

                                            {/* Gradient background */}
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background: getGradient(post._id),
                                                }}
                                            />

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                            {/* Content */}
                                            <div className="relative z-10 flex flex-col justify-end h-full p-4">

                                                <p className="text-lg font-bold text-white leading-tight line-clamp-2">
                                                    {post.content || "Untitled"}
                                                </p>

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
            </div>
        </MainLayout>
    );
}

export default LikesPage;