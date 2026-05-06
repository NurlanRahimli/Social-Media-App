function UserSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-300" />
            <div className="h-4 w-32 bg-slate-300 rounded" />
        </div>
    );
}

export default UserSkeleton;