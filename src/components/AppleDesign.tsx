import React, { useEffect, useRef, useState } from "react";
import {
    AnimatePresence,
    MotionConfig,
    motion,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type Variants,
} from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";
import { content, type Content } from "../data/roles";
import { experiences } from "../data/experience";
import { REPO_META, isFlagship, projectUrl } from "../data/repos";
import { fetchAllRepos } from "../utils/github";
import Activity from "./Activity";
import AppleHello from "./ui/AppleHello";
import DesignMenu from "./ui/DesignMenu";
import { DESIGNS, goToDesign } from "../data/designs";
import type { Repo } from "../types";
import profileImg from "../assets/profile-portrait.jpg";

// Port of the Stitch "Apple Type Portfolio" screens (landing, projects/experience, mobile).
// Colours come in light/dark pairs via the class-based `dark:` variant.

interface AppleDesignProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const RESUME_PDF = "/Pulkit_Tiwari_SDE.pdf";
const EMAIL = "mailto:tpulkit87@gmail.com";
const LINKEDIN = "https://linkedin.com/in/pulkittiwari51";
const GITHUB = "https://github.com/PulkitTiwari87";

const NAV = [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "Profile" },
    { id: "projects", label: "Projects" },
    { id: "activity", label: "Activity" },
    { id: "experience", label: "Experience" },
    { id: "stack", label: "Stack" },
    { id: "contact", label: "Contact" },
];

const ROLE_LABELS: Record<keyof Content, string> = {
    anyone: "Anyone",
    recruiter: "Recruiter",
    engineer: "Engineer",
    ai: "AI",
    cybersecurity: "Cybersecurity",
    builder: "Builder",
};

const STACK: { title: string; items: [string, string][] }[] = [
    {
        title: "Languages",
        items: [
            ["Python", "AI, ML, scripting"],
            ["Java", "OOP, DSA"],
            ["JavaScript / TypeScript", "Web, Node"],
            ["C", "Fundamentals"],
            ["SQL", "PostgreSQL, MySQL"],
        ],
    },
    {
        title: "Web & Infrastructure",
        items: [
            ["React / Next.js", "Frontend"],
            ["Node.js & Express", "REST, WebSockets"],
            ["gRPC & Microservices", "Services"],
            ["PostgreSQL, MongoDB & Redis", "Data"],
            ["AWS, Docker & CI/CD", "Cloud, DevOps"],
        ],
    },
    {
        title: "AI & Security",
        items: [
            ["LLMs, RAG & Agentic AI", "Generative AI"],
            ["CrewAI & AWS Bedrock", "Agents"],
            ["XGBoost, scikit-learn & TensorFlow", "ML"],
            ["Wazuh, TheHive, Cortex & MISP", "SOC automation"],
            ["Burp Suite, Nmap & OWASP", "AppSec"],
        ],
    },
];

const CERTS: { issuer: string; items: string[] }[] = [
    {
        issuer: "Google",
        items: [
            "Foundations of Cybersecurity",
            "Play It Safe: Manage Security Risks",
            "Connect and Protect: Networks and Network Security",
            "Tools of the Trade: Linux and SQL",
        ],
    },
    {
        issuer: "HackerRank",
        items: ["JavaScript (Intermediate)", "React", "JavaScript (Basic)", "CSS (Basic)", "Python (Basic)"],
    },
];

const STATS = [
    { dot: "bg-[#1d1d1f] dark:bg-[#f5f5f7]", text: "Guardrail validation across 10+ GenAI applications" },
    { dot: "bg-[#0071e3] dark:bg-[#2997ff]", text: "92.41% accuracy on a 45,000-record alert-triage model" },
    { dot: "bg-[#86868b]", text: "30+ person team led" },
];

const scrollToId = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

// Motion language: springs (critically damped) for anything touchable, eased reveals for passive scroll-ins.
// <MotionConfig reducedMotion="user"> (in the render below) drops transform/layout animation for reduced-motion
// users while opacity still fades, so every effect degrades to a gentle cross-fade.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", duration: 0.4, bounce: 0 } as const;
const PRESS = { whileTap: { scale: 0.97 }, transition: { type: "spring", duration: 0.2, bounce: 0 } } as const;
const VIEWPORT = { once: true, margin: "0px 0px -6% 0px" } as const;

// Fade + rise + slight de-blur as it enters the viewport; `i` staggers siblings (60ms steps, capped at 5).
const Reveal: React.FC<{ children: React.ReactNode; className?: string; i?: number; blur?: boolean }> = ({
    children,
    className,
    i = 0,
    blur = true,
}) => {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, ...(blur ? { filter: "blur(4px)" } : {}) }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) }}
            viewport={VIEWPORT}
            transition={{ duration: reduce ? 0.25 : 0.6, ease: EASE, delay: reduce ? 0 : Math.min(i, 5) * 0.06 }}
        >
            {children}
        </motion.div>
    );
};

// Timeline hairline that draws left to right as its item enters.
const Hairline: React.FC = () => {
    const reduce = useReducedMotion();
    return (
        <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
            whileInView={reduce ? { opacity: 1 } : { scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.9, ease: EASE }}
            style={{ originX: 0 }}
            className="absolute inset-x-0 top-0 h-px bg-black/[0.06] dark:bg-white/[0.08]"
        />
    );
};

// Scroll-linked parallax (transform/opacity only, motion values only, light spring smoothing). Static under reduced motion.
const SMOOTH = { stiffness: 140, damping: 30, mass: 0.4 };
const STOPS = [0, 0.3, 0.7, 1];
// Wraps content and moves it against the page scroll. p = 0 when the wrapper enters the bottom of the viewport, 1 when it
// leaves the top. y: [at enter, at leave] px (positive-to-negative = faster than scroll, negative-to-positive = slower).
// scale / fade: values at STOPS (enter, settled-in, settled-out, leave) for the Apple scale-in / ease-out feel.
const Drift: React.FC<{
    children: React.ReactNode;
    className?: string;
    y?: [number, number];
    scale?: number[];
    fade?: number[];
}> = ({ children, className, y = [0, 0], scale = [1, 1, 1, 1], fade = [1, 1, 1, 1] }) => {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const p = useSpring(scrollYProgress, SMOOTH);
    const ty = useTransform(p, [0, 1], y);
    const ts = useTransform(p, STOPS, scale);
    const to = useTransform(p, STOPS, fade);
    return (
        <motion.div ref={ref} className={className} style={reduce ? undefined : { y: ty, scale: ts, opacity: to, willChange: "transform" }}>
            {children}
        </motion.div>
    );
};

// Portrait card: scroll-linked parallax/scale + pointer tilt (max 3deg, spring, resets on leave) + soft pulsing dot.
const TILT = { stiffness: 250, damping: 32, mass: 1 };
const Portrait: React.FC<{ ready: boolean }> = ({ ready }) => {
    const reduce = useReducedMotion();
    const { scrollY } = useScroll();
    // Falls behind the page (slower than scroll) while growing and tilting slightly: depth against the headline.
    const y = useSpring(useTransform(scrollY, [0, 700], [0, 64]), SMOOTH);
    const scale = useSpring(useTransform(scrollY, [0, 700], [1, 1.05]), SMOOTH);
    const rotate = useSpring(useTransform(scrollY, [0, 700], [0, 1.5]), SMOOTH);
    const rx = useSpring(0, TILT);
    const ry = useSpring(0, TILT);
    const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
    };
    const reset = () => {
        rx.set(0);
        ry.set(0);
    };
    return (
        <motion.div
            initial={{ opacity: 0, ...(reduce ? {} : { y: 24 }) }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, ...(reduce ? {} : { y: 24 }) }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            className="w-full max-w-[340px]"
        >
            <motion.div
                style={reduce ? { perspective: 900 } : { y, scale, rotate, perspective: 900, willChange: "transform" }}
                onPointerMove={onMove}
                onPointerLeave={reset}
            >
                <motion.figure
                    style={{ rotateX: rx, rotateY: ry }}
                    className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-black/[0.08] bg-[#f5f5f7] dark:border-white/[0.1] dark:bg-[#1d1d1f]"
                >
                    <img src={profileImg} alt="Pulkit Tiwari" className="h-full w-full object-cover object-[50%_25%]" />
                    <figcaption className="absolute inset-x-4 bottom-4 flex justify-center">
                        <span className="apl-glass flex items-center gap-2.5 rounded-full border border-white/60 bg-white/75 px-4 py-2 text-xs font-medium tracking-tight text-[#1d1d1f] backdrop-blur-xl dark:border-white/15 dark:bg-black/55 dark:text-[#f5f5f7]">
                            <span className="relative flex h-2 w-2">
                                {!reduce && (
                                    <motion.span
                                        aria-hidden
                                        className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                                        animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
                                        transition={{ duration: 2.6, ease: "easeOut", repeat: Infinity }}
                                    />
                                )}
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Open to opportunities
                        </span>
                    </figcaption>
                </motion.figure>
            </motion.div>
        </motion.div>
    );
};

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-xs font-medium tracking-[0.02em] text-[#86868b]">{children}</p>
);

const SectionTitle: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
    <Reveal className="mb-14">
        <Drift y={[-10, 10]}>
            <Eyebrow>{eyebrow}</Eyebrow>
        </Drift>
        <Drift y={[-24, 24]}>
            <h2 className="mt-1 text-3xl font-semibold tracking-[-0.022em] leading-[1.1] text-[#1d1d1f] md:text-5xl dark:text-[#f5f5f7]">
                {title}
            </h2>
        </Drift>
    </Reveal>
);

const AppleDesign: React.FC<AppleDesignProps> = ({ isDarkMode, toggleTheme }) => {
    const [role, setRole] = useState<keyof Content>("anyone");
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState("overview");
    const lockUntil = useRef(0);
    const reduce = useReducedMotion();
    const [menuOpen, setMenuOpen] = useState(false);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [filter, setFilter] = useState("All");
    const [showAll, setShowAll] = useState(false);
    const [showHello, setShowHello] = useState(true);

    // Hero depth: p runs 0 -> 1 while the first screen scrolls away. Each layer moves at its own rate.
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress: heroRaw } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const hp = useSpring(heroRaw, SMOOTH);
    const headY = useTransform(hp, [0, 1], [0, -60]);
    const headOpacity = useTransform(hp, [0, 0.8], [1, 0.2]);
    const headScale = useTransform(hp, [0, 1], [1, 0.96]);
    const eyebrowY = useTransform(hp, [0, 1], [0, -40]);
    const ctaY = useTransform(hp, [0, 1], [0, 30]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAllRepos()
            .then((r) => {
                setRepos(r);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    }, []);

    // Nav bar gains blur/saturation + hairline after ~8px of scroll.
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 8);
            // The last section can't reach the observer band at page bottom; pin it active there.
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) setActive("contact");
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Active nav item = section crossing a thin band near the middle of the viewport.
    // A click locks the observer briefly so the indicator doesn't hop through every section while smooth-scrolling.
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                if (performance.now() < lockUntil.current) return;
                // Batched entries can hold stale enter/leave pairs for one section; keep only the latest per target.
                const latest = new Map<Element, IntersectionObserverEntry>();
                entries.forEach((e) => latest.set(e.target, e));
                const hit = [...latest.values()].find((e) => e.isIntersecting);
                if (hit) setActive(hit.target.id);
            },
            { rootMargin: "-40% 0px -55% 0px" },
        );
        NAV.forEach((n) => {
            const el = document.getElementById(n.id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, []);

    const goTo = (id: string) => {
        setMenuOpen(false);
        setActive(id);
        lockUntil.current = performance.now() + 1000;
        scrollToId(id);
    };

    // Hero lines rise in sequentially once the hello overlay is gone.
    const heroParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
    const heroItem: Variants = reduce
        ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }
        : {
              hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
          };
    // Stack-card lists stagger their rows (45ms steps).
    const listV: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } } };
    const itemV: Variants = reduce
        ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
        : { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } };
    // Role paragraph cross-fade (interruptible: each swap animates from its live values, nothing queues).
    const swapIn = reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" };
    const swapTo = reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" };
    const swapOut = reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" };

    const languages = Array.from(new Set(repos.map((r) => r.language).filter((l): l is string => !!l)));
    const filters = ["All", "Flagship", ...languages];
    const filtered =
        filter === "All" ? repos : filter === "Flagship" ? repos.filter(isFlagship) : repos.filter((r) => r.language === filter);
    const visible = showAll ? filtered : filtered.slice(0, 8);

    const navLink =
        "text-xs tracking-[0.01em] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#86868b] dark:hover:text-white transition-colors duration-200 cursor-pointer";
    const linkBlue = "text-[#0071e3] dark:text-[#2997ff] hover:underline";

    return (
        <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-white text-[#1d1d1f] antialiased selection:bg-[#0071e3]/15 dark:bg-black dark:text-[#f5f5f7]">
            {showHello && <AppleHello onDone={() => setShowHello(false)} />}
            {/* Translucent top bar */}
            <header
                style={{
                    backdropFilter: scrolled || menuOpen ? "blur(24px) saturate(180%)" : "blur(0px) saturate(100%)",
                    WebkitBackdropFilter: scrolled || menuOpen ? "blur(24px) saturate(180%)" : "blur(0px) saturate(100%)",
                }}
                className={`apl-glass fixed top-0 left-0 z-50 w-full border-b transition-[background-color,backdrop-filter,border-color] duration-300 ease-out motion-reduce:duration-150 ${
                    scrolled || menuOpen
                        ? "border-black/[0.08] bg-white/70 dark:border-white/[0.08] dark:bg-black/70"
                        : "border-transparent bg-white/20 dark:bg-black/20"
                }`}
            >
                <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-6">
                    <motion.button
                        onClick={() => goTo("overview")}
                        {...PRESS}
                        className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold tracking-[-0.01em]"
                    >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d1d1f] text-[11px] font-medium text-white dark:bg-[#f5f5f7] dark:text-black">
                            P
                        </span>
                        <span>Pulkit Tiwari</span>
                    </motion.button>

                    <nav className="hidden items-center gap-7 lg:flex">
                        {NAV.map((n) => (
                            <motion.button
                                key={n.id}
                                onClick={() => goTo(n.id)}
                                {...PRESS}
                                aria-current={active === n.id ? "location" : undefined}
                                className={`relative py-1 ${navLink} ${active === n.id ? "!text-[#1d1d1f] dark:!text-white" : ""}`}
                            >
                                {n.label}
                                {active === n.id && (
                                    <motion.span
                                        layoutId="apl-nav-underline"
                                        transition={SPRING}
                                        className="absolute inset-x-0 -bottom-0.5 h-px rounded-full bg-[#1d1d1f] dark:bg-white"
                                    />
                                )}
                            </motion.button>
                        ))}
                    </nav>

                    <div className="flex shrink-0 items-center gap-4">
                        <motion.a href={RESUME_PDF} target="_blank" rel="noreferrer" {...PRESS} className={`text-xs tracking-[0.01em] ${linkBlue}`}>
                            Resume
                        </motion.a>
                        <motion.button
                            onClick={toggleTheme}
                            {...PRESS}
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            className="-m-2.5 p-2.5 text-sm text-[#6e6e73] transition-colors hover:text-[#1d1d1f] dark:text-[#86868b] dark:hover:text-white"
                        >
                            {isDarkMode ? <FaSun /> : <FaMoon />}
                        </motion.button>
                        <DesignMenu className="hidden sm:block" />
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-label="Menu"
                            aria-expanded={menuOpen}
                            className="-m-1.5 flex h-9 w-9 flex-col items-center justify-center gap-[5px] lg:hidden"
                        >
                            <span className={`block h-px w-4 bg-current transition-transform duration-200 ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`} />
                            <span className={`block h-px w-4 bg-current transition-transform duration-200 ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <nav className="border-t border-black/[0.08] px-6 py-4 lg:hidden dark:border-white/[0.08]">
                        {NAV.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => goTo(n.id)}
                                className="block w-full py-2.5 text-left text-lg font-semibold tracking-[-0.015em]"
                            >
                                {n.label}
                            </button>
                        ))}
                        <div className="border-t border-black/[0.08] py-2 dark:border-white/[0.08]">
                            <p className="px-0 py-2 text-xs font-medium tracking-[0.02em] text-[#86868b]">Designs</p>
                            {DESIGNS.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => {
                                        setMenuOpen(false);
                                        goToDesign(d.hash);
                                    }}
                                    className="block w-full py-2 text-left text-base tracking-[-0.01em]"
                                >
                                    {d.note === "Home" ? `${d.label} (Home)` : d.label}
                                </button>
                            ))}
                        </div>
                    </nav>
                )}
            </header>

            <main>
                {/* Hero + profile: one composition (Stitch "Hero & Profile Redesign") */}
                <section ref={heroRef} id="overview" className="mx-auto max-w-[980px] scroll-mt-12 px-6 pt-28 pb-14 md:pt-36 md:pb-16">
                    <div className="grid grid-cols-12 items-start gap-y-8 md:gap-8 lg:gap-12">
                        <motion.div
                            variants={heroParent}
                            initial="hidden"
                            animate={showHello ? "hidden" : "show"}
                            style={reduce ? undefined : { y: headY, opacity: headOpacity, scale: headScale, willChange: "transform" }}
                            className="col-span-12 flex flex-col justify-center lg:col-span-7"
                        >
                            <motion.div style={reduce ? undefined : { y: eyebrowY }}>
                                <motion.p variants={heroItem} className="mb-3.5 text-[13px] text-[#6e6e73] dark:text-[#86868b]">Final-year Software Engineering student</motion.p>
                            </motion.div>
                            <motion.h1 variants={heroItem} className="mb-4 text-[56px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[72px] lg:text-[88px]">
                                Pulkit Tiwari.
                            </motion.h1>
                            <motion.p variants={heroItem} className="mb-5 text-[22px] leading-[1.2] tracking-[-0.015em] text-[#6e6e73] sm:text-[26px] dark:text-[#86868b]">
                                Software Engineer. Building useful things, shipping often.
                            </motion.p>
                            <motion.p variants={heroItem} className="mb-8 max-w-[540px] text-[17px] leading-[1.47] sm:text-[19px]">
                                I like building things that are useful, scalable, and occasionally make me question why I started debugging at 2 AM.
                                My work sits between software development, AI, and cybersecurity.
                            </motion.p>
                            <motion.div style={reduce ? undefined : { y: ctaY }}>
                            <motion.div variants={heroItem} className="flex flex-wrap items-center gap-6">
                                <motion.button
                                    onClick={() => goTo("contact")}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={SPRING}
                                    className="inline-flex items-center justify-center rounded-full bg-[#0071e3] px-6 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#0077ed]"
                                >
                                    Let's talk
                                </motion.button>
                                <motion.button onClick={() => goTo("projects")} {...PRESS} className={`group inline-flex items-center text-[15px] ${linkBlue}`}>
                                    View projects <span className="ml-1 transition-transform duration-300 ease-out group-hover:translate-x-[3px]">›</span>
                                </motion.button>
                            </motion.div>
                            </motion.div>
                        </motion.div>

                        <div className="col-span-12 flex justify-center self-start lg:col-span-5 lg:justify-end">
                            <Portrait ready={!showHello} />
                        </div>
                    </div>
                </section>

                {/* Facts strip */}
                <section id="profile" className="scroll-mt-12 border-y border-black/[0.08] bg-[#fbfbfd] dark:border-white/[0.08] dark:bg-[#0a0a0b]">
                    <Drift className="mx-auto max-w-[980px] px-6 py-6" scale={[0.95, 1, 1, 0.98]} fade={[0.5, 1, 1, 0.7]}>
                        <dl className="grid grid-cols-1 gap-6 divide-y divide-black/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-white/[0.1]">
                            {[
                                ["Location", "Dehradun, India"],
                                ["Education", "B.Tech CSE, UPES · 2027"],
                                ["Focus", "Generative AI, agents and security automation"],
                            ].map(([k, v], i) => (
                                <Reveal key={k} i={i} className={`${i > 0 ? "pt-4 md:pt-0" : ""} ${i === 0 ? "md:pr-6" : i === 1 ? "md:px-6" : "md:pl-6"}`}>
                                    <dt className="mb-1.5 text-xs text-[#86868b]">{k}</dt>
                                    <dd className="text-[17px] font-medium leading-snug">{v}</dd>
                                </Reveal>
                            ))}
                        </dl>
                    </Drift>
                </section>

                <Reveal className="mx-auto flex max-w-[980px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-6 text-[14px]">
                    <motion.a href={LINKEDIN} target="_blank" rel="noreferrer" {...PRESS} className={linkBlue}>LinkedIn ›</motion.a>
                    <motion.a href={GITHUB} target="_blank" rel="noreferrer" {...PRESS} className={linkBlue}>GitHub ›</motion.a>
                    <motion.a href={EMAIL} {...PRESS} className={linkBlue}>Email ›</motion.a>
                    <motion.a href={RESUME_PDF} target="_blank" rel="noreferrer" {...PRESS} className={linkBlue}>Résumé ›</motion.a>
                </Reveal>

                {/* Role switcher */}
                <section className="border-y border-black/[0.06] bg-[#f5f5f7] py-20 md:py-24 dark:border-white/[0.08] dark:bg-[#161617]">
                    <Drift className="mx-auto max-w-[980px] px-6" y={[30, -30]} scale={[0.94, 1, 1, 0.97]} fade={[0.2, 1, 1, 0.5]}>
                        <Reveal className="-mx-6 flex overflow-x-auto px-6 pb-2 no-scrollbar md:mx-0 md:justify-center md:px-0 md:pb-0">
                            <div role="tablist" aria-label="Perspective" className="inline-flex gap-1 rounded-full border border-black/[0.04] bg-black/[0.04] p-1 dark:border-white/[0.06] dark:bg-white/[0.06]">
                                {(Object.keys(content) as (keyof Content)[]).map((r) => (
                                    <motion.button
                                        key={r}
                                        role="tab"
                                        aria-selected={role === r}
                                        onClick={() => setRole(r)}
                                        {...PRESS}
                                        className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-xs transition-colors duration-200 ${
                                            role === r
                                                ? "font-medium text-[#1d1d1f] dark:text-white"
                                                : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#86868b] dark:hover:text-white"
                                        }`}
                                    >
                                        {role === r && (
                                            <motion.span
                                                layoutId="apl-role-thumb"
                                                transition={SPRING}
                                                className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-[#3a3a3c]"
                                            />
                                        )}
                                        <span className="relative">{ROLE_LABELS[r]}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </Reveal>

                        <div className="grid min-h-[220px] place-items-center py-12 md:py-16">
                            <AnimatePresence initial={false}>
                                <motion.p
                                    key={role}
                                    initial={swapIn}
                                    animate={swapTo}
                                    exit={swapOut}
                                    transition={{ duration: 0.35, ease: EASE }}
                                    className="[grid-area:1/1] max-w-3xl text-center text-xl font-light leading-[1.35] tracking-[-0.015em] md:text-2xl lg:text-[28px]"
                                >
                                    {content[role]}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        <Reveal className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 border-t border-black/[0.06] pt-6 text-xs text-[#86868b] dark:border-white/[0.08]">
                            {STATS.map((s) => (
                                <span key={s.text} className="flex items-center gap-2">
                                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                    {s.text}
                                </span>
                            ))}
                        </Reveal>
                    </Drift>
                </section>

                {/* Projects: numbered rows, hairline dividers */}
                <section id="projects" className="mx-auto max-w-[980px] scroll-mt-12 px-6 py-24 md:py-32">
                    <SectionTitle eyebrow="Open source" title="Selected work." />
                    <Reveal i={1} className="-mt-8 mb-10">
                        <p className="text-[17px] text-[#86868b] md:text-[19px]">Fetched live from GitHub. Deployed projects open their live site.</p>
                    </Reveal>

                    <Reveal i={2} className="-mx-6 flex overflow-x-auto px-6 pb-2 no-scrollbar md:mx-0 md:px-0">
                        <div className="inline-flex gap-1 rounded-full bg-[#e8e8ed]/70 p-1 dark:bg-[#2c2c2e]/70">
                            {filters.map((f) => (
                                <motion.button
                                    key={f}
                                    onClick={() => {
                                        setFilter(f);
                                        setShowAll(false);
                                    }}
                                    {...PRESS}
                                    className={`relative whitespace-nowrap rounded-full px-4 py-1.5 text-[14px] transition-colors ${
                                        filter === f
                                            ? "font-medium text-[#1d1d1f] dark:text-white"
                                            : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#98989d] dark:hover:text-white"
                                    }`}
                                >
                                    {filter === f && (
                                        <motion.span
                                            layoutId="apl-filter-thumb"
                                            transition={SPRING}
                                            className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-[#48484a]"
                                        />
                                    )}
                                    <span className="relative">{f}</span>
                                </motion.button>
                            ))}
                        </div>
                    </Reveal>

                    <div className="mt-8 border-t border-black/[0.08] dark:border-white/[0.08]">
                        {status === "loading" && <p className="py-10 text-[17px] text-[#86868b]">Loading projects…</p>}
                        {status === "error" && (
                            <p className="py-10 text-[17px] text-[#86868b]">
                                Couldn't reach GitHub right now.{" "}
                                <a href={GITHUB} target="_blank" rel="noreferrer" className={linkBlue}>
                                    View on GitHub ›
                                </a>
                            </p>
                        )}
                        {status === "ready" && filtered.length === 0 && (
                            <p className="py-10 text-[17px] text-[#86868b]">No projects in this category.</p>
                        )}
                        <div key={filter}>
                        {visible.map((repo, i) => {
                            const meta = REPO_META[repo.name];
                            const title = meta?.displayName ?? repo.name.replace(/[_-]/g, " ");
                            const desc = meta?.description ?? repo.description ?? "A project by Pulkit Tiwari.";
                            return (
                                <Reveal key={repo.id} i={i}>
                                <motion.a
                                    href={projectUrl(repo)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={repo.homepage ? "Open live site" : "Open on GitHub"}
                                    whileTap={{ scale: 0.995 }}
                                    transition={SPRING}
                                    className="group grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-3 border-b border-black/[0.08] py-8 transition-colors duration-300 ease-out hover:bg-black/[0.02] md:grid-cols-[3rem_1fr_auto] md:items-center dark:border-white/[0.08] dark:hover:bg-white/[0.03]"
                                >
                                    <Drift y={[-10, 10]} className="pt-2 text-sm tabular-nums text-[#86868b] md:pt-0">{String(i + 1).padStart(2, "0")}</Drift>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-2xl font-semibold leading-[1.125] tracking-[-0.015em] md:text-[32px]">{title}</h3>
                                        <p className="mt-2 line-clamp-2 text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">{desc}</p>
                                    </div>
                                    <div className="col-start-2 flex items-center gap-5 text-sm md:col-start-3">
                                        {repo.language && <span className="text-xs tracking-[0.01em] text-[#86868b]">{repo.language}</span>}
                                        <span className={`inline-block text-[15px] ${linkBlue} transition-transform duration-300 ease-out group-hover:translate-x-[3px] group-hover:underline motion-reduce:transition-none motion-reduce:group-hover:translate-x-0`}>
                                            {repo.homepage ? "Live site ›" : "GitHub ›"}
                                        </span>
                                    </div>
                                </motion.a>
                                </Reveal>
                            );
                        })}
                        </div>
                    </div>
                    {filtered.length > 8 && (
                        <motion.button onClick={() => setShowAll((s) => !s)} {...PRESS} className={`mt-8 text-[15px] ${linkBlue}`}>
                            {showAll ? "Show fewer ‹" : `Show all ${filtered.length} projects ›`}
                        </motion.button>
                    )}
                </section>

                {/* Activity: last 30 days of GitHub contributions + LeetCode submissions */}
                <section id="activity" className="mx-auto max-w-[980px] scroll-mt-12 px-6 pb-24 md:pb-32">
                    <Drift y={[24, -24]} scale={[0.96, 1, 1, 0.98]}>
                        <Reveal blur={false}>
                            <Activity variant="apple" />
                        </Reveal>
                    </Drift>
                </section>

                {/* Stack */}
                <section id="stack" className="scroll-mt-12 border-t border-black/[0.06] bg-[#f5f5f7] py-24 md:py-28 dark:border-white/[0.08] dark:bg-[#161617]">
                    <div className="mx-auto max-w-[980px] px-6">
                        <SectionTitle eyebrow="Technical competency" title="Stack & tooling." />
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                            {STACK.map((g, gi) => (
                                <Drift key={g.title} y={gi === 1 ? [-16, 16] : [14, -14]}>
                                <Reveal i={gi} className="h-full rounded-[18px] border border-black/[0.05] bg-white p-7 dark:border-white/[0.08] dark:bg-[#1d1d1f]">
                                    <h3 className="border-b border-black/[0.06] pb-3 text-sm font-semibold tracking-tight dark:border-white/[0.08]">{g.title}</h3>
                                    <motion.ul
                                        variants={listV}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={VIEWPORT}
                                        className="mt-4 space-y-3 text-sm text-[#515154] dark:text-[#d2d2d7]"
                                    >
                                        {g.items.map(([name, note]) => (
                                            <motion.li key={name} variants={itemV} className="flex items-center justify-between gap-3">
                                                <span>{name}</span>
                                                <span className="shrink-0 text-xs text-[#86868b]">{note}</span>
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                </Reveal>
                                </Drift>
                            ))}
                        </div>
                        <Reveal className="mt-6 rounded-[18px] border border-black/[0.05] bg-white p-7 md:mt-8 dark:border-white/[0.08] dark:bg-[#1d1d1f]">
                            <h3 className="border-b border-black/[0.06] pb-3 text-sm font-semibold tracking-tight dark:border-white/[0.08]">Certifications</h3>
                            <div className="mt-4 grid gap-6 md:grid-cols-2">
                                {CERTS.map((c) => (
                                    <div key={c.issuer}>
                                        <p className="text-xs font-medium text-[#86868b]">{c.issuer}</p>
                                        <motion.ul
                                            variants={listV}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={VIEWPORT}
                                            className="mt-2 space-y-2 text-sm text-[#515154] dark:text-[#d2d2d7]"
                                        >
                                            {c.items.map((i) => (
                                                <motion.li key={i} variants={itemV}>{i}</motion.li>
                                            ))}
                                        </motion.ul>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Experience */}
                <section id="experience" className="mx-auto max-w-[980px] scroll-mt-12 px-6 py-24 md:py-28">
                    <SectionTitle eyebrow="Trajectory" title="Experience." />
                    <div>
                        {experiences.map((exp, ei) => (
                            <Reveal key={exp.role + exp.year} className="relative grid grid-cols-1 gap-4 py-8 md:grid-cols-12">
                                {ei > 0 && <Hairline />}
                                <Drift y={[-12, 12]} className="pt-1 text-xs tracking-wide text-[#86868b] md:col-span-3">{exp.year}</Drift>
                                <Drift y={[6, -6]} className="md:col-span-9">
                                    <h3 className="text-lg font-semibold tracking-[-0.01em] md:text-[21px]">{exp.role}</h3>
                                    <p className="mt-0.5 text-xs text-[#86868b]">{exp.company}</p>
                                    <ul className="mt-3 space-y-2 text-[15px] leading-[1.47] text-[#515154] dark:text-[#a1a1a6]">
                                        {exp.description
                                            .split("\n")
                                            .map((l) => l.replace(/^•\s*/, "").trim())
                                            .filter(Boolean)
                                            .map((line) => (
                                                <li key={line}>{line}</li>
                                            ))}
                                    </ul>
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {exp.technologies.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded border border-black/[0.04] bg-[#f5f5f7] px-2 py-0.5 text-xs text-[#515154] dark:border-white/[0.08] dark:bg-[#1d1d1f] dark:text-[#a1a1a6]"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </Drift>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section id="contact" className="scroll-mt-12 border-t border-black/[0.06] bg-[#f5f5f7] py-24 dark:border-white/[0.08] dark:bg-[#161617]">
                    <div className="mx-auto max-w-[980px] px-6 text-center">
                        <Reveal>
                            <Drift y={[-24, 24]}>
                                <h2 className="text-4xl font-semibold leading-[1.07] tracking-[-0.025em] md:text-5xl">Let's connect.</h2>
                            </Drift>
                        </Reveal>
                        <Reveal i={1}>
                            <Drift y={[-10, 10]}>
                                <p className="mx-auto mt-4 max-w-xl text-base leading-[1.47] text-[#6e6e73] md:text-lg dark:text-[#a1a1a6]">
                                    Looking for software engineering opportunities where I can build real products and keep getting better at the fundamentals.
                                </p>
                            </Drift>
                        </Reveal>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            {[0, 1].map((n) => (
                                <motion.div
                                    key={n}
                                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={VIEWPORT}
                                    transition={{ type: "spring", duration: 0.7, bounce: 0.15, delay: 0.2 + n * 0.08 }}
                                >
                                    {n === 0 ? (
                                        <motion.a
                                            href={EMAIL}
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={SPRING}
                                            className="block rounded-full bg-[#0071e3] px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0077ed]"
                                        >
                                            Send an email
                                        </motion.a>
                                    ) : (
                                        <motion.a
                                            href={LINKEDIN}
                                            target="_blank"
                                            rel="noreferrer"
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={SPRING}
                                            className="block rounded-full border border-black/[0.12] bg-white px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-black/[0.02] dark:border-white/[0.16] dark:bg-transparent dark:hover:bg-white/[0.06]"
                                        >
                                            Connect on LinkedIn
                                        </motion.a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-black/[0.08] bg-[#f5f5f7] dark:border-white/[0.08] dark:bg-[#161617]">
                <div className="mx-auto flex max-w-[980px] flex-col items-center justify-between gap-4 px-6 py-8 text-xs leading-relaxed tracking-[0.01em] text-[#6e6e73] md:flex-row dark:text-[#86868b]">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Pulkit Tiwari</span>
                        <span className="text-black/20 dark:text-white/20">•</span>
                        <span>© {new Date().getFullYear()} All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <a href={GITHUB} target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] hover:underline dark:hover:text-white">GitHub</a>
                        <a href={LINKEDIN} target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] hover:underline dark:hover:text-white">LinkedIn</a>
                        <a href={EMAIL} className="hover:text-[#1d1d1f] hover:underline dark:hover:text-white">Email</a>
                        <a href={RESUME_PDF} target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] hover:underline dark:hover:text-white">Résumé</a>
                    </div>
                </div>
            </footer>
        </div>
        </MotionConfig>
    );
};

export default AppleDesign;
