import { useEffect, useState } from "react";

export default function useDarkMode() {
    const [dark, setDark] = useState(() => {
        const saved = localStorage.getItem("theme");

        if (saved) return saved === "dark";

        // optional: system preference
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;

        if (dark) {
            root.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

    return [dark, setDark];
}