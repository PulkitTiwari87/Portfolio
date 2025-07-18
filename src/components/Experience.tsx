import React, { useEffect, useRef, useState } from "react";

interface ExperienceProps {
    isDarkMode: boolean;
}

interface ExperienceItem {
    year: string;
    role: string;
    company: string;
    description: string;
    technologies: string[];
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

const Experience: React.FC<ExperienceProps> = ({ isDarkMode }) => {
    const experiences: ExperienceItem[] = [
        {
            year: "Jun 2025 – Present",
            role: "Full-stack Developer",
            company: "Weblicious (Internship)",
            description: `Working on modern MERN stack applications in a hybrid role. Involved in front-end and back-end feature development, REST API integration, and UI enhancements for live projects.`,
            technologies: ["MERN Stack", "MongoDB", "React.js", "Express.js", "Node.js"],
        },
        {
            year: "Sep 2024 – Present",
            role: "Public Relations & Sponsorship",
            company: "UPES CSA Student Chapter",
            description: `Head of Sponsorship (May 2025 – Present): Leading the Sponsorship and PR committee. Managing partnerships, proposals, and outreach to drive student initiatives and secure resources.

Public Relation Lead (Mar 2025 – May 2025): Oversaw PR campaign execution, supervised the PR team, and ensured smooth communication for event success.

PR Core Team Member (Sep 2024 – Mar 2025): Managed event promotion and communication. Contributed to content, design, and stakeholder engagement.`,
            technologies: ["Sponsorship", "Public Relations", "Leadership", "Teamwork", "Communication"],
        },
        {
            year: "Sep 2024 – Apr 2025",
            role: "Technical Team Member",
            company: "UPES-Hypervision",
            description: `Contributed to the development and execution of technical activities and event solutions. Helped organize student tech meets and delivered scalable solutions using modern tech stacks.`,
            technologies: ["JavaScript", "React.js", "Teamwork", "Communication"],
        },
    ];

    return (
        <div
            id="experience"
            className="px-4 sm:px-6 lg:px-12 py-20 w-full min-h-[100vh] flex flex-col items-center" // Adjusted width and min-height
        >
            {/* Inline keyframes using style tag */}
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
                className={`text-3xl sm:text-4xl font-bold text-center mb-16 transition-all ${
                    isDarkMode ? "text-white" : "text-black"
                }`}
            >
                Experience
            </h2>

            <div className="flex flex-col space-y-16 w-full max-w-4xl"> {/* Added max-width for content */}
                {experiences.map((exp, index) => {
                    const { ref, inView } = useInView();

                    return (
                        <div
                            key={index}
                            ref={ref}
                            className={`transition-all duration-700 ${
                                inView ? "animate-fade-in-up" : "opacity-0 translate-y-10"
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row px-4 lg:px-0 gap-4"> {/* Adjusted padding and flex direction */}
                                {/* Date Section */}
                                <div className="w-full lg:w-1/4 text-center lg:text-left"> {/* Aligned left on desktop */}
                                    <p
                                        className={`text-sm ${
                                            isDarkMode ? "text-stone-400" : "text-gray-700"
                                        }`}
                                    >
                                        {exp.year}
                                    </p>
                                </div>

                                {/* Content Section */}
                                <div className="w-full lg:w-3/4">
                                    <h3
                                        className={`text-lg font-semibold mb-2 ${
                                            isDarkMode ? "text-white" : "text-black"
                                        }`}
                                    >
                                        {exp.role} –{" "}
                                        <span
                                            className={`ml-1 text-sm ${
                                                isDarkMode ? "text-stone-400" : "text-gray-700"
                                            }`}
                                        >
                                            {exp.company}
                                        </span>
                                    </h3>
                                    <p
                                        className={`text-sm whitespace-pre-line ${
                                            isDarkMode ? "text-stone-300" : "text-gray-800"
                                        }`}
                                    >
                                        {exp.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {exp.technologies.map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className={`rounded px-2 py-1 text-xs font-medium ${
                                                    isDarkMode
                                                        ? "bg-stone-900 text-stone-300"
                                                        : "bg-gray-200 text-gray-900"
                                                }`}
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Experience;