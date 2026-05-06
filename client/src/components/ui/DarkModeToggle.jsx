import useDarkMode from "../../hooks/useDarkMode";
import { Moon, Sun } from "lucide-react";

function DarkModeToggle() {
    const [dark, setDark] = useDarkMode();

    return (
        <button
            onClick={() => setDark(!dark)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer
            ${dark
                    ? "bg-slate-700 text-white hover:bg-slate-600"
                    : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                }`}
        >
            {/* ICON */}
            <span className="flex items-center justify-center">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
            </span>

            {/* TEXT */}
            {dark ? "Light Mode" : "Dark Mode"}
        </button>
    );
}

export default DarkModeToggle;