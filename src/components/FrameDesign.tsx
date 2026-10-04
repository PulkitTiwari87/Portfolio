import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { FaEnvelope, FaGithub, FaInstagram, FaLinkedinIn, FaMoon, FaRobot, FaShieldAlt, FaSun } from "react-icons/fa";
import { useFramePhase, useFrameScroll, useReducedMotion, useSmoothScroll } from "./frame/hooks";
import {
    AboutPanel,
    AvailableTab,
    CountUp,
    FrameFxStyles,
    FramePreloader,
    HeroBackdrop,
    ResumePill,
    StatsIntro,
    TitleIcon,
} from "./frame/TopFx";
import { fetchAllRepos } from "../utils/github";
import type { Repo } from "../types";
import { ContactSection, FeatureStage, FrameGlobalFx, JourneyTimeline, ProjectsSection, TechMarquees } from "./FrameEffects";
import profileImg from "../assets/profile-portrait.jpg";

// "Frame": bold editorial portfolio. Colours are CSS variables switched by the
// existing isDarkMode flag, so every section works in light and dark.

interface FrameDesignProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    onExit: () => void;
}

const RESUME_PDF = "/Pulkit_Tiwari_SDE.pdf";
const EMAIL_ADDRESS = "tpulkit87@gmail.com";
const EMAIL = `mailto:${EMAIL_ADDRESS}`;
const LINKEDIN = "https://linkedin.com/in/pulkittiwari51";
const GITHUB = "https://github.com/PulkitTiwari87";
const INSTAGRAM = "https://instagram.com/_pulkittiwari";
const LEETCODE = "https://leetcode.com/u/pulkittiwari51/";

const THEMES = {
    dark: {
        "--f-bg": "#111111",
        "--f-fg": "#f3f3ee",
        "--f-muted": "rgba(243,243,238,0.62)",
        "--f-line": "rgba(243,243,238,0.16)",
        "--f-accent": "#d4ff3a",
        "--f-btn-bg": "#d4ff3a",
        "--f-btn-fg": "#111111",
        "--f-hover": "rgba(243,243,238,0.05)",
    },
    light: {
        "--f-bg": "#f4f4ef",
        "--f-fg": "#111111",
        "--f-muted": "rgba(17,17,17,0.64)",
        "--f-line": "rgba(17,17,17,0.18)",
        "--f-accent": "#455800",
        "--f-btn-bg": "#111111",
        "--f-btn-fg": "#d4ff3a",
        "--f-hover": "rgba(17,17,17,0.05)",
    },
} as const;

const NAV = [
    { id: "top", label: "Home" },
    { id: "about", label: "About" },
    { id: "work", label: "Work" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact" },
];

const SOCIALS = [
    { label: "GitHub", href: GITHUB },
    { label: "LinkedIn", href: LINKEDIN },
    { label: "Instagram", href: INSTAGRAM },
    { label: "LeetCode", href: LEETCODE },
];

const scrollToId = (id: string) =>
    id === "top"
        ? window.scrollTo({ top: 0, behavior: "smooth" })
        : document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const clockFormat = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

const display = "font-['Anton',Impact,'Arial_Narrow',sans-serif] font-normal uppercase";
const muted = "text-[color:var(--f-muted)]";
const line = "border-[color:var(--f-line)]";
const ghostPill = `inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--f-hover)] ${line}`;
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--f-accent)]";

// character-split title: each letter rises in on its own delay (first letter starts at `from` seconds)
const Chars: React.FC<{ text: string; from: number }> = ({ text, from }) => (
    <>
        {Array.from(text).map((c, i) => (
            <span key={i} className="frame-rise inline-block" style={{ "--d": `${(from + i * 0.045).toFixed(3)}s` } as React.CSSProperties}>
                {c === " " ? <>&nbsp;</> : c}
            </span>
        ))}
    </>
);

const Clock: React.FC = () => {
    const [now, setNow] = useState(() => clockFormat.format(new Date()));
    useEffect(() => {
        const id = window.setInterval(() => setNow(clockFormat.format(new Date())), 1000);
        return () => window.clearInterval(id);
    }, []);
    return (
        <span
            className="font-mono tabular-nums tracking-widest transition-[letter-spacing] duration-300 hover:tracking-[0.2em]"
            aria-label="Current time in India"
        >
            {now}
        </span>
    );
};

const FrameDesign: React.FC<FrameDesignProps> = ({ isDarkMode, toggleTheme, onExit }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    // top-half effects: preloader phases, smooth wheel scroll, hide-on-scroll bar, view-transition theme switch
    const reduced = useReducedMotion();
    const phase = useFramePhase(reduced);
    useSmoothScroll(phase === "ready");
    const [scrolled, setScrolled] = useState(false);
    const [barHidden, setBarHidden] = useState(false);
    const lastY = useRef(0);
    useFrameScroll((y) => {
        setScrolled(y > 50);
        setBarHidden(y > lastY.current && y > 100);
        lastY.current = y;
    });
    const themeBtn = useRef<HTMLButtonElement>(null);
    const switchTheme = async () => {
        const btn = themeBtn.current;
        if (!btn || reduced || typeof document.startViewTransition !== "function") return toggleTheme();
        const { top, left, width, height } = btn.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const radius = Math.hypot(Math.max(left, window.innerWidth - left), Math.max(top, window.innerHeight - top));
        const transition = document.startViewTransition(() => flushSync(toggleTheme));
        await transition.ready;
        document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
        );
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAllRepos()
            .then((r) => {
                setRepos(r);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    }, []);

    const goTo = (id: string) => {
        setMenuOpen(false);
        scrollToId(id);
    };

    const liveCount = repos.filter((r) => r.homepage?.trim()).length;
    const stats = [
        { value: "10+", label: "GenAI apps validated by a guardrail agent" },
        { value: "92.41%", label: "Accuracy of an XGBoost alert-triage model" },
        { value: "30+", label: "People led at CSA UPES" },
        { value: status === "ready" ? String(liveCount) : "–", label: "Live projects on the web" },
    ];
    const theme = isDarkMode ? THEMES.dark : THEMES.light;

    return (
        <div
            style={theme as React.CSSProperties}
            className={`min-h-screen overflow-x-clip bg-[var(--f-bg)] text-[color:var(--f-fg)] antialiased selection:bg-[var(--f-btn-bg)] selection:text-[color:var(--f-btn-fg)] ${
                phase === "loading" ? "" : "frame-ready"
            }`}
        >
            <FrameFxStyles />
            {phase !== "ready" && <FramePreloader exiting={phase === "exiting"} />}
            <AvailableTab
                photo={profileImg}
                name="Pulkit Tiwari"
                role="GenAI & security engineer"
                blurb="Final-year B.Tech (Cybersecurity & Forensics) at UPES Dehradun. Open to software engineering roles and collaborations."
                links={[
                    { label: "GitHub", href: GITHUB, icon: <FaGithub /> },
                    { label: "LinkedIn", href: LINKEDIN, icon: <FaLinkedinIn /> },
                    { label: "Instagram", href: INSTAGRAM, icon: <FaInstagram /> },
                    { label: "Email", href: EMAIL, icon: <FaEnvelope /> },
                ]}
            />

            {/* Top bar */}
            <header
                className={`fixed top-0 left-0 z-50 w-full transition-[transform,background-color,border-color] duration-[400ms] ease-[cubic-bezier(.25,.1,.25,1)] ${
                    scrolled ? "border-b border-transparent bg-transparent" : `border-b bg-[var(--f-bg)]/85 backdrop-blur-md ${line}`
                } ${phase !== "ready" || (barHidden && !menuOpen) ? "-translate-y-full" : "translate-y-0"}`}
            >
                <div
                    className={`mx-auto flex items-center justify-between gap-4 border transition-[max-width,margin,height,border-radius,background-color,border-color,padding] duration-500 ${
                        scrolled
                            ? `mt-2 h-12 max-w-[1100px] rounded-full bg-[var(--f-bg)]/70 px-4 shadow-lg backdrop-blur-xl sm:px-6 ${line}`
                            : "mt-0 h-14 max-w-[1400px] rounded-none border-transparent px-4 sm:px-8"
                    }`}
                >
                    <div className="flex items-center gap-3 text-xs font-medium tracking-wider">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--f-accent)] opacity-60 motion-reduce:animate-none" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--f-accent)]" />
                        </span>
                        <Clock />
                        <span className={`hidden whitespace-nowrap sm:inline md:hidden lg:inline ${muted}`}>DEHRADUN, IN</span>
                    </div>

                    <nav aria-label="Frame sections" className="hidden items-center gap-8 md:flex">
                        {NAV.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => goTo(n.id)}
                                className={`text-sm transition-colors hover:text-[color:var(--f-accent)] ${focusRing}`}
                            >
                                {n.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <a
                            href={RESUME_PDF}
                            target="_blank"
                            rel="noreferrer"
                            className={`hidden rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--f-hover)] sm:inline-block ${line}`}
                        >
                            Resume
                        </a>
                        <button
                            ref={themeBtn}
                            onClick={switchTheme}
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-[transform,background-color] duration-300 hover:rotate-12 hover:scale-110 hover:bg-[var(--f-hover)] ${line} ${focusRing}`}
                        >
                            {isDarkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        <button onClick={onExit} className={`hidden text-xs transition-colors hover:text-[color:var(--f-accent)] md:block ${muted} ${focusRing}`}>
                            ‹ Portfolio
                        </button>
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-label="Menu"
                            aria-expanded={menuOpen}
                            className={`flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden ${focusRing}`}
                        >
                            <span className={`block h-px w-5 bg-current transition-transform ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`} />
                            <span className={`block h-px w-5 bg-current transition-transform ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <nav aria-label="Frame sections" className={`border-t bg-[var(--f-bg)] px-4 py-3 md:hidden ${line}`}>
                        {[...NAV, { id: "", label: "‹ Back to portfolio" }].map((n) => (
                            <button
                                key={n.label}
                                onClick={() => (n.id ? goTo(n.id) : onExit())}
                                className={`${display} block w-full py-2 text-left text-3xl`}
                            >
                                {n.label}
                            </button>
                        ))}
                        <a href={RESUME_PDF} target="_blank" rel="noreferrer" className={`${display} block py-2 text-3xl text-[color:var(--f-accent)]`}>
                            Resume
                        </a>
                    </nav>
                )}
            </header>

            <main className="frame-main">
                {/* Hero */}
                <section id="top" className="relative overflow-hidden">
                    <HeroBackdrop isDarkMode={isDarkMode} />
                    <div className="relative mx-auto max-w-[1400px] px-4 pt-28 pb-12 sm:px-8 md:pt-36 md:pb-16">
                        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                            <div className="lg:col-span-8">
                                <p
                                    className={`frame-rise frame-rise-l mb-6 text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] sm:text-xs ${muted}`}
                                    style={{ "--d": ".2s" } as React.CSSProperties}
                                >
                                    Hi, I'm Pulkit Tiwari. I build intelligent systems.
                                </p>

                                <div className="relative">
                                    {[
                                        { label: "GitHub", href: GITHUB, icon: <FaGithub size={28} />, pos: "-top-3 right-2", fx: "frame-float-a", d: "0s" },
                                        { label: "LinkedIn", href: LINKEDIN, icon: <FaLinkedinIn size={28} />, pos: "top-[40%] right-10", fx: "frame-float-b", d: ".1s" },
                                        { label: "Instagram", href: INSTAGRAM, icon: <FaInstagram size={28} />, pos: "-bottom-4 right-28", fx: "frame-float-c", d: ".2s" },
                                    ].map((s) => (
                                        <div
                                            key={s.label}
                                            className={`frame-rise absolute z-20 hidden md:block ${s.pos}`}
                                            style={{ "--d": s.d } as React.CSSProperties}
                                        >
                                            <a
                                                href={s.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={s.label}
                                                className={`${s.fx} block opacity-60 transition-opacity hover:text-[color:var(--f-accent)] hover:opacity-100 ${focusRing}`}
                                            >
                                                {s.icon}
                                            </a>
                                        </div>
                                    ))}

                                    <h1
                                        aria-label="GenAI & Security Engineer"
                                        className={`${display} flex flex-col text-[clamp(64px,12vw,150px)] leading-[0.9] tracking-[-0.01em]`}
                                    >
                                        <span aria-hidden="true" className="block">
                                            <span className="frame-shiny inline-block transition-transform duration-300 hover:translate-x-1">
                                                <Chars text="GenAI &" from={0} />
                                            </span>
                                        </span>
                                        <span aria-hidden="true" className="frame-outline-line flex items-center">
                                            <span className="frame-outline">
                                                <Chars text="Secu" from={0.25} />
                                            </span>
                                            <TitleIcon
                                                label="See my projects"
                                                onClick={() => goTo("work")}
                                                className={`mx-[0.04em] hidden h-[0.6em] w-[0.6em] shrink-0 items-center justify-center text-[color:var(--f-accent)] sm:inline-flex ${focusRing}`}
                                            >
                                                <FaShieldAlt className="frame-pulse h-full w-full" />
                                            </TitleIcon>
                                            <span className="frame-outline">
                                                <Chars text="rity" from={0.55} />
                                            </span>
                                        </span>
                                        <span aria-hidden="true" className="flex items-center">
                                            <span className="frame-shiny">
                                                <Chars text="Engi" from={0.8} />
                                            </span>
                                            <TitleIcon
                                                label="Email me"
                                                href={EMAIL}
                                                className={`mx-[0.04em] hidden h-[0.6em] w-[0.6em] shrink-0 items-center justify-center text-[color:var(--f-accent)] sm:inline-flex ${focusRing}`}
                                            >
                                                <FaRobot className="frame-sway h-full w-full" />
                                            </TitleIcon>
                                            <span className="frame-shiny">
                                                <Chars text="neer" from={1.05} />
                                            </span>
                                        </span>
                                    </h1>
                                </div>

                                <div className={`mt-8 flex flex-col justify-between gap-6 border-t pt-8 sm:flex-row sm:items-center ${line}`}>
                                    <p
                                        className="frame-rise frame-rise-l max-w-xl text-lg leading-relaxed sm:text-xl"
                                        style={{ "--d": ".4s" } as React.CSSProperties}
                                    >
                                        I build intelligent systems that are also hard to break.
                                    </p>
                                    <ul
                                        className="frame-rise frame-rise-r flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium"
                                        style={{ "--d": ".5s" } as React.CSSProperties}
                                    >
                                        {SOCIALS.map((s) => (
                                            <li key={s.label}>
                                                <a
                                                    href={s.href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={`transition-colors hover:text-[color:var(--f-accent)] ${focusRing}`}
                                                >
                                                    {s.label} <span className={muted}>↗</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="frame-rise hidden lg:col-span-4 lg:block" style={{ "--d": ".3s" } as React.CSSProperties}>
                                <div className={`group rounded-3xl border bg-[var(--f-hover)] p-3 transition-colors hover:border-[color:var(--f-accent)] ${line}`}>
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                                        <img
                                            src={profileImg}
                                            alt="Portrait of Pulkit Tiwari"
                                            className="h-full w-full object-cover object-[50%_25%] grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full border border-white/15 bg-black/60 px-3.5 py-2 backdrop-blur-md">
                                            <span className="inline-flex items-center gap-2 text-xs font-medium text-white">
                                                <span className="relative flex h-2 w-2" aria-hidden="true">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4ff3a] opacity-70 motion-reduce:animate-none" />
                                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4ff3a]" />
                                                </span>
                                                Available for opportunity
                                            </span>
                                            <span className="font-mono text-[10px] uppercase text-white/60">2026</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-3 pt-4 pb-2 text-xs">
                                        <span className={`font-mono uppercase ${muted}`}>Pulkit Tiwari</span>
                                        <span>Software engineer</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="frame-rise mt-12 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-16" style={{ "--d": ".6s" } as React.CSSProperties}>
                            <span className="hidden h-px flex-1 bg-[var(--f-line)] md:block" aria-hidden="true" />
                            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] md:text-xs ${muted}`}>Dehradun, IN — 2026</span>
                            <a href={EMAIL} className={ghostPill}>
                                Email me
                            </a>
                            <ResumePill href={RESUME_PDF} label="View résumé" />
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section aria-label="Numbers">
                    <StatsIntro lines={["Agents that reason.", "Systems that scale.", "Security that holds.", "And the numbers behind the work."]} />
                    <div className={`mt-12 border-y md:mt-16 ${line}`}>
                        <dl className="mx-auto grid max-w-[1400px] grid-cols-2 lg:grid-cols-4">
                            {stats.map((s, i) => (
                                <div
                                    key={s.label}
                                    className={`flex flex-col gap-3 px-4 py-8 sm:px-8 lg:py-12 ${line} ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} ${
                                        i < 3 ? "lg:border-r" : "lg:border-r-0"
                                    }`}
                                >
                                    <dt className={`order-2 text-xs leading-snug uppercase tracking-[0.1em] ${muted}`}>{s.label}</dt>
                                    <dd
                                        className={`${display} order-1 text-5xl leading-none sm:text-6xl lg:text-7xl ${
                                            i % 3 === 0 ? "text-[color:var(--f-accent)]" : ""
                                        }`}
                                    >
                                        <CountUp value={s.value} />
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                {/* About */}
                <AboutPanel
                    isDarkMode={isDarkMode}
                    photo={profileImg}
                    marquee="Software Engineer"
                    heading="Agentic AI, built with guardrails. Software, built to scale. Security, built in."
                    narrative="I'm a final-year B.Tech Computer Science student (Cybersecurity & Forensics) at UPES Dehradun. I work across generative AI, full-stack development and security automation, and I like knowing what happens from the UI all the way down to the backend. Most recently I was a Software Engineering Intern at Ascendion."
                />

                {/* Bottom half: effects live in FrameEffects.tsx */}
                <TechMarquees />
                <FeatureStage />
                <ProjectsSection repos={repos} status={status} liveCount={liveCount} github={GITHUB} />
                <JourneyTimeline email={EMAIL} emailAddress={EMAIL_ADDRESS} />
                <ContactSection email={EMAIL} emailAddress={EMAIL_ADDRESS} resume={RESUME_PDF} socials={SOCIALS} onTop={() => goTo("top")} />
                <FrameGlobalFx onTop={() => goTo("top")} />
            </main>
        </div>
    );
};

export default FrameDesign;
