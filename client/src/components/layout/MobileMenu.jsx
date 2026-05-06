import {
    Home,
    Compass,
    User,
    ThumbsUp,
    MessageCircle,
    Settings,
    X,
} from "lucide-react";

import { Link } from "react-router-dom";

const menuItems = [
    { name: "Home", icon: Home, active: false, to: "/home" },
    { name: "Search", icon: Compass, active: false, to: "/search" },
    { name: "Profile", icon: User, active: false, to: "/profile" },
    { name: "Messages", icon: MessageCircle, active: false, to: "/chat" },
    { name: "Likes", icon: ThumbsUp, active: false, to: "/likes" },
    { name: "Settings", icon: Settings, active: false, to: "/settings" },
];

function MobileMenu({ isOpen, onClose }) {
    return (
        <>
            <div
                onClick={onClose}
                className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition xl:hidden ${isOpen ? "block" : "hidden"
                    }`}
            />

            <aside
                className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-2xl transition-transform duration-300 xl:hidden dark:text-white dark:bg-app-dark ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
                    <h2 className="text-lg font-extrabold text-insta-gradient">
                        SocialApp
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-700 hover:bg-pink-50 hover:text-insta-pink dark:text-white dark:hover:bg-[#282f3c] cursor-pointer transition- duration-300"
                    >
                        <X size={22} />
                    </button>
                </div>

                <nav className="space-y-2 p-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        const isActive = location.pathname === item.to;

                        return (
                            <Link to={item.to} key={item.name}>
                                <button
                                    onClick={onClose}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${isActive
                                        ? "bg-insta-gradient text-white shadow-md"
                                        : "text-slate-700 dark:text-white hover:bg-pink-50 dark:hover:bg-[#282f3c] cursor-pointer hover:text-insta-pink"
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
        </>
    );
}

export default MobileMenu;