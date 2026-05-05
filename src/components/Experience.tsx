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
            year: "May 2025 – Jul 2025",
            role: "Full Stack Developer Intern",
            company: "Weblicious",
            description: `• Reduced page load time by 45% (2.5s to 1.4s) by optimizing backend APIs and frontend rendering logic.
• Built scalable REST APIs handling concurrent requests, improving overall system throughput by 15%.
• Improved database query performance by 30% through strategic indexing and query optimization.
• Enhanced backend reliability via structured error handling and modular architecture using the MERN stack.`,
            technologies: ["JavaScript", "Python", "Node.js", "Express.js", "MongoDB", "MySQL", "PostgreSQL"],
        },
        {
            year: "Sep 2024 – Apr 2026",
            role: "Public Relations & Sponsorship Head",
            company: "Cloud Security Alliance (UPES)",
            description: `• Led outreach and sponsorship initiatives for AWS Community Day Dehradun 2025, which hosted 1000+ attendees.
• Increased event registrations by 55% through targeted PR campaigns, student chapter partnerships, and digital outreach.
• Managed relationships with corporate sponsors and stakeholders to secure resources for student initiatives.`,
            technologies: ["Leadership", "Public Relations", "Sponsorship", "Outreach", "Strategic Planning"],
        },
        {
            year: "Sep 2024 – Apr 2025",
            role: "Technical Team Member",
            company: "UPES-Hypervision",
            description: `• Contributed to the development of technical solutions for student meets and hackathons.
• Delivered scalable frontend components and integrated backend services for internal club projects.`,
            technologies: ["JavaScript", "React.js", "Teamwork", "Agile"],
        },
    ];

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
                className={`text-4xl sm:text-5xl font-extrabold text-center mb-20 tracking-tighter ${isDarkMode ? "text-white" : "text-black"
                    }`}
            >
                Experience
            </h2>

            <div className="flex flex-col space-y-16 w-full max-w-4xl">
                {experiences.map((exp, index) => {
                    const { ref, inView } = useInView();

                    return (
                        <div
                            key={index}
                            ref={ref}
                            className={`transition-all duration-700 ${inView ? "animate-fade-in-up" : "opacity-0 translate-y-10"
                                }`}
                        >
                            <div className="flex flex-col lg:flex-row px-4 lg:px-0 gap-6">
                                {/* Date Section */}
                                <div className="w-full lg:w-1/4 text-center lg:text-left">
                                    <p
                                        className={`text-sm font-mono uppercase tracking-widest ${isDarkMode ? "text-stone-500" : "text-gray-400"
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
                                                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${isDarkMode
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Experience;