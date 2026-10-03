import React, { useState, useEffect, useRef } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { Link } from "react-scroll"; // Import Link for smooth scrolling

// Define the type for the component's props
interface SidebarNavbarProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
}

const SidebarNavbar: React.FC<SidebarNavbarProps> = ({ toggleTheme, isDarkMode }) => {
    // State to track if the screen is mobile size (less than 768px)
    const [isMobile, setIsMobile] = useState<boolean>(false); // Initialize to false, update in useEffect
    // State to control the visibility of the sidebar menu
    const [menuVisible, setMenuVisible] = useState<boolean>(true); // Initialize to true for desktop, false for mobile based on resize
    // State + ref for the "Designs" dropdown
    const [designsOpen, setDesignsOpen] = useState<boolean>(false);
    const designsRef = useRef<HTMLDivElement | null>(null);

    // Close the Designs dropdown on outside click or Escape
    useEffect(() => {
        if (!designsOpen) return;
        const onDown = (e: MouseEvent) => {
            if (designsRef.current && !designsRef.current.contains(e.target as Node)) setDesignsOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setDesignsOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [designsOpen]);

    // Effect hook to handle window resizing for responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const isNowMobile: boolean = window.innerWidth < 768;
            setIsMobile(isNowMobile);
            // If transitioning from mobile to desktop, ensure menu is visible
            // If transitioning from desktop to mobile, hide the menu
            if (!isNowMobile) {
                setMenuVisible(true);
            } else {
                setMenuVisible(false);
            }
        };

        // Set initial state on mount
        handleResize();

        // Add event listener for window resize
        window.addEventListener("resize", handleResize);
        // Cleanup function: remove event listener on component unmount
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    // Handler for clicking the logo (or mobile toggle)
    const handleLogoClick = () => {
        if (isMobile) {
            setMenuVisible(!menuVisible); // Toggle menu visibility on mobile
        }
    };

    return (
        <>
            {/* Show top-left 'P' toggle only on mobile and when sidebar is hidden */}
            {isMobile && !menuVisible && (
                <div
                    onClick={handleLogoClick}
                    className={`fixed top-2.5 left-2.5 z-[1000] text-4xl font-bold cursor-pointer w-20 h-[60px] flex items-center justify-center bg-transparent transition-colors duration-300 ease-in-out ${
                        isDarkMode ? "text-white" : "text-black"
                    }`}
                >
                    P
                </div>
            )}

            {/* Sidebar navigation */}
            <div
                className={`fixed inset-y-0 left-0 w-20 py-5 flex flex-col items-center justify-between transition-colors duration-300 ease-in-out z-[999] ${
                    isDarkMode ? "bg-transparent" : "bg-transparent" // Consider adding a background color if not transparent
                } ${menuVisible ? "flex" : "hidden lg:flex"}`} 
            >
                {/* Logo/Initial */}
                <div
                    className={`text-4xl font-bold mb-2.5 ${
                        isDarkMode ? "text-white" : "text-black"
                    } ${isMobile ? "cursor-pointer" : "cursor-default"}`}
                    onClick={handleLogoClick}
                >
                    {/* Only show 'P' if not on mobile, otherwise it's handled by the fixed toggle */}
                    {!isMobile && "P"}
                </div>

                {/* Navigation links */}
                <nav className="flex flex-col gap-1 pl-12">
                    {["Intro", "Technologies", "Projects", "GitHub", "Activity", "Experience", "Contact"].map((item, index) => (
                        <Link
                            key={index}
                            to={item === "Intro" ? "Hero" : item.toLowerCase().replace(/\s+/g, "-")} // "Intro" links to "Hero" section, others use their lowercased, hyphenated name
                            smooth={true}
                            duration={500}
                            spy={true} // Mark the link as active when scrolling
                            activeClass="font-bold opacity-100" // Class applied when link is active
                            className={`relative text-sm opacity-70 transition-all duration-300 ease-in-out cursor-pointer group ${
                                isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                            }`}
                            onClick={() => {
                                if (isMobile) setMenuVisible(false); // Hide menu on mobile after clicking a link
                            }}
                        >
                            {item}
                            {/* Optional: Add a subtle underline effect on hover/active */}
                            <span className={`absolute bottom-0 left-0 w-full h-[1px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out ${
                                isDarkMode ? "bg-white" : "bg-black"
                            }`}></span>
                        </Link>
                    ))}

                    {/* Designs dropdown */}
                    <div className="relative" ref={designsRef}>
                        <button
                            onClick={() => setDesignsOpen((o) => !o)}
                            aria-haspopup="menu"
                            aria-expanded={designsOpen}
                            className={`flex items-center gap-1 text-sm opacity-70 transition-all duration-300 ease-in-out cursor-pointer ${
                                isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                            }`}
                        >
                            Designs
                            <span className={`text-[9px] transition-transform duration-200 ${designsOpen ? "rotate-180" : ""}`}>▼</span>
                        </button>
                        {designsOpen && (
                            <div
                                role="menu"
                                className={`absolute left-full top-1/2 ml-4 min-w-[8rem] -translate-y-1/2 rounded-xl border p-1 backdrop-blur-xl ${
                                    isDarkMode ? "border-white/10 bg-black/70" : "border-black/10 bg-white/80"
                                }`}
                            >
                                <button
                                    role="menuitem"
                                    onClick={() => {
                                        setDesignsOpen(false);
                                        if (isMobile) setMenuVisible(false);
                                        window.location.hash = "#/designs/apple";
                                    }}
                                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                                        isDarkMode ? "text-gray-200 hover:bg-white/10" : "text-gray-800 hover:bg-black/5"
                                    }`}
                                >
                                    Apple
                                </button>
                                <button
                                    role="menuitem"
                                    onClick={() => {
                                        setDesignsOpen(false);
                                        if (isMobile) setMenuVisible(false);
                                        window.location.hash = "#/designs/frame";
                                    }}
                                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                                        isDarkMode ? "text-gray-200 hover:bg-white/10" : "text-gray-800 hover:bg-black/5"
                                    }`}
                                >
                                    Frame
                                </button>
                                <button
                                    role="menuitem"
                                    onClick={() => {
                                        setDesignsOpen(false);
                                        if (isMobile) setMenuVisible(false);
                                        window.location.hash = "#/designs/nerd";
                                    }}
                                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                                        isDarkMode ? "text-gray-200 hover:bg-white/10" : "text-gray-800 hover:bg-black/5"
                                    }`}
                                >
                                    NERD
                                </button>
                                <button
                                    role="menuitem"
                                    onClick={() => {
                                        setDesignsOpen(false);
                                        if (isMobile) setMenuVisible(false);
                                        window.location.hash = "#/designs/blahhh";
                                    }}
                                    className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                                        isDarkMode ? "text-gray-200 hover:bg-white/10" : "text-gray-800 hover:bg-black/5"
                                    }`}
                                >
                                    Blahhh
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Theme toggle button */}
                <button
                    onClick={toggleTheme}
                    className={`bg-transparent border-none cursor-pointer text-2xl transition-colors duration-300 ease-in-out ${
                        isDarkMode ? "text-white" : "text-black"
                    }`}
                >
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                </button>
            </div>
        </>
    );
};

export default SidebarNavbar;