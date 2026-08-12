"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaGithub, FaInstagram, FaLinkedinIn, FaEnvelope } from "react-icons/fa";

interface LinkItem {
    href: string;
    label: string;
}

interface FooterProps {
    leftLinks: LinkItem[];
    rightLinks: LinkItem[];
    copyrightText: string;
    barCount?: number;
    isDarkMode: boolean; // Essential for dark mode control
}

const Footer: React.FC<FooterProps> = ({
    leftLinks,
    rightLinks, // Not used in the provided JSX, but kept in interface
    copyrightText,
    barCount = 23,
    isDarkMode, // Destructure the isDarkMode prop
}) => {
    const waveRefs = useRef<(HTMLDivElement | null)[]>([]);
    const footerRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const [result, setResult] = useState(""); // State to display form submission messages

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.2 }
        );

        if (footerRef.current) observer.observe(footerRef.current);
        return () => footerRef.current && observer.unobserve(footerRef.current);
    }, []);

    useEffect(() => {
        let t = 0;
        const animateWave = () => {
            const waveElements = waveRefs.current;
            let offset = 0;

            waveElements.forEach((element, index) => {
                if (element) {
                    offset += Math.max(0, 20 * Math.sin((t + index) * 0.3));
                    element.style.transform = `translateY(${index + offset}px)`;
                }
            });

            t += 0.1;
            animationFrameRef.current = requestAnimationFrame(animateWave);
        };

        if (isVisible) {
            animateWave();
        } else if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isVisible]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setResult("Sending..."); // Set loading message
        const formData = new FormData(e.currentTarget);
        // IMPORTANT: Replace "YOUR_WEB3FORMS_ACCESS_KEY" with your actual Web3Forms Access Key
        formData.append("access_key", "YOUR_WEB3FORMS_ACCESS_KEY"); // Ensure this key is valid or replace with your own

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setResult("Form Submitted Successfully!"); // Success message
                e.currentTarget.reset(); // Clear form fields
            } else {
                setResult(data.message || "Something went wrong."); // Error message from API
            }
        } catch (err) {
            console.error(err);
            setResult("Failed to send message. Please try again."); // Generic error message
        }
    };

    // Glassmorphism style, remains static as requested
    const glassmorphismStyle = {
        background: "rgba(255, 255, 255, 0)", // Fully transparent background for the glass effect itself
        borderRadius: "16px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)", // For Safari support
    };

    return (
        <footer
            id="contact"
            ref={footerRef}
            // Apply dark mode for general footer text color and initial theme
            // The `text-white` or `text-gray-400` here sets the DEFAULT.
            className={`relative flex flex-col w-full select-none ${isDarkMode ? 'text-white' : 'text-gray-400'}`}
            // Apply glassmorphism and border based on dark mode for the footer container itself
            style={isDarkMode ? { ...glassmorphismStyle, border: '1px solid rgba(255, 255, 255, 0.3)' } : { ...glassmorphismStyle, border: '1px solid rgba(0, 0, 0, 0.2)' }}
        >
            {/* Main content container for consistent padding and centering */}
            <div className="container mx-auto px-6 pt-12 pb-24">
                {/* Footer Content - Centralized */}
                <div className="flex flex-col w-full md:flex-row items-center text-center justify-center md:gap-x-16 px-4 md:px-30 gap-8">
                    <div className="space-y-1 md:w-1/3 text-center ">
                        {/* Pulkit Tiwari Heading - explicitly white in dark mode, black in light mode */}
                        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-400'}`}>Pulkit Tiwari</h3>
                        {/* Conditional text color for description */}
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                            Passionate developer building seamless digital experiences.
                        </p>
                    </div>

                    <div className="md:w-1/3 text-center ">
                        {/* Quick Links Heading - explicitly white in dark mode, black in light mode */}
                        <h4 className={`text-md font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-400'}`}>Quick Links</h4>
                        <ul className="flex flex-wrap gap-4 text-sm justify-center ">
                            {leftLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        // Base color of links: white in dark mode, black in light mode
                                        // Hover color: sky-400 in dark mode, blue-600 in light mode
                                        className={`${isDarkMode ? 'text-white hover:text-sky-400' : 'text-gray-400 hover:text-blue-600'} transition duration-200`}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:w-1/3 text-center ">
                        {/* Follow Me Heading - explicitly white in dark mode, black in light mode */}
                        <h4 className={`text-md font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-400'}`}>Follow Me</h4>
                        <div className="flex gap-4 text-lg justify-center ">
                            {/* Social Media Icons - explicitly white in dark mode, black in light mode */}
                            <a
                                href="https://github.com/PulkitTiwari87"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${isDarkMode ? 'text-white hover:text-sky-400' : 'text-gray-400 hover:text-blue-600'} transition duration-200`}
                                aria-label="GitHub"
                            >
                                <FaGithub />
                            </a>
                            <a
                                href="https://linkedin.com/in/pulkittiwari51"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${isDarkMode ? 'text-white hover:text-sky-400' : 'text-gray-400 hover:text-blue-600'} transition duration-200`}
                                aria-label="LinkedIn"
                            >
                                <FaLinkedinIn />
                            </a>
                            <a
                                href="https://instagram.com/_pulkittiwari"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${isDarkMode ? 'text-white hover:text-sky-400' : 'text-gray-400 hover:text-blue-600'} transition duration-200`}
                                aria-label="Instagram"
                            >
                                <FaInstagram />
                            </a>
                            <a
                                href="mailto:tpulkit87@gmail.com"
                                className={`${isDarkMode ? 'text-white hover:text-sky-400' : 'text-gray-400 hover:text-blue-600'} transition duration-200`}
                                aria-label="Email"
                            >
                                <FaEnvelope />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright Text - Explicitly gray-400 in dark mode, gray-600 in light mode */}
                <div className={`text-center text-xs pt-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    {copyrightText}
                </div>
            </div>
            {/* Back to top button container - Adjusting classes */}


            {/* Wave Animation - Remains outside the main container as it's a visual effect */}
            <div
                id="waveContainer"
                aria-hidden="true"
                style={{ overflow: "hidden", height: 200 }}
            >
                <div style={{ marginTop: 0 }}>
                    {Array.from({ length: barCount }).map((_, index) => (
                        <div
                            key={index}
                            ref={(el) => {
                                waveRefs.current[index] = el;
                            }}
                            className="wave-segment"
                            style={{
                                height: `${index + 1}px`,
                                // Wave background color is static white as requested
                                backgroundColor: "rgb(255, 255, 255)",
                                transition: "transform 0.1s ease",
                                willChange: "transform",
                                marginTop: "2px",
                            }}
                        />
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;