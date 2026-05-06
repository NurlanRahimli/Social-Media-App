import React from "react";

function Input({ className = "", ...props }) {
    return (
        <input
            className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-insta-pink ${className}`}
            {...props}
        />
    );
}

export default Input;