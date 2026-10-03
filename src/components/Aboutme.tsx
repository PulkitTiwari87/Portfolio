import React, { useState, useRef } from "react";
import VariableProximity from "../components/ui/VariableProximity"; // Adjust import path
import { content, type Content } from "../data/roles";

// Define the type for the component's props
interface AboutMeProps {
    isDarkMode: boolean;
}

const AboutMe: React.FC<AboutMeProps> = ({ isDarkMode }) => {
    // State to keep track of the currently selected role, initialized to 'anyone'
    const [selectedRole, setSelectedRole] = useState<keyof Content>("anyone"); // Use keyof Content for type safety

    // Object containing different descriptions based on the selected role


    // Ref for the container that VariableProximity will operate within
    // This ref is crucial for calculating mouse position relative to the text.
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        // Main container for the About Me section with responsive padding and theme transition
        <section id="about" className={`mt-10 mb-10 px-4 sm:px-6 md:px-10 lg:px-24 transition-all duration-500  ${isDarkMode ? "text-white" : "text-black"}`}>
            {/* Outer flex container for the 20/80 split */}
            <div className="flex flex-col lg:flex-row">
                {/* Empty 20% left column - visible only on large screens and above */}
                {/* You had an empty div here, which might cause layout issues if not given a width */}
                {/* If you want an empty column, ensure it has `lg:w-1/5` or similar */}

                {/* 80% right column, containing the actual AboutMe content */}
                <div className="w-full lg:w-4/5 mx-auto lg:mx-40"> {/* Adjusted width and margin for better responsiveness */}
                    {/* Content wrapper for the About Me section */}
                    <div className="p-6 text-center">
                        {/* Title for the About Me section */}
                        <h2 className="text-[2.25rem] sm:text-[3rem] lg:text-[6rem] font-semibold type-display mb-8">About Me</h2>

                        {/* Buttons for selecting the role */}
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {/* Map through the keys of the content object to create buttons */}
                            {(Object.keys(content) as Array<keyof Content>).map((role) => ( // Explicitly cast Object.keys result
                                <button
                                    key={role} // Unique key for each button
                                    onClick={() => setSelectedRole(role)} // Set the selected role on click
                                    aria-pressed={selectedRole === role}
                                    className={`px-5 py-2 rounded-full font-medium transition-all duration-300 border-2
                                        ${selectedRole === role
                                            ? (isDarkMode ? "bg-stone-300 text-black border-stone-300 shadow-md" : "bg-black text-white border-black shadow-md") // Active button styling
                                            : (isDarkMode ? "border-stone-500 text-stone-300 hover:bg-stone-700 hover:text-white" : "border-gray-400 text-gray-700 hover:bg-gray-200 hover:text-black") // Inactive button styling
                                        }
                                    `}
                                >
                                    {/* Capitalize the first letter of the role for display */}
                                    {role === "ai" ? "AI" : role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Dynamic Content: Displays the description based on the selected role */}
                        {/* CHANGED <p> TO <div> TO AVOID HYDRATION ERROR */}
                        <div
                            className="text-xl sm:text-2xl md:text-3xl lg:text-[3rem] font-light leading-[1.4] lg:leading-[1.2] tracking-[-0.01em] lg:tracking-[-0.02em] w-full transition-all duration-500 px-4 sm:px-10 md:px-16 lg:px-24 xl:px-40"
                            ref={containerRef} // This is the main container for mouse tracking
                            style={{ position: 'relative' }} // Needs position relative for child absolute positioning context if you were to add overlays etc.
                        >
                            <VariableProximity
                                label={content[selectedRole]}
                                className={'variable-proximity-demo'} // You can add custom styles to this class
                                fromFontVariationSettings="'wght' 300, 'opsz' 14"
                                toFontVariationSettings="'wght' 650, 'opsz' 32"
                                containerRef={containerRef} // Pass the ref down to the component
                                radius={100} // Adjust radius as needed (e.g., 50, 150)
                                falloff='linear' // Try 'exponential' or 'gaussian'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;