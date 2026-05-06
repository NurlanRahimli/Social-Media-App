function PostSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-app-dark">
            {/* Image */}
            <div className="h-40 w-full rounded-xl bg-slate-200 mb-4"></div>

            {/* Title */}
            <div className="h-4 w-2/3 rounded bg-slate-200 mb-2"></div>

            {/* Description */}
            <div className="h-3 w-full rounded bg-slate-200 mb-1"></div>
            <div className="h-3 w-5/6 rounded bg-slate-200 mb-3"></div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="h-3 w-10 rounded bg-slate-200"></div>
                <div className="h-3 w-6 rounded bg-slate-200"></div>
            </div>
        </div>
    );
}

export default PostSkeleton;