import React from "react";

function Button({ children, variant = "primary", className = "", ...props }) {
    const base =
        "cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]";

    const variants = {
        primary: "bg-insta-gradient text-white shadow-md hover:opacity-90",
        outline:
            "border border-insta-pink bg-white text-insta-pink hover:bg-pink-50",
        ghost: "text-slate-600 hover:bg-slate-100",
        dark: "bg-app-dark text-white hover:bg-slate-800",
    };

    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}

export default Button;