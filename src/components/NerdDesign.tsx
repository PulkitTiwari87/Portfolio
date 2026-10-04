import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
    FaBars,
    FaBriefcase,
    FaCode,
    FaEnvelope,
    FaFileAlt,
    FaFolder,
    FaGithub,
    FaHistory,
    FaInstagram,
    FaLinkedinIn,
    FaMoon,
    FaRegFileCode,
    FaSitemap,
    FaSun,
    FaTerminal,
    FaTimes,
    FaUser,
} from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { experiences } from "../data/experience";
import { LANG_COLORS, REPO_META, isFlagship, projectUrl } from "../data/repos";
import { videoFor } from "../data/videos";
import ProjectVideo from "./ui/ProjectVideo";
import { fetchAllRepos } from "../utils/github";
import { GITHUB_PROFILE_URL, loadGitHubYear, loadLeetCodeActivity } from "../utils/activity";
import type { LeetCodeActivity, YearContribution } from "../utils/activity";
import type { Repo } from "../types";
import portraitImg from "../assets/profile-portrait.jpg";

// "NERD": developer-terminal / code-editor portfolio. Layout and palette follow the Stitch screen
// "Developer-Nerd Portfolio (Dual Mode)"; colours are CSS variables switched by the existing isDarkMode flag.
// Effects (each has a prefers-reduced-motion fallback; keyframes live in src/index.css):
//   Reveal            fade-up 10px, ease-in-out 0.3s, once per block, per-block delays (0/100/140/160/180ms)
//   CubeArt           isometric wireframe, one dashed path travelling its own getTotalLength() over 100s
//   Header/MobileMenu overlay slides in from the right (600ms), body scroll lock, X spins -360deg (500ms)
//   ThemeToggle       pulse skeleton before mount, then a button that rotates 180deg (300ms) as the icon swaps
//   Socials           permanent 1px bottom border, icon colour fades on group-hover (300ms)
//   ContributionCard  diagonal pulsing loading wave, year tabs (active = green, click toggles), 13px blocks
//   Experience        2-column grid, 1px connector under each logo tile, green "Present"
//   Projects          border colour changes on hover
//   Global            smooth scroll, grain background, "#" heading anchors, code colour variables
//   Also (Stitch)     SVG dashed card borders (draw-in + marching on hover), typing code window, blinking caret

interface NerdDesignProps {
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
        "--n-bg": "#18181b",
        "--n-surface": "#09090b", // code window / cards
        "--n-bar": "#12131a", // title + tab bars, footer
        "--n-surface2": "#27272a", // button fill
        "--n-hover": "#3f4850",
        "--n-fg": "#e3e1ec",
        "--n-sec": "#bec7d2",
        "--n-muted": "#9d9da8",
        "--n-line": "#27272a",
        "--n-line2": "#3f4850",
        "--n-grid": "rgba(113,113,122,0.08)",
        "--n-blue": "#4ab7ff",
        "--n-green": "#b4f72f",
        "--n-cyan": "#06fafa",
        "--n-purple": "#c26af5",
        "--n-amber": "#ffbd2e",
        "--n-on-accent": "#09090b",
        "--n-kw": "#c26af5",
        "--n-str": "#b4f72f",
        "--n-key": "#97d0ff",
        "--n-var": "#4ab7ff",
        "--n-arr": "#06fafa",
        "--n-op": "#f5a207",
        "--n-l0": "#18181b",
        "--n-l1": "#1d3b20",
        "--n-l2": "#2e672f",
        "--n-l3": "#70b830",
        "--n-l4": "#b4f72f",
    },
    light: {
        "--n-bg": "#ffffff",
        "--n-surface": "#f8fafc",
        "--n-bar": "#f1f5f9",
        "--n-surface2": "#f1f5f9",
        "--n-hover": "#e2e8f0",
        "--n-fg": "#0f172a",
        "--n-sec": "#334155",
        "--n-muted": "#64748b",
        "--n-line": "#cbd5e1",
        "--n-line2": "#94a3b8",
        "--n-grid": "rgba(203,213,225,0.5)",
        "--n-blue": "#0969da",
        "--n-green": "#1a7f37",
        "--n-cyan": "#0550ae",
        "--n-purple": "#8250df",
        "--n-amber": "#bc4c00",
        "--n-on-accent": "#ffffff",
        "--n-kw": "#cf222e",
        "--n-str": "#0a3069",
        "--n-key": "#116329",
        "--n-var": "#953800",
        "--n-arr": "#0550ae",
        "--n-op": "#bc4c00",
        "--n-l0": "#ebedf0",
        "--n-l1": "#9be9a8",
        "--n-l2": "#40c463",
        "--n-l3": "#30a14e",
        "--n-l4": "#216e39",
    },
} as const;

const NAV = [
    { id: "about", label: "About", Icon: FaUser },
    { id: "projects", label: "Projects", Icon: FaCode },
    { id: "journey", label: "Journey", Icon: FaBriefcase },
    { id: "activity", label: "Activity", Icon: FaHistory },
    { id: "contact", label: "Contact", Icon: FaEnvelope },
];

const SOCIALS = [
    { label: "GitHub", href: GITHUB, Icon: FaGithub, hl: "var(--n-fg)" },
    { label: "LinkedIn", href: LINKEDIN, Icon: FaLinkedinIn, hl: "var(--n-blue)" },
    { label: "LeetCode", href: LEETCODE, Icon: SiLeetcode, hl: "var(--n-amber)" },
    { label: "Instagram", href: INSTAGRAM, Icon: FaInstagram, hl: "var(--n-purple)" },
    { label: "Email", href: EMAIL, Icon: FaEnvelope, hl: "var(--n-green)" },
    { label: "Résumé", href: RESUME_PDF, Icon: FaFileAlt, hl: "var(--n-cyan)" },
];

const CHIPS = [
    "Python", "TypeScript", "JavaScript", "Java", "React", "Node.js", "FastAPI", "PostgreSQL", "MongoDB", "Redis",
    "Docker", "AWS Bedrock", "CrewAI", "PyTorch", "XGBoost", "Wazuh", "TheHive", "Burp Suite",
];

const FOCUS = [
    { k: "intelligence", v: "Agentic AI with guardrails: a 3-agent CrewAI pipeline on AWS Bedrock at Ascendion." },
    { k: "scalable", v: "Full-stack products from schema to deploy; an API-first rework cut response time by 25%." },
    { k: "security", v: "SOAR automation with an XGBoost triage model at 92.41% accuracy on 45,000 alerts." },
];

const mono = "font-['JetBrains_Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] tracking-normal";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--n-blue)]";
const card = "rounded border border-[color:var(--n-line)] bg-[var(--n-surface)]";

const prefersReducedMotion = (): boolean =>
    typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const scrollToId = (id: string) => {
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    if (id === "top") window.scrollTo({ top: 0, behavior });
    else document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
};

// ── Syntax highlighting for the hero code window ────────────────────────────

type TokClass = "kw" | "str" | "key" | "var" | "arr" | "ok" | "com" | "pun" | "op" | "txt";
interface Tok {
    t: string;
    c: TokClass;
}

const TOKEN_RE = /(\/\/.*$)|("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|\b(const|export|default|import|from)\b|\b([A-Za-z_]\w*)(?=\s*:)|([{}[\],:;])|(=)|(\s+|\w+|.)/g;

function tokenize(line: string): Tok[] {
    const out: Tok[] = [];
    const isStatus = /^\s*"?status"?\s*:/.test(line);
    let depth = 0;
    for (const m of line.matchAll(TOKEN_RE)) {
        const prevKw = out.length >= 2 && out[out.length - 2].c === "kw" && out[out.length - 2].t === "const";
        if (m[1]) out.push({ t: m[1], c: "com" });
        else if (m[2]) out.push({ t: m[2], c: "key" });
        else if (m[3]) out.push({ t: m[3], c: isStatus ? "ok" : depth > 0 ? "arr" : "str" });
        else if (m[4]) out.push({ t: m[4], c: "kw" });
        else if (m[5]) out.push({ t: m[5], c: "key" });
        else if (m[6]) {
            if (m[6] === "[") depth++;
            if (m[6] === "]") depth--;
            out.push({ t: m[6], c: "pun" });
        } else if (m[7]) out.push({ t: m[7], c: "op" });
        else out.push({ t: m[8], c: prevKw && /^\w+$/.test(m[8]) ? "var" : "txt" });
    }
    return out;
}

const TOK_COLOR: Record<TokClass, string> = {
    kw: "text-[color:var(--n-kw)]",
    str: "text-[color:var(--n-str)]",
    key: "text-[color:var(--n-key)]",
    var: "font-semibold text-[color:var(--n-var)]",
    arr: "text-[color:var(--n-arr)]",
    ok: "font-semibold text-[color:var(--n-green)]",
    com: "italic text-[color:var(--n-muted)]",
    pun: "text-[color:var(--n-sec)]",
    op: "text-[color:var(--n-op)]",
    txt: "text-[color:var(--n-sec)]",
};

const FILES = [
    {
        name: "pulkit.ts",
        ext: "TS",
        lines: [
            "// builds intelligent systems that are hard to break",
            "const pulkit = {",
            '  name: "Pulkit Tiwari",',
            '  role: "Software Developer",',
            '  location: "Dehradun, IN",',
            '  education: "B.Tech CSE @ UPES",',
            '  stack: ["Python", "TypeScript", "React", "Node.js", "AWS"],',
            '  status: "open to opportunities",',
            "};",
            "",
            "export default pulkit;",
        ],
    },
    {
        name: "stack.json",
        ext: "{}",
        lines: [
            "{",
            '  "languages": ["Python", "TypeScript", "JavaScript", "Java"],',
            '  "web": ["React", "Node.js", "FastAPI"],',
            '  "data": ["PostgreSQL", "MongoDB", "Redis"],',
            '  "ai": ["PyTorch", "XGBoost", "CrewAI", "AWS Bedrock"],',
            '  "infra": ["Docker", "AWS", "Azure Blob Storage"]',
            "}",
        ],
    },
].map((f) => {
    const lines = f.lines.map(tokenize);
    const total = f.lines.reduce((n, l) => n + l.length + 1, 0);
    return { name: f.name, ext: f.ext, lines, total };
});

// ── Small building blocks ────────────────────────────────────────────────────

// Fade up 10px on first entering the viewport (once). Delay in ms.
const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(() => prefersReducedMotion() || typeof IntersectionObserver === "undefined");

    useEffect(() => {
        if (shown) return;
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold: 0, rootMargin: "0px 0px -8% 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [shown]);

    return (
        <div ref={ref} data-in={shown} className={`nerd-reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
            {children}
        </div>
    );
};

// SVG overlay for a card border: an accent stroke that draws itself once (pathLength=1, dashoffset 1 -> 0, on mount
// or when the enclosing Reveal scrolls in) plus accent px-dashes whose dashoffset marches on hover/focus of
// the .nerd-dashbox parent (or always, with `always`).
const DashFrame: React.FC<{ radius?: number; always?: boolean; now?: boolean }> = ({ radius = 2, always = false, now = false }) => (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible">
        <rect
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            rx={radius}
            fill="none"
            stroke="var(--n-blue)"
            strokeWidth="1"
            strokeDasharray="6 6"
            vectorEffect="non-scaling-stroke"
            className={`nerd-hoverdash ${always ? "nerd-hoverdash-always" : ""}`}
        />
        <rect
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            rx={radius}
            pathLength={1}
            fill="none"
            stroke="var(--n-green)"
            strokeWidth="1.5"
            strokeDasharray="1"
            className={`nerd-drawin ${now ? "nerd-drawin-now" : ""}`}
        />
    </svg>
);

const SectionHead: React.FC<{ icon: React.ReactNode; title: React.ReactNode; right?: React.ReactNode }> = ({ icon, title, right }) => (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[color:var(--n-line)] pb-2.5">
        <h2 className={`${mono} nerd-anchor flex items-center gap-2.5 text-sm font-semibold tracking-wider uppercase`}>
            <span className="text-[color:var(--n-blue)]" aria-hidden="true">
                {icon}
            </span>
            {title}
        </h2>
        {right && <p className={`${mono} text-[11px] tracking-wider text-[color:var(--n-muted)]`}>{right}</p>}
    </div>
);

// Isometric wireframe: one dashed path (dash pattern travels the path's own length over 100s) + 6 static nodes.
const CUBE_D =
    "M274.6 557.5L274.6 696.7L395.3 766.4L395.3 627.1L515.9 696.7L515.9 836.0L636.5 766.4L636.5 627.1L515.9 696.7L636.5 766.4L757.1 836.0L757.1 696.7L757.1 557.5L877.7 627.1L877.7 487.8L877.7 348.5L757.1 418.2L636.5 487.8L515.9 418.2L515.9 278.9L636.5 348.5L757.1 418.2L877.7 487.8L757.1 557.5L757.1 418.2L757.1 278.9L636.5 348.5L515.9 418.2L395.3 487.8L274.6 557.5L395.3 627.1L515.9 557.5L395.3 487.8L395.3 627.1M395.3 348.5L395.3 487.8M395.3 348.5L515.9 278.9L515.9 139.6L636.5 70.0L757.1 139.6L636.5 209.3L636.5 348.5L636.5 487.8L636.5 627.1L757.1 696.7L636.5 766.4M395.3 348.5L515.9 418.2L515.9 557.5L515.9 696.7L395.3 766.4L515.9 836.0M515.9 139.6L636.5 209.3L515.9 278.9M515.9 557.5L636.5 487.8L757.1 557.5L636.5 627.1L515.9 557.5M636.5 209.3L757.1 278.9L757.1 139.6M757.1 278.9L877.7 348.5M757.1 696.7L877.7 627.1L998.4 557.5L877.7 487.8M757.1 696.7L877.7 766.4L877.7 627.1M757.1 836.0L877.7 766.4L998.4 696.7L998.4 557.5";
const CUBE_NODES: [number, number][] = [
    [274.6, 557.5],
    [515.9, 139.6],
    [757.1, 139.6],
    [877.7, 348.5],
    [998.4, 696.7],
    [636.5, 766.4],
];

const CubeArt: React.FC = () => {
    const pathRef = useRef<SVGPathElement>(null);
    useEffect(() => {
        const el = pathRef.current;
        if (el) el.style.setProperty("--nerd-len", String(el.getTotalLength()));
    }, []);
    return (
        <svg viewBox="0 0 1273 906" fill="none" aria-hidden="true" className="mx-auto h-auto w-full max-w-[460px]">
            <defs>
                <linearGradient id="nerd-cube-grad" gradientUnits="userSpaceOnUse" x1="1272" y1="479" x2="506" y2="-216">
                    <stop offset="0" style={{ stopColor: "var(--n-green)" }} />
                    <stop offset="0.62" style={{ stopColor: "color-mix(in oklab, var(--n-green) 45%, var(--n-bg))" }} />
                    <stop offset="0.93" style={{ stopColor: "var(--n-line2)" }} />
                </linearGradient>
            </defs>
            <path ref={pathRef} className="nerd-cube-path" d={CUBE_D} stroke="url(#nerd-cube-grad)" strokeOpacity="0.6" strokeWidth="2" />
            {CUBE_NODES.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="7" style={{ fill: "var(--n-green)" }} />
            ))}
        </svg>
    );
};

const ThemeToggle: React.FC<{ isDarkMode: boolean; toggleTheme: () => void; className: string }> = ({ isDarkMode, toggleTheme, className }) => {
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
    if (!mounted) return <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--n-surface2)]" aria-hidden="true" />;
    return (
        <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className={`${className} rounded-full transition-transform duration-300 ${isDarkMode ? "rotate-0" : "-rotate-180"}`}
        >
            {isDarkMode ? <FaMoon /> : <FaSun />}
        </button>
    );
};

// ── Hero code editor (types itself in) ───────────────────────────────────────

const CodeWindow: React.FC = () => {
    const [tab, setTab] = useState(0);
    const [typed, setTyped] = useState(() => (prefersReducedMotion() ? FILES[0].total : 0));

    const typing = typed < FILES[0].total;
    useEffect(() => {
        if (!typing) return;
        const id = window.setInterval(() => setTyped((n) => Math.min(FILES[0].total, n + 2)), 24);
        return () => window.clearInterval(id);
    }, [typing]);

    const file = FILES[tab];
    const count = tab === 0 ? typed : file.total;
    const done = count >= file.total;

    let offset = 0;
    let cursorPlaced = false;
    const rows = file.lines.map((toks, li) => {
        const cells = toks.map((tok, ti) => {
            const start = offset;
            offset += tok.t.length;
            const shown = Math.max(0, Math.min(tok.t.length, count - start));
            const hereCursor = !cursorPlaced && start + tok.t.length >= Math.min(count, file.total - 1); // caret rests on the last token once done
            if (hereCursor) cursorPlaced = true;
            return (
                <span key={ti} className={TOK_COLOR[tok.c]}>
                    {tok.t.slice(0, shown)}
                    {hereCursor && (
                        <span
                            aria-hidden="true"
                            className={`inline-block h-[1.15em] w-[2px] translate-y-[3px] bg-[color:var(--n-green)] ${done ? "animate-nerd-blink" : ""}`}
                        />
                    )}
                    <span className="invisible">{tok.t.slice(shown)}</span>
                </span>
            );
        });
        offset += 1; // newline
        return (
            <div key={li} className="flex">
                <span className="mr-4 w-9 shrink-0 select-none border-r border-[color:var(--n-line)] pr-3 text-right text-[color:var(--n-muted)] opacity-70">
                    {String(li + 1).padStart(2, "0")}
                </span>
                <span className="whitespace-pre">{cells.length ? cells : "​"}</span>
            </div>
        );
    });

    return (
        <div className="nerd-dashbox relative h-full">
            <DashFrame always now />
            <div className={`${card} flex h-full flex-col overflow-hidden`}>
                <div className="flex items-center justify-between gap-3 border-b border-[color:var(--n-line)] bg-[var(--n-bar)] px-3 py-1.5">
                    <div role="tablist" aria-label="Files" className="flex gap-1">
                        {FILES.map((f, i) => (
                            <button
                                key={f.name}
                                role="tab"
                                aria-selected={tab === i}
                                onClick={() => setTab(i)}
                                className={`${mono} flex items-center gap-2 border-t-2 px-3 py-1 text-[11px] font-medium tracking-wide transition-colors ${focusRing} ${
                                    tab === i
                                        ? "border-[color:var(--n-blue)] bg-[var(--n-surface)] text-[color:var(--n-fg)]"
                                        : "border-transparent text-[color:var(--n-muted)] hover:text-[color:var(--n-fg)]"
                                }`}
                            >
                                <b className="text-[color:var(--n-blue)]">{f.ext}</b>
                                {f.name}
                            </button>
                        ))}
                    </div>
                    <span className={`${mono} hidden text-[11px] tracking-wide text-[color:var(--n-muted)] sm:block`}>src &gt; profile</span>
                </div>
                <pre
                    key={tab}
                    aria-label={`${file.name} source`}
                    className={`${mono} m-0 flex-1 overflow-x-auto bg-transparent p-4 text-[12.5px] leading-6 sm:text-[13px] ${tab === 1 ? "animate-nerd-fade" : ""}`}
                >
                    {rows}
                </pre>
                <div className={`${mono} flex items-center justify-between border-t border-[color:var(--n-line)] bg-[var(--n-bar)] px-4 py-1.5 text-[11px] text-[color:var(--n-muted)]`}>
                    <span>
                        <span className="text-[color:var(--n-green)]">●</span> {done ? "ready" : "typing…"}
                    </span>
                    <span>UTF-8 · LF · {tab === 0 ? "TypeScript" : "JSON"}</span>
                </div>
            </div>
        </div>
    );
};

// ── Contribution graph ───────────────────────────────────────────────────────

const LEVEL_VAR = ["var(--n-l0)", "var(--n-l1)", "var(--n-l2)", "var(--n-l3)", "var(--n-l4)"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BLOCK = 13; // px, as the reference's blockSize
const dateLabel = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

interface Tip {
    left: number;
    top: number;
    text: string;
}

const gridStyle = (weeks: number): React.CSSProperties => ({
    gridTemplateColumns: `24px repeat(${weeks}, ${BLOCK}px)`,
    gridTemplateRows: `14px repeat(7, ${BLOCK}px)`,
});

// Loading placeholder: blocks pulse in a diagonal wave (delay = 20ms * (column + row)).
const HeatmapSkeleton: React.FC = () => (
    <div className="grid w-max gap-1" style={gridStyle(53)} role="status" aria-label="Loading contributions">
        {Array.from({ length: 53 * 7 }, (_, i) => {
            const col = Math.floor(i / 7);
            const row = i % 7;
            return (
                <span
                    key={i}
                    className="nerd-wave rounded-[2px]"
                    style={{ gridColumn: col + 2, gridRow: row + 2, animationDelay: `${20 * (col + row)}ms` }}
                />
            );
        })}
    </div>
);

const YearHeatmap: React.FC<{ days: YearContribution[]; onTip: (t: Tip | null) => void; cardRef: React.RefObject<HTMLDivElement | null> }> = ({
    days,
    onTip,
    cardRef,
}) => {
    const today = new Date().toISOString().slice(0, 10);
    const pad = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;
    const weeks = Math.ceil((pad + days.length) / 7);

    const show = (e: React.SyntheticEvent<HTMLElement>, d: YearContribution) => {
        const el = cardRef.current;
        if (!el) return;
        const r = e.currentTarget.getBoundingClientRect();
        const c = el.getBoundingClientRect();
        const n = d.count;
        onTip({
            left: r.left - c.left + r.width / 2,
            top: r.top - c.top,
            text: `${n === 0 ? "No contributions" : `${n} contribution${n === 1 ? "" : "s"}`} on ${dateLabel(d.date)}`,
        });
    };

    return (
        <div
            role="img"
            aria-label={`GitHub contribution heatmap, ${days.reduce((a, d) => a + (d.date <= today ? d.count : 0), 0)} contributions`}
            className="grid w-max gap-1"
            style={gridStyle(weeks)}
        >
            {[1, 3, 5].map((w) => (
                <span key={w} className={`${mono} sticky left-0 z-[1] flex items-center bg-[var(--n-surface)] text-[9px] leading-none text-[color:var(--n-muted)]`} style={{ gridColumn: 1, gridRow: w + 2 }}>
                    {["", "Mon", "", "Wed", "", "Fri", ""][w]}
                </span>
            ))}
            {days.map((d, i) => {
                const idx = pad + i;
                const col = Math.floor(idx / 7) + 2;
                const row = (idx % 7) + 2;
                const future = d.date > today;
                const month =
                    d.date.slice(8) === "01" || i === 0 ? (
                        <span
                            key={`m${d.date}`}
                            className={`${mono} pointer-events-none whitespace-nowrap text-[10px] leading-none text-[color:var(--n-muted)]`}
                            style={{ gridColumn: col, gridRow: 1 }}
                        >
                            {MONTHS[Number(d.date.slice(5, 7)) - 1]}
                        </span>
                    ) : null;
                return (
                    <React.Fragment key={d.date}>
                        {month}
                        <span
                            onMouseEnter={(e) => show(e, d)}
                            onMouseLeave={() => onTip(null)}
                            className={`rounded-[2px] transition-transform duration-150 hover:scale-125 hover:outline hover:outline-1 hover:outline-[color:var(--n-fg)] ${future ? "opacity-30" : ""}`}
                            style={{ gridColumn: col, gridRow: row, background: LEVEL_VAR[d.level] }}
                        />
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const yearStats = (days: YearContribution[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const past = days.filter((d) => d.date <= today);
    let run = 0;
    let longest = 0;
    let busiest: YearContribution | null = null;
    for (const d of past) {
        run = d.count > 0 ? run + 1 : 0;
        longest = Math.max(longest, run);
        if (d.count > 0 && (!busiest || d.count > busiest.count)) busiest = d;
    }
    return {
        total: past.reduce((a, d) => a + d.count, 0),
        active: past.filter((d) => d.count > 0).length,
        longest,
        busiest,
    };
};

const ContributionCard: React.FC = () => {
    const thisYear = new Date().getFullYear();
    const years = [thisYear, thisYear - 1, thisYear - 2];
    const [sel, setSel] = useState(0); // index into years; -1 = rolling last 12 months (click the active tab again)
    const [data, setData] = useState<Record<string, YearContribution[] | "error">>({});
    const [retry, setRetry] = useState(0);
    const [tip, setTip] = useState<Tip | null>(null);
    const [lc, setLc] = useState<LeetCodeActivity | "error" | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const key = sel >= 0 ? String(years[sel]) : "last";
    const label = sel >= 0 ? `in ${years[sel]}` : "in the last 12 months";

    useEffect(() => {
        let alive = true;
        loadGitHubYear(key === "last" ? "last" : Number(key))
            .then((d) => alive && setData((p) => ({ ...p, [key]: d })))
            .catch(() => alive && setData((p) => ({ ...p, [key]: "error" })));
        return () => {
            alive = false;
        };
    }, [key, retry]);

    useEffect(() => {
        let alive = true;
        loadLeetCodeActivity()
            .then((a) => alive && setLc(a))
            .catch(() => alive && setLc("error"));
        return () => {
            alive = false;
        };
    }, []);

    const current = data[key];
    const ready = Array.isArray(current);

    // Open scrolled to "today" on narrow screens (current year / rolling view).
    useEffect(() => {
        const el = scrollRef.current;
        if (el && ready && sel <= 0) el.scrollLeft = el.scrollWidth;
    }, [ready, sel]);

    const stats = ready ? yearStats(current) : null;
    const solvedAll = lc && lc !== "error" ? lc.solved.find((s) => s.difficulty === "All")?.solved : undefined;

    return (
        <div ref={cardRef} className="nerd-dashbox relative">
            <DashFrame />
            <div className={`${card} relative space-y-3 bg-[var(--n-surface)]/70 p-4 backdrop-blur-sm sm:p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--n-line)] pb-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                        <FaHistory className="text-[color:var(--n-green)]" aria-hidden="true" />
                        <span className={`${mono} text-[13px] text-[color:var(--n-blue)]`}>$ git log --graph --oneline</span>
                        {stats && (
                            <span className={`${mono} text-[11px] text-[color:var(--n-muted)]`}>
                                ({stats.total} contributions {label})
                            </span>
                        )}
                    </div>

                    <div role="tablist" aria-label="Year" className="relative grid w-56 grid-cols-3 rounded bg-[var(--n-surface2)] p-0.5">
                        <span
                            aria-hidden="true"
                            className={`absolute top-0.5 bottom-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-[2px] bg-[var(--n-green)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                sel < 0 ? "opacity-0" : ""
                            }`}
                            style={{ transform: `translateX(${Math.max(sel, 0) * 100}%)` }}
                        />
                        {years.map((y, i) => (
                            <button
                                key={y}
                                role="tab"
                                aria-selected={sel === i}
                                title={sel === i ? "Show the last 12 months" : `View graph for the year ${y}`}
                                onClick={() => {
                                    setTip(null);
                                    setSel(sel === i ? -1 : i);
                                }}
                                className={`${mono} relative z-10 rounded-[2px] py-1 text-[11px] transition-colors ${focusRing} ${
                                    sel === i ? "font-bold text-[color:var(--n-on-accent)]" : "text-[color:var(--n-muted)] hover:text-[color:var(--n-fg)]"
                                }`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </div>

                <div ref={scrollRef} className="overflow-x-auto py-2">
                    {ready ? (
                        <div key={key} className="animate-nerd-fade">
                            <YearHeatmap days={current} onTip={setTip} cardRef={cardRef} />
                        </div>
                    ) : current === "error" ? (
                        <p className={`${mono} py-12 text-center text-sm text-[color:var(--n-muted)]`}>
                            Couldn't load the contribution calendar.{" "}
                            <button onClick={() => setRetry((r) => r + 1)} className="underline hover:text-[color:var(--n-blue)]">
                                Retry
                            </button>
                        </p>
                    ) : (
                        <HeatmapSkeleton />
                    )}
                </div>

                <div className={`${mono} flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-[11px] text-[color:var(--n-muted)]`}>
                    <p className="flex flex-wrap gap-x-5 gap-y-1">
                        <a
                            href={GITHUB_PROFILE_URL}
                            target="_blank"
                            rel="noreferrer"
                            className={`transition-colors hover:text-[color:var(--n-blue)] ${focusRing}`}
                        >
                            github.com/PulkitTiwari87 ↗
                        </a>
                        {stats && (
                            <>
                                <span>
                                    <b className="font-semibold text-[color:var(--n-fg)]">{stats.active}</b> active days
                                </span>
                                <span>
                                    <b className="font-semibold text-[color:var(--n-fg)]">{stats.longest}</b>-day longest streak
                                </span>
                                {stats.busiest && (
                                    <span>
                                        busiest <b className="font-semibold text-[color:var(--n-fg)]">{stats.busiest.count}</b> on {dateLabel(stats.busiest.date)}
                                    </span>
                                )}
                            </>
                        )}
                    </p>
                    <span className="flex items-center gap-1.5">
                        Less
                        {LEVEL_VAR.map((c, i) => (
                            <span key={i} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} aria-hidden="true" />
                        ))}
                        More
                    </span>
                </div>

                {/* LeetCode: last 30 days */}
                <div className="border-t border-[color:var(--n-line)] pt-4">
                    <div className={`${mono} mb-3 flex flex-wrap items-baseline justify-between gap-2 text-xs`}>
                        <a
                            href={LEETCODE}
                            target="_blank"
                            rel="noreferrer"
                            className={`font-semibold transition-colors hover:text-[color:var(--n-amber)] ${focusRing}`}
                        >
                            <span className="text-[color:var(--n-amber)]">$</span> leetcode --last 30d ↗
                        </a>
                        {lc && lc !== "error" && (
                            <span className="text-[color:var(--n-muted)]">
                                <b className="font-semibold text-[color:var(--n-fg)]">{lc.total}</b> submissions ·{" "}
                                <b className="font-semibold text-[color:var(--n-fg)]">{lc.activeDays}</b> active days
                                {solvedAll !== undefined && (
                                    <>
                                        {" "}
                                        · <b className="font-semibold text-[color:var(--n-fg)]">{solvedAll}</b> solved
                                    </>
                                )}
                            </span>
                        )}
                    </div>
                    {lc && lc !== "error" ? (
                        <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1" role="img" aria-label="LeetCode submissions, last 30 days">
                            {lc.days.map((d) => (
                                <span
                                    key={d.date}
                                    title={`${d.count} submission${d.count === 1 ? "" : "s"} on ${dateLabel(d.date)}`}
                                    className="h-5 rounded-[2px] transition-transform hover:scale-y-125"
                                    style={{
                                        background:
                                            d.level === 0
                                                ? "var(--n-l0)"
                                                : `color-mix(in oklab, var(--n-amber) ${d.level * 25}%, var(--n-l0))`,
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className={`h-5 rounded-[2px] ${lc === "error" ? "" : "animate-pulse"} bg-[var(--n-surface2)]`}
                            aria-label={lc === "error" ? "LeetCode data unavailable" : "Loading LeetCode activity"}
                        />
                    )}
                    {lc === "error" && <p className={`${mono} mt-2 text-[11px] text-[color:var(--n-muted)]`}>LeetCode activity is unavailable right now.</p>}
                </div>

                {tip && (
                    <div
                        role="tooltip"
                        className={`${mono} pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded border border-[color:var(--n-line2)] bg-[var(--n-bg)] px-2.5 py-1.5 text-[11px] shadow-lg`}
                        style={{ left: tip.left, top: tip.top }}
                    >
                        {tip.text}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Experience helpers ───────────────────────────────────────────────────────

const TILE_ACCENTS = ["var(--n-blue)", "var(--n-green)", "var(--n-purple)", "var(--n-cyan)", "var(--n-amber)"];

function monogram(company: string): string {
    const name = company.split(/[,(]/)[0].trim();
    const words = name.split(/\s+/).filter(Boolean);
    const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
    return letters.toUpperCase();
}

const bullets = (d: string) =>
    d
        .split("\n")
        .map((l) => l.replace(/^•\s*/, "").trim())
        .filter(Boolean);

// Numbers and percentages (the key metrics) get the accent colour.
const Metrics: React.FC<{ text: string }> = ({ text }) => (
    <>
        {text.split(/(\d[\d,.]*\+?%?)/).map((part, i) =>
            i % 2 === 1 ? (
                <b key={i} className="font-semibold text-[color:var(--n-blue)]">
                    {part}
                </b>
            ) : (
                part
            )
        )}
    </>
);

// Date range; a trailing "Present" is highlighted green.
const DateRange: React.FC<{ value: string; recent: boolean }> = ({ value, recent }) => (
    <p className={`${mono} text-[11px] tracking-widest uppercase ${recent ? "font-semibold text-[color:var(--n-green)]" : "text-[color:var(--n-muted)]"}`}>
        {value.split(/(Present)/).map((part, i) =>
            part === "Present" ? (
                <span key={i} className="text-[color:var(--n-green)]">
                    {part}
                </span>
            ) : (
                part
            )
        )}
    </p>
);

const Prompt: React.FC = () => (
    <span className="select-none">
        <span className="text-[color:var(--n-green)]">pulkit@portfolio</span>
        <span className="text-[color:var(--n-muted)]">:</span>
        <span className="text-[color:var(--n-blue)]">~</span>
        <span className="text-[color:var(--n-fg)]">$ </span>
    </span>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const NerdDesign: React.FC<NerdDesignProps> = ({ isDarkMode, toggleTheme, onExit }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState("");
    const [repos, setRepos] = useState<Repo[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [showAll, setShowAll] = useState(false);
    const [openExp, setOpenExp] = useState<number | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAllRepos()
            .then((r) => {
                setRepos(r);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    }, []);

    // Smooth scrolling while this page is mounted (skipped for reduced motion).
    useEffect(() => {
        if (prefersReducedMotion()) return;
        const html = document.documentElement;
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "smooth";
        return () => {
            html.style.scrollBehavior = prev;
        };
    }, []);

    // Mobile menu open: lock body scroll, restore on close/unmount.
    useEffect(() => {
        if (!menuOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    // Frosted nav after scrolling + active section that follows the scroll position.
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 12);
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) setActive("contact");
            else if (window.scrollY < 120) setActive("");
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        let io: IntersectionObserver | undefined;
        if (typeof IntersectionObserver !== "undefined") {
            io = new IntersectionObserver(
                (entries) => {
                    for (const e of entries) if (e.isIntersecting && window.scrollY >= 120) setActive(e.target.id);
                },
                { rootMargin: "-45% 0px -50% 0px" }
            );
            NAV.forEach((n) => {
                const el = document.getElementById(n.id);
                if (el) io?.observe(el);
            });
        }
        return () => {
            window.removeEventListener("scroll", onScroll);
            io?.disconnect();
        };
    }, []);

    const goTo = (id: string) => {
        setMenuOpen(false);
        scrollToId(id);
    };

    const visible = showAll ? repos : repos.slice(0, 8);
    const liveCount = repos.filter((r) => r.homepage?.trim()).length;
    const theme = isDarkMode ? THEMES.dark : THEMES.light;

    const linkHover = "transition-colors hover:text-[color:var(--n-blue)]";
    const iconBtn = `flex h-8 w-8 items-center justify-center border border-[color:var(--n-line)] bg-[var(--n-surface2)] text-sm text-[color:var(--n-blue)] transition-colors hover:bg-[var(--n-hover)] active:scale-95 ${focusRing}`;

    return (
        <div
            style={{
                ...(theme as React.CSSProperties),
                backgroundImage: "linear-gradient(var(--n-grid) 1px, transparent 1px), linear-gradient(90deg, var(--n-grid) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
            }}
            className="nerd-root min-h-screen overflow-x-hidden bg-[var(--n-bg)] font-sans text-[color:var(--n-fg)] antialiased selection:bg-[var(--n-green)] selection:text-[color:var(--n-on-accent)]"
        >
            {/* Nav */}
            <header
                className={`fixed top-0 left-0 z-50 w-full border-b transition-[background-color,backdrop-filter,border-color] duration-300 ${
                    scrolled ? "border-[color:var(--n-line)] bg-[var(--n-bar)]/80 backdrop-blur-xl" : "border-transparent bg-transparent"
                }`}
            >
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <button
                        onClick={() => goTo("top")}
                        aria-label="Pulkit Tiwari, back to top"
                        className={`${mono} text-lg font-bold text-[color:var(--n-green)] transition-colors hover:text-[color:var(--n-blue)] ${focusRing}`}
                    >
                        &lt;PT /&gt;
                    </button>

                    <nav aria-label="NERD sections" className="hidden items-center gap-6 md:flex">
                        {NAV.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => goTo(n.id)}
                                aria-current={active === n.id ? "true" : undefined}
                                className={`${mono} group relative py-2 text-[13px] font-semibold tracking-wide transition-colors duration-300 ${focusRing} ${
                                    active === n.id ? "text-[color:var(--n-green)]" : "text-[color:var(--n-sec)] hover:text-[color:var(--n-green)]"
                                }`}
                            >
                                {n.label}
                                <span
                                    aria-hidden="true"
                                    className={`absolute inset-x-0 bottom-0.5 h-0.5 origin-left bg-[var(--n-green)] transition-transform duration-300 ease-out ${
                                        active === n.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
                                    }`}
                                />
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <span
                            className={`${mono} hidden items-center gap-2 rounded border border-[color:var(--n-line)] bg-[var(--n-surface)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--n-green)] lg:flex`}
                        >
                            <span className="relative flex h-2 w-2" aria-hidden="true">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--n-green)] opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--n-green)]" />
                            </span>
                            Open to opportunities
                        </span>
                        <button onClick={onExit} aria-label="Back to portfolio" title="Back to portfolio" className={`${iconBtn} rounded`}>
                            <FaTerminal />
                        </button>
                        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} className={iconBtn} />
                        <button
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={menuOpen}
                            className={`flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--n-line)] bg-[var(--n-surface2)]/60 md:hidden ${focusRing}`}
                        >
                            <FaBars />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile menu: slides in from the right */}
            <div
                id="nerd-mobile-menu"
                inert={!menuOpen}
                aria-hidden={!menuOpen}
                className={`fixed inset-0 z-[60] w-full bg-[var(--n-bg)] transition-transform duration-[600ms] ease-[cubic-bezier(0.7,0,0,1)] md:hidden ${
                    menuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex h-14 items-center justify-between px-4 sm:px-6">
                    <span className={`${mono} text-lg font-bold text-[color:var(--n-green)]`}>&lt;PT /&gt;</span>
                    <button
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                        className={`rounded-full border border-[color:var(--n-line)] bg-[var(--n-surface2)]/60 p-2 transition-transform duration-500 ${menuOpen ? "" : "-rotate-[360deg]"} ${focusRing}`}
                    >
                        <FaTimes />
                    </button>
                </div>
                <nav aria-label="NERD sections (mobile)" className="mt-4 px-4">
                    {NAV.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            onClick={() => goTo(id)}
                            className={`${mono} group flex w-full items-center gap-x-3 border-b border-[color:var(--n-line)] p-5 text-left text-lg font-semibold ${
                                active === id ? "text-[color:var(--n-green)]" : ""
                            }`}
                        >
                            <Icon className="text-[color:var(--n-muted)] transition-colors duration-300 group-hover:text-[color:var(--n-fg)]" aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                    <button
                        onClick={onExit}
                        className={`${mono} group flex w-full items-center gap-x-3 p-5 text-left text-lg font-semibold text-[color:var(--n-muted)]`}
                    >
                        <FaTerminal aria-hidden="true" />‹ Portfolio
                    </button>
                </nav>
            </div>

            <main className="animate-nerd-enter relative z-[1]">
                {/* Hero */}
                <section id="top">
                    <div className="mx-auto max-w-7xl px-4 pt-24 pb-14 sm:px-6 md:pt-28 md:pb-20">
                        <div className="grid grid-cols-1 items-center gap-8 xl:grid-cols-12 xl:gap-12">
                            <div className="min-w-0 xl:col-span-7">
                                <Reveal>
                                    <h1 className={`${mono} text-[clamp(28px,4.2vw,50px)] leading-[1.15] font-bold tracking-tight`}>
                                        Software developer who builds{" "}
                                        <span className="text-[color:var(--n-blue)] underline decoration-[var(--n-blue)]/40 decoration-2 underline-offset-4">
                                            intelligent systems
                                        </span>{" "}
                                        that are <span className="text-[color:var(--n-green)]">hard to break.</span>
                                    </h1>
                                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--n-sec)] sm:text-lg">
                                        Final-year B.Tech Computer Science student (Cybersecurity &amp; Forensics) at UPES Dehradun, working across generative AI,
                                        full-stack development and security automation.
                                    </p>
                                </Reveal>
                                <Reveal delay={100}>
                                    <ul className="my-8 flex flex-wrap gap-x-5 gap-y-4">
                                        {SOCIALS.map(({ label, href, Icon, hl }) => (
                                            <li key={label}>
                                                <a
                                                    href={href}
                                                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                                                    rel="noreferrer"
                                                    style={{ "--hl": hl } as React.CSSProperties}
                                                    className={`group flex items-center gap-2 border-b border-[color:var(--n-line2)] pb-0.5 text-sm transition-colors duration-300 hover:border-[color:var(--hl)] ${focusRing}`}
                                                >
                                                    <Icon
                                                        className="shrink-0 text-lg text-[color:var(--n-muted)] transition-colors duration-300 group-hover:text-[color:var(--hl)]"
                                                        aria-hidden="true"
                                                    />
                                                    {label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </Reveal>
                            </div>
                            <Reveal delay={140} className="min-w-0 xl:col-span-5">
                                <CubeArt />
                            </Reveal>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
                            <Reveal delay={180} className="min-w-0 lg:col-span-7">
                                <CodeWindow />
                            </Reveal>
                            <Reveal delay={180} className="min-w-0 lg:col-span-5">
                                <figure className={`${card} group h-full p-3`}>
                                    <div className="relative overflow-hidden rounded border border-[color:var(--n-line2)]">
                                        <img
                                            src={portraitImg}
                                            alt="Portrait of Pulkit Tiwari"
                                            className="h-80 w-full object-cover object-[50%_30%] transition-all duration-300 group-hover:scale-105 dark:contrast-125 dark:grayscale dark:group-hover:scale-100 dark:group-hover:grayscale-0"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--n-blue)]/5 to-transparent" aria-hidden="true" />
                                        <figcaption
                                            className={`${mono} absolute top-2 left-2 flex items-center gap-1.5 rounded border border-[color:var(--n-blue)]/40 bg-[var(--n-bg)]/90 px-2 py-1 text-[10px] font-medium tracking-wider text-[color:var(--n-blue)]`}
                                        >
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--n-green)]" aria-hidden="true" />
                                            PULKIT.TIWARI // DEHRADUN
                                        </figcaption>
                                        <span
                                            className={`${mono} absolute right-2 bottom-2 rounded border border-[color:var(--n-green)]/50 bg-[var(--n-surface)]/85 px-2 py-1 text-[10px] font-medium tracking-wider text-[color:var(--n-green)]`}
                                        >
                                            B.TECH CSE · UPES
                                        </span>
                                    </div>
                                </figure>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* About */}
                <section id="about" className="scroll-mt-16">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
                        <Reveal delay={160}>
                            <SectionHead icon={<FaUser />} title="About" right="who, what, where" />
                        </Reveal>
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
                            <Reveal delay={180}>
                                <p className="max-w-2xl text-lg leading-relaxed">
                                    I'm Pulkit, based in Dehradun, India. I like knowing what happens from the UI all the way down to the backend, and I care about
                                    systems that keep working when something goes wrong.
                                </p>
                                <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--n-sec)]">
                                    Most recently I was a Software Engineering Intern at Ascendion, building multi-agent GenAI workflows and the guardrail agent that
                                    checks them. Outside work I led a 30+ member team at the UPES Cloud Security Alliance chapter.
                                </p>
                                <ul className="mt-8 space-y-3">
                                    {FOCUS.map((f) => (
                                        <li key={f.k} className="flex gap-3 text-sm leading-relaxed">
                                            <span className={`${mono} w-24 shrink-0 text-[color:var(--n-purple)]`}>{f.k}</span>
                                            <span className="text-[color:var(--n-sec)]">{f.v}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                            <Reveal delay={180}>
                                <p className={`${mono} mb-4 text-xs text-[color:var(--n-muted)]`}>{"// tools I reach for"}</p>
                                <ul className="flex flex-wrap gap-2">
                                    {CHIPS.map((c, i) => (
                                        <li
                                            key={c}
                                            style={{ "--hl": TILE_ACCENTS[i % TILE_ACCENTS.length] } as React.CSSProperties}
                                            className={`${mono} cursor-default rounded border border-[color:var(--n-line)] bg-[var(--n-surface)] px-3 py-1.5 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--hl)] hover:text-[color:var(--hl)]`}
                                        >
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* Projects */}
                <section id="projects" className="scroll-mt-16">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
                        <Reveal delay={160}>
                            <SectionHead
                                icon={<FaSitemap />}
                                title={
                                    <>
                                        ~/projects <span className="text-[color:var(--n-cyan)]">$ tree -L 2</span>
                                    </>
                                }
                                right={status === "ready" ? `${repos.length} repositories indexed · ${liveCount} live` : undefined}
                            />
                        </Reveal>
                        <Reveal delay={180}>
                            <div className="nerd-dashbox relative">
                                <DashFrame />
                                <div className={`${card} ${mono} p-3 text-[13px] leading-relaxed sm:p-4`}>
                                    {status === "loading" && <p className="px-2 py-8 text-[color:var(--n-muted)]">Loading projects…</p>}
                                    {status === "error" && (
                                        <p className="px-2 py-8 text-[color:var(--n-muted)]">
                                            Couldn't reach GitHub right now.{" "}
                                            <a href={GITHUB} target="_blank" rel="noreferrer" className="underline hover:text-[color:var(--n-blue)]">
                                                View on GitHub ↗
                                            </a>
                                        </p>
                                    )}
                                    <ul className="space-y-1">
                                        {visible.map((repo, i) => {
                                            const meta = REPO_META[repo.name];
                                            const title = meta?.displayName ?? repo.name.replace(/[_-]/g, " ");
                                            const desc = meta?.description ?? repo.description ?? "A project by Pulkit Tiwari.";
                                            const live = !!repo.homepage?.trim();
                                            const video = videoFor(repo.name);
                                            const folder = isFlagship(repo);
                                            const Icon = folder ? FaFolder : FaRegFileCode;
                                            const lang = repo.language ? (LANG_COLORS[repo.language] ?? "var(--n-muted)") : "var(--n-muted)";
                                            return (
                                                <li
                                                    key={repo.id}
                                                    className="group relative flex flex-col justify-between gap-2 rounded border border-transparent p-1.5 pl-2 transition-colors duration-200 hover:border-[color:var(--n-line2)] hover:bg-[var(--n-bg)] sm:flex-row sm:items-start"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                            <span className="select-none text-[color:var(--n-muted)]" aria-hidden="true">
                                                                {i === visible.length - 1 ? "└──" : "├──"}
                                                            </span>
                                                            <Icon
                                                                aria-hidden="true"
                                                                className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${folder ? "text-[color:var(--n-blue)]" : "text-[color:var(--n-muted)]"}`}
                                                            />
                                                            <a
                                                                href={projectUrl(repo)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                title={live ? "Open live site" : "Open on GitHub"}
                                                                style={{ color: `color-mix(in oklab, ${lang} 65%, var(--n-fg))` }}
                                                                className={`font-semibold after:absolute after:inset-0 hover:underline ${focusRing}`}
                                                            >
                                                                {title}
                                                                {folder ? "/" : ""}
                                                            </a>
                                                            {repo.language && (
                                                                <span
                                                                    className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] tracking-wide"
                                                                    style={{
                                                                        background: `color-mix(in oklab, ${lang} 14%, transparent)`,
                                                                        color: `color-mix(in oklab, ${lang} 65%, var(--n-fg))`,
                                                                    }}
                                                                >
                                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: lang }} aria-hidden="true" />
                                                                    {repo.language}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 ml-1 line-clamp-2 font-sans text-sm text-[color:var(--n-muted)] sm:ml-9">— {desc}</p>
                                                        {video && <ProjectVideo video={video} compact className="relative z-10 mt-2 ml-1 text-[color:var(--n-cyan)] sm:ml-9" />}
                                                    </div>
                                                    <span className="relative z-10 flex shrink-0 items-center gap-3 pl-9 text-[11px] sm:pl-0">
                                                        {live && (
                                                            <a
                                                                href={repo.homepage!.trim()}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className={`rounded bg-[var(--n-blue)]/15 px-2 py-0.5 font-semibold text-[color:var(--n-blue)] transition-colors hover:bg-[var(--n-blue)]/25 ${focusRing}`}
                                                            >
                                                                Live
                                                            </a>
                                                        )}
                                                        <a
                                                            href={repo.html_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={`text-[color:var(--n-muted)] underline transition-colors hover:text-[color:var(--n-fg)] ${focusRing}`}
                                                        >
                                                            GitHub
                                                        </a>
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {repos.length > 8 && (
                                        <button
                                            onClick={() => setShowAll((s) => !s)}
                                            className={`mt-3 ml-2 rounded border border-[color:var(--n-line2)] px-3 py-1.5 text-xs transition-colors hover:border-[color:var(--n-blue)] hover:text-[color:var(--n-blue)] ${focusRing}`}
                                        >
                                            {showAll ? "$ ls | head -8" : `$ ls -a  # show all ${repos.length}`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Journey */}
                <section id="journey" className="scroll-mt-16">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
                        <Reveal delay={160}>
                            <SectionHead icon={<FaBriefcase />} title="Career Experience" right="newest first" />
                        </Reveal>
                        <ol className="grid grid-cols-1 items-start gap-x-6 gap-y-4 lg:grid-cols-2">
                            {experiences.map((exp, i) => {
                                const lines = bullets(exp.description);
                                const open = openExp === i;
                                const accent = TILE_ACCENTS[i % 3];
                                return (
                                    <li key={exp.role + exp.year} className="min-w-0">
                                        <Reveal delay={i % 2 === 0 ? 180 : 140}>
                                            <div className="nerd-dashbox relative" style={{ "--hl": accent } as React.CSSProperties}>
                                                <DashFrame />
                                                <button
                                                    onClick={() => setOpenExp(open ? null : i)}
                                                    aria-expanded={open}
                                                    className={`${card} group relative w-full p-3 text-left transition-colors duration-200 before:absolute before:top-[3.9rem] before:bottom-3 before:left-[2.1rem] before:w-px before:bg-[var(--n-line)] hover:border-[color:var(--hl)]/60 ${focusRing}`}
                                                >
                                                    <div className="flex gap-3 sm:gap-4">
                                                        <span
                                                            aria-hidden="true"
                                                            style={{
                                                                color: accent,
                                                                background: `color-mix(in oklab, ${accent} 12%, transparent)`,
                                                                borderColor: `color-mix(in oklab, ${accent} 35%, transparent)`,
                                                            }}
                                                            className={`${mono} flex h-11 w-11 shrink-0 items-center justify-center rounded border text-base font-bold transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-105`}
                                                        >
                                                            {monogram(exp.company)}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                                                                <p className={`${mono} text-sm font-semibold`}>
                                                                    {exp.company}
                                                                    <span className="font-normal text-[color:var(--n-muted)]"> - {exp.role}</span>
                                                                </p>
                                                                <DateRange value={exp.year} recent={i === 0} />
                                                            </div>
                                                            <p className={`mt-2 text-sm leading-relaxed text-[color:var(--n-sec)] ${open ? "" : "line-clamp-2"}`}>
                                                                <Metrics text={lines[0]} />
                                                            </p>
                                                            <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                                                                <div className="overflow-hidden">
                                                                    <ul className="space-y-2 pt-2 text-sm leading-relaxed text-[color:var(--n-sec)]">
                                                                        {lines.slice(1).map((l) => (
                                                                            <li key={l} className="flex gap-2">
                                                                                <span className="mt-2.5 h-px w-3 shrink-0 bg-current" aria-hidden="true" />
                                                                                <span>
                                                                                    <Metrics text={l} />
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    <ul className="flex flex-wrap gap-1.5 pt-3">
                                                                        {exp.technologies.map((t) => (
                                                                            <li
                                                                                key={t}
                                                                                className={`${mono} rounded border border-[color:var(--n-line)] px-2 py-0.5 text-[11px] text-[color:var(--n-muted)]`}
                                                                            >
                                                                                {t}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                            <p className={`${mono} mt-2 text-[11px] text-[color:var(--n-blue)]`}>{open ? "− less" : "+ details"}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </Reveal>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                {/* Activity */}
                <section id="activity" className="scroll-mt-16">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
                        <Reveal delay={160}>
                            <SectionHead icon={<FaHistory />} title="Contribution Graph" right="GitHub, one year at a time" />
                        </Reveal>
                        <Reveal delay={180}>
                            <ContributionCard />
                        </Reveal>
                    </div>
                </section>

                {/* Contact / terminal */}
                <section id="contact" className="scroll-mt-16">
                    <div className="mx-auto max-w-4xl px-4 pt-14 pb-16 sm:px-6 md:pt-20">
                        <Reveal delay={160}>
                            <SectionHead icon={<FaTerminal />} title="Contact" right="email is the fastest way to reach me" />
                        </Reveal>
                        <Reveal delay={180}>
                            <div className="nerd-dashbox relative">
                                <DashFrame />
                                <div className={`${card} ${mono} space-y-3 p-4 text-[13px] leading-6 sm:text-sm`}>
                                    <p className="flex items-center gap-2 border-b border-[color:var(--n-line)] pb-1.5 text-[11px] tracking-wider text-[color:var(--n-muted)]">
                                        <span className="h-2 w-2 rounded-full bg-[var(--n-green)]" aria-hidden="true" />
                                        INTERACTIVE BASH SHELL // TTY-1
                                    </p>
                                    {[
                                        { cmd: "cat resume.pdf", out: "Pulkit_Tiwari_SDE.pdf", href: RESUME_PDF, ext: true, c: "var(--n-blue)" },
                                        { cmd: "open github", out: "github.com/PulkitTiwari87", href: GITHUB, ext: true, c: "var(--n-green)" },
                                        { cmd: "open linkedin", out: "linkedin.com/in/pulkittiwari51", href: LINKEDIN, ext: true, c: "var(--n-purple)" },
                                        { cmd: "mail me", out: EMAIL_ADDRESS, href: EMAIL, ext: false, c: "var(--n-amber)" },
                                    ].map((c) => (
                                        <a
                                            key={c.cmd}
                                            href={c.href}
                                            target={c.ext ? "_blank" : undefined}
                                            rel="noreferrer"
                                            style={{ "--hl": c.c } as React.CSSProperties}
                                            className={`group -mx-2 block rounded px-2 py-1 transition-colors hover:bg-[var(--n-surface2)] ${focusRing}`}
                                        >
                                            <Prompt />
                                            <span className="text-[color:var(--hl)] group-hover:underline">{c.cmd}</span>
                                            <span className="block text-[color:var(--n-muted)] transition-transform group-hover:translate-x-1">{`→ ${c.out}`}</span>
                                        </a>
                                    ))}
                                    <p>
                                        <Prompt />
                                        <span className="inline-block h-4 w-2.5 translate-y-[3px] animate-nerd-blink bg-[color:var(--n-green)]" aria-hidden="true" />
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            <footer className="relative z-[1] border-t border-[color:var(--n-line)] bg-[var(--n-bar)]">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center">
                    <p className={`${mono} text-[11px] text-[color:var(--n-muted)]`}>
                        <Prompt />
                        <span className="inline-block h-3.5 w-2 translate-y-[2px] animate-nerd-blink bg-[color:var(--n-green)]" aria-hidden="true" />
                        <span className="ml-3">© {new Date().getFullYear()} Pulkit Tiwari · Dehradun, India</span>
                    </p>
                    <div className={`${mono} flex flex-wrap gap-x-5 gap-y-1 text-xs text-[color:var(--n-muted)]`}>
                        <button onClick={onExit} className={`${linkHover} ${focusRing}`}>
                            ‹ Portfolio
                        </button>
                        <a href={EMAIL} className={`${linkHover} ${focusRing}`}>
                            mail me
                        </a>
                        <a href={GITHUB} target="_blank" rel="noreferrer" className={`${linkHover} ${focusRing}`}>
                            open github
                        </a>
                        <button onClick={() => goTo("top")} className={`${linkHover} ${focusRing}`}>
                            Back to top ↑
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NerdDesign;
