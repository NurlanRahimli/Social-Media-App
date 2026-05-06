import { MoreHorizontal, Heart, User } from "lucide-react";

function CommentItem({ comment, onReply, parent }) {
    return (
        <div
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all dark:bg-app-dark"
            id={comment._id}
        >
            <div className="flex gap-3">

                {/* Avatar */}
                <div className="rounded-full ">
                    {comment.user?.profileImage?.url ? (
                        <img
                            src={comment.user.profileImage.url}
                            alt={comment.user.username}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white dark:border-[#282f3c] dark:bg-app-dark">
                            <User className="w-5 h-5 text-slate-500 dark:text-white" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {comment.user?.username}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-white">
                                {new Date(comment.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-700 dark:text-white">
                        {parent && (
                            <span className="text-insta-purple font-medium mr-1">
                                @{parent.user?.username}
                            </span>
                        )}
                        {comment.text}
                    </p>

                    <div className="mt-3 ">
                        <button
                            onClick={() => onReply(parent || comment)}
                            className="text-xs text-slate-500 hover:text-insta-purple dark:text-white dark:bg-app-dark cursor-pointer transition duration-300"
                        >
                            Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommentItem;