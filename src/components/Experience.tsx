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
            year: "Jun 2026 – Present",
            role: "Software Engineering Intern",
            company: "Ascendion, Bengaluru",
            description: `• Built a 3-agent CrewAI pipeline (AAVA platform) on AWS Bedrock using Claude models to automate resume reformatting: structured extraction -> formatted rendering -> Azure Blob Storage upload via SAS-token authentication.
• Created an output validation agent using bias guardrails and knowledge-base-grounded scoring to automate compliance checks and generate branded reports across 10+ Generative AI applications.
• Delivered 10+ Generative AI applications, automation tools, and agents using Python and LLM APIs, integrated through REST APIs and microservices.
• Worked with software engineering and DevOps teams to deliver 7+ production features through CI/CD pipelines, improving deployment reliability and release efficiency.`,
            technologies: ["Python", "CrewAI", "AWS Bedrock", "Claude LLM", "Azure Blob Storage", "REST APIs", "Microservices", "CI/CD"],
        },
        {
            year: "Jun 2025 – Jul 2025",
            role: "Full Stack Developer Intern",
            company: "Weblicious, Dehradun",
            description: `• Developed client-facing web applications using React.js, Node.js, and MongoDB (10+ Schema) with an API-first architecture.
• Implemented REST APIs and backend workflows, improving data accessibility and reducing API response time by 25%.`,
            technologies: ["React.js", "Node.js", "MongoDB", "REST APIs", "MERN Stack"],
        },
        {
            year: "Sep 2024 – May 2026",
            role: "Public Relations & Sponsorship Head",
            company: "Cloud Security Alliance (UPES)",
            description: `• Led a team of 30+ members organizing university-level technical events including hackathons, WebGenesis, and Funtopia 5.0, from concept through delivery.
• Directed sponsorship outreach for AWS Community Day Dehradun 2025 (1,000+ attendees), securing industry collaboration including GitHub.`,
            technologies: ["Leadership", "Public Relations", "Sponsorship", "Outreach", "Event Management"],
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