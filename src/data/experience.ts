export interface ExperienceItem {
    year: string;
    role: string;
    company: string;
    description: string;
    technologies: string[];
}

// Source: LinkedIn (dates, titles) + latest résumé (bullets). Newest first.
export const experiences: ExperienceItem[] = [
    {
        year: "Jun 2026 – Sep 2026",
        role: "Software Engineering Intern",
        company: "Ascendion, Bengaluru",
        description: `• Engineered a 3-agent CrewAI pipeline on AWS Bedrock using Claude models to automate resume reformatting through structured extraction, rendering, and Azure Blob Storage upload using SAS-token authentication.
• Developed an output-validation agent using bias guardrails and knowledge-base-grounded scoring to automate compliance checks across 10+ Generative AI applications and generate standardized branded reports.
• Integrated multi-agent workflows, cloud APIs, structured validation, and automated document-processing pipelines for enterprise GenAI applications.`,
        technologies: ["Python", "CrewAI", "AWS Bedrock", "Claude LLM", "RAG", "AI Guardrails", "Azure Blob Storage", "Microservices"],
    },
    {
        year: "Mar 2026 – May 2026",
        role: "Freelance Software Developer",
        company: "Upwork",
        description: `• Delivered AI-powered SaaS and automation solutions using React.js, Node.js, Python, PostgreSQL, and LLM APIs, including MomPlan (an LLM-based benefits-eligibility platform) and an AI receptionist prototype for automated lead handling.
• Integrated REST APIs, authentication, database workflows, and third-party services to deliver end-to-end solutions from requirements and architecture through deployment and client iterations.`,
        technologies: ["React.js", "Node.js", "Python", "PostgreSQL", "LLM APIs", "REST APIs"],
    },
    {
        year: "Jun 2025 – Jul 2025",
        role: "Full Stack Developer Intern",
        company: "Weblicious, Dehradun",
        description: `• Architected client-facing web applications using React.js, Node.js, and MongoDB with 10+ schemas and an API-first architecture.
• Optimized REST APIs and backend workflows, improving data accessibility and reducing API response time by 25%.`,
        technologies: ["React.js", "Node.js", "MongoDB", "REST APIs", "MERN Stack"],
    },
    {
        year: "Sep 2024 – Apr 2026",
        role: "Public Relations & Sponsorship Head",
        company: "UPES CSA Student Chapter (Cloud Security Alliance)",
        description: `• Led a team of 30+ members organizing university-level technical events including hackathons, WebGenesis, and Funtopia 5.0 from concept through delivery.
• Directed sponsorship outreach for AWS Community Day Dehradun 2025 (400+ attendees), securing industry collaboration including GitHub.
• Coordinated cross-functional teams across marketing, partnerships, operations, and event execution.`,
        technologies: ["Leadership", "Public Relations", "Sponsorship", "Outreach", "Event Management"],
    },
    {
        year: "Sep 2024 – Apr 2025",
        role: "Technical Team Member",
        company: "UPES Hypervision",
        description: `• Member of the technical team for the UPES Hypervision student community, contributing to technical projects and events.`,
        technologies: ["Teamwork", "Communication", "Leadership"],
    },
];
