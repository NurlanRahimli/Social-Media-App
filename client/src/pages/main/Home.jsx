import { useEffect, useState, useRef } from "react";
import MainLayout from "../../components/layout/MainLayout";
import CreatePost from "../../components/post/CreatePost";
import PostCard from "../../components/post/PostCard";
import api from "../../api/axios";
import PostSkeleton from "../../components/post/PostSkeleton";

function Home() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const hasFetched = useRef(false);

    // 🔥 Fetch posts
    const fetchPosts = async () => {
        if (loading || !hasNextPage) return;

        setLoading(true);

        try {
            const res = await api.get(`/posts?page=${page}&limit=5`);

            const newPosts = res.data.posts;

            setPosts((prev) => {
                const existingIds = new Set(prev.map(p => p._id));
                const filtered = newPosts.filter(p => !existingIds.has(p._id));
                return [...prev, ...filtered];
            });

            setHasNextPage(res.data.pagination.hasNextPage);
            setPage((prev) => prev + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    // 🔥 Initial load
    useEffect(() => {
        if (hasFetched.current) return;

        hasFetched.current = true;
        fetchPosts();
    }, []);



    // 🔥 Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 200
            ) {
                fetchPosts();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, hasNextPage, loading]);

    return (
        <MainLayout>
            <CreatePost onPostCreated={(newPost) => {
                setPosts((prev) => [newPost, ...prev]);
            }} />

            {/* 🔥 Initial loading */}
            {initialLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <PostSkeleton key={i} />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <p className="text-center text-slate-500 mt-4">
                    No posts yet
                </p>
            ) : (
                <>
                    {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}

                    {/* 🔥 Bottom loading */}
                    {loading && (
                        <p className="text-center text-slate-400 py-4">
                            Loading more...
                        </p>
                    )}

                    {/* 🔥 End message */}
                    {!hasNextPage && (
                        <p className="text-center text-slate-400 py-4">
                            No more posts
                        </p>
                    )}
                </>
            )}
        </MainLayout>
    );
}

export default Home;