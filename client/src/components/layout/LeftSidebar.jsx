import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Compass,
    User,
    ThumbsUp,
    MessageCircle,
    Settings,
} from "lucide-react";


const menuItems = [
    { name: "Home", icon: Home, active: false, to: "/home" },
    { name: "Search", icon: Compass, active: false, to: "/search" },
    { name: "Profile", icon: User, active: false, to: "/profile" },
    { name: "Messages", icon: MessageCircle, active: false, to: "/chat" },
    { name: "Likes", icon: ThumbsUp, active: false, to: "/likes" },
    { name: "Settings", icon: Settings, active: false, to: "/settings" },
];

function LeftSidebar() {
    const location = useLocation();

    return (
        <aside className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:bg-app-dark">
            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    const isActive = location.pathname === item.to;

                    return (
                        <Link
                            to={item.to}
                            key={item.name}
                        >
                            <button

                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition ${isActive
                                    ? "bg-insta-gradient text-white shadow-md"
                                    : "text-slate-700 dark:text-white hover:bg-pink-50 hover:text-insta-pink dark:hover:bg-[#282f3c]"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

export default LeftSidebar;