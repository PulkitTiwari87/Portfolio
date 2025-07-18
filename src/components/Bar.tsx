import React, { useState, useEffect } from "react";
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
                    {["Intro", "Technologies", "Projects", "Experience", "Contact"].map((item, index) => (
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