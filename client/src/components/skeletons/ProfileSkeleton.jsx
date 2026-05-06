function ProfileSkeleton() {
    return (
        <div className="animate-pulse">

            {/* HEADER */}
            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:text-white dark:bg-app-dark">

                {/* Cover */}
                <div className="h-36 sm:h-44 bg-slate-200" />

                <div className="px-5 pb-6 sm:px-8">

                    {/* Avatar + name */}
                    <div className="-mt-16 flex flex-col items-center sm:flex-row sm:items-end gap-4">

                        {/* Avatar */}
                        <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-slate-300 border-4 border-white" />

                        {/* Username */}
                        <div className="mt-4 sm:mt-0 sm:ml-5 space-y-2">
                            <div className="h-5 w-32 bg-slate-300 rounded" />
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                        </div>

                    </div>

                    {/* Bio */}
                    <div className="mt-5 space-y-2">
                        <div className="h-4 w-2/3 bg-slate-200 rounded" />
                        <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-slate-100 p-4">
                                <div className="h-5 w-10 bg-slate-300 mx-auto rounded mb-2" />
                                <div className="h-3 w-12 bg-slate-200 mx-auto rounded" />
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* POSTS */}
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 rounded-xl bg-slate-200" />
                ))}
            </div>

        </div>
    );
}

export default ProfileSkeleton;