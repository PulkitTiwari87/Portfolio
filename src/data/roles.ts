// Define the type for the content object, mapping roles to their descriptions
export interface Content {
    anyone: string;
    recruiter: string;
    engineer: string;
    ai: string;
    cybersecurity: string;
    builder: string;
}

export const content: Content = {
    anyone:
        "I’m Pulkit Tiwari, a final-year Computer Science student who enjoys turning slightly ambitious ideas into things that actually run. I work across full-stack development, AI, and cybersecurity — basically, I like knowing what happens from the UI all the way down to the backend.",

    recruiter:
        "I’m currently looking for software engineering opportunities where I can build real products, solve meaningful problems, and keep getting better at the fundamentals. I bring hands-on internship experience, strong full-stack foundations, and a growing focus on AI and cybersecurity.",

    engineer:
        "I enjoy building systems end-to-end — React on the front, Python or Node on the back, databases underneath, and APIs holding everything together. Recently, I’ve also been working with AI agents, LLMs, and cloud infrastructure. Clean code is the goal; mysterious bugs are apparently part of the internship.",

    ai:
        "I’m particularly interested in AI engineering and agentic systems. I’ve worked with LLMs, RAG, CrewAI, LangGraph, AWS Bedrock, prompt engineering, and AI-output guardrails — with a strong preference for building systems that do something useful rather than just having an impressive demo.",

    cybersecurity:
        "Cybersecurity is where my Computer Science background gets a little paranoid — in a useful way. I’ve worked with security automation, Wazuh, TheHive, Cortex, Redis, threat detection, ML-based triage, and incident-response workflows. I like building software while also thinking about how it could fail, be abused, or be made more resilient.",

    builder:
        "I like learning by building. Some weeks that means a full-stack application, some weeks an AI agent, and some weeks wondering why Docker suddenly decided it has feelings. My goal is simple: keep shipping, keep learning, and build software I’d be proud to put my name on."
};
