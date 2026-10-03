import React, { useEffect, useRef, useState } from "react";
import { experiences } from "../data/experience";

interface ExperienceProps {
    isDarkMode: boolean;
}



// Hook to detect when an element is in the viewport
const useInView = (threshold = 0.2) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                }
            },
            { threshold }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
};

// One hook call per card (hooks can't be called inside experiences.map)
const FadeInOnView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { ref, inView } = useInView();
    return (
        <div ref={ref} className={`transition-all duration-700 ${inView ? "animate-fade-in-up" : "opacity-0 translate-y-10"}`}>
            {children}
        </div>
    );
};

const Experience: React.FC<ExperienceProps> = ({ isDarkMode }) => {


    return (
        <div
            id="experience"
            className="px-4 sm:px-6 lg:px-12 py-20 w-full min-h-[100vh] flex flex-col items-center"
        >
            <style>
                {`
                    @keyframes fadeInUp {
                        0% { opacity: 0; transform: translateY(40px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fadeInUp 0.8s ease-out forwards;
                    }
                `}
            </style>

            <h2
                className={`text-4xl sm:text-5xl font-semibold text-center mb-20 type-headline ${isDarkMode ? "text-white" : "text-black"
                    }`}
            >
                Experience
            </h2>

            <div className="flex flex-col space-y-16 w-full max-w-4xl">
                {experiences.map((exp, index) => {
                    return (
                        <FadeInOnView key={index}>
                            <div className="flex flex-col lg:flex-row px-4 lg:px-0 gap-6">
                                {/* Date Section */}
                                <div className="w-full lg:w-1/4 text-center lg:text-left">
                                    <p
                                        className={`text-sm font-medium type-label tabular-nums ${isDarkMode ? "text-stone-400" : "text-gray-600"
                                            }`}
                                    >
                                        {exp.year}
                                    </p>
                                </div>

                                {/* Content Section */}
                                <div className="w-full lg:w-3/4">
                                    <h3
                                        className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-black"
                                            }`}
                                    >
                                        {exp.role}
                                        <span
                                            className={`block text-lg font-medium mt-1 ${isDarkMode ? "text-blue-400" : "text-blue-600"
                                                }`}
                                        >
                                            {exp.company}
                                        </span>
                                    </h3>
                                    <p
                                        className={`text-base leading-relaxed whitespace-pre-line ${isDarkMode ? "text-stone-400" : "text-gray-600"
                                            }`}
                                    >
                                        {exp.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-6">
                                        {exp.technologies.map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className={`rounded-full px-3 py-1 text-xs font-medium type-label ${isDarkMode
                                                        ? "bg-stone-900 text-stone-400 border border-stone-800"
                                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                                    }`}
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeInOnView>
                    );
                })}
            </div>
        </div>
    );
};

export default Experience;