import { useEffect, useState } from "react";
import { Send, User } from "lucide-react";
import CommentItem from "./CommentItem";
import Button from "../ui/Button";
import Input from "../ui/Input";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";


function CommentSection({ postId, comments, setPost }) {
    const [text, setText] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const { user } = useAuth();
    const MAX_LENGTH = 300;


    const handleAddComment = async () => {
        if (!text.trim()) return;

        try {
            const res = await api.post(`/posts/${postId}/comment`, {
                text,
                parentComment: replyTo?._id || null,
            });

            setPost((prev) => ({
                ...prev,
                comments: res.data.comments,
            }));

            setText("");
            setReplyTo(null);

        } catch (err) {
            console.error("ERROR:", err.response?.data || err.message);
        }
    };


    const sortedComments = [...comments].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
        <div className="mt-6">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Comments</h3>

                <span className="rounded-full bg-insta-gradient px-3 py-1 text-xs font-semibold text-white">
                    {sortedComments.length} comments
                </span>
            </div>

            {/* INPUT */}
            {text.length > MAX_LENGTH && (
                <p className="text-xs text-red-500 mb-2">
                    Comment is too long (max {MAX_LENGTH} characters)
                </p>
            )}
            <div className="text-xs my-2">
                <span
                    className={`${text.length > MAX_LENGTH
                        ? "text-red-500"
                        : text.length > 250
                            ? "text-yellow-500"
                            : "text-green-400"
                        }`}
                >
                    {text.length}/{MAX_LENGTH}
                </span>
            </div>

            {replyTo && (
                <div className="mb-2 text-sm text-purple-600 flex justify-between items-center">
                    <span>
                        Replying to <b>@{replyTo.user?.username}</b>
                    </span>

                    <button
                        onClick={() => setReplyTo(null)}
                        className="text-red-500 text-xs font-semibold cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="mb-6 flex gap-3 rounded-2xl bg-slate-50 p-3 dark:text-white dark:bg-app-dark">
                <div className="rounded-full bg-insta-gradient p-[2px]">
                    {user?.profileImage?.url ? (
                        <img
                            src={user?.profileImage.url}
                            alt={user.username}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:bg-app-dark dark:border-[#282f3c]">
                            <User className="w-5 h-5 text-slate-500 dark:text-white" />
                        </div>
                    )}
                </div>

                <div className="flex flex-1 gap-3 items-center">
                    <Input
                        placeholder="Write a comment..."
                        value={text}
                        className="dark:text-white dark:bg-app-dark"
                        onChange={(e) => setText(e.target.value)}
                    />


                    <Button
                        onClick={handleAddComment}
                        className="cursor-pointer"
                        disabled={!text.trim() || text.length > MAX_LENGTH}
                    >
                        <Send size={16} />
                        Post
                    </Button>
                </div>
            </div>

            {/* COMMENTS */}
            <div className="space-y-4">
                {sortedComments
                    .filter((c) => !c.parentComment)
                    .map((parent) => (
                        <div key={parent._id}>
                            <CommentItem
                                comment={parent}
                                onReply={setReplyTo}
                            />

                            {/* REPLIES */}
                            <div className="ml-12 mt-2 space-y-2">
                                {sortedComments
                                    .filter((c) => c.parentComment?.toString() === parent._id.toString())
                                    .map((reply) => (
                                        <CommentItem
                                            key={reply._id}
                                            comment={reply}
                                            onReply={setReplyTo}
                                            parent={sortedComments.find(
                                                (c) => c._id.toString() === reply.parentComment?.toString()
                                            )}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default CommentSection;