import { useState } from "react";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import MobileMenu from "./MobileMenu";

function MainLayout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-app-light dark:bg-app-dark">
            <Navbar onMenuClick={() => setIsMenuOpen(true)} />

            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
                <div className="hidden h-fit xl:sticky xl:top-20 xl:block">
                    <LeftSidebar />
                </div>

                <main className="min-w-0">{children}</main>

                <div className="hidden h-fit xl:sticky xl:top-20 xl:block">
                    <RightSidebar />
                </div>
            </div>
        </div>
    );
}

export default MainLayout;