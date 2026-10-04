import React, { useEffect, useRef, useState } from "react";
import { FaEnvelope, FaFilePdf, FaGithub, FaInstagram, FaLinkedin, FaMoon, FaSun } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { experiences } from "../data/experience";
import { content } from "../data/roles";
import { REPO_META, projectUrl } from "../data/repos";
import { videoFor, type ProjectVideoMeta } from "../data/videos";
import ProjectVideo from "./ui/ProjectVideo";
import { fetchAllRepos } from "../utils/github";
import type { Repo } from "../types";
import profileImg from "../assets/profile-portrait.jpg";
import faceImg from "../assets/profile-face.jpg";

// "Blahhh": a creative-studio editorial page. All styling lives in src/index.css
// under .bl-root / .bl-* (themes via data-theme: paper | night | tomato).
// Effects: intro splash, pill header on scroll, role-card cycler, project accordion,
// sticky stacking field notes, mood dial, NOW drawer, copy-email ticket.

interface BlahhhDesignProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    onExit: () => void;
}

type Theme = "paper" | "night" | "tomato";

const RESUME_PDF = "/Pulkit_Tiwari_SDE.pdf";
const EMAIL_ADDRESS = "tpulkit87@gmail.com";
const EMAIL = `mailto:${EMAIL_ADDRESS}`;
const LINKEDIN = "https://linkedin.com/in/pulkittiwari51";
const GITHUB = "https://github.com/PulkitTiwari87";
const INSTAGRAM = "https://instagram.com/_pulkittiwari";
const LEETCODE = "https://leetcode.com/u/pulkittiwari51/";

const NAV = [
    { id: "work", label: "Work" },
    { id: "about", label: "About" },
    { id: "notes", label: "Notes" },
    { id: "journey", label: "Journey" },
    { id: "contact", label: "Contact" },
];

const FOOTER_LINKS = [
    { label: "GitHub", href: GITHUB, icon: <FaGithub size={14} /> },
    { label: "LinkedIn", href: LINKEDIN, icon: <FaLinkedin size={14} /> },
    { label: "LeetCode", href: LEETCODE, icon: <SiLeetcode size={14} /> },
    { label: "Instagram", href: INSTAGRAM, icon: <FaInstagram size={14} /> },
    { label: "Email", href: EMAIL, icon: <FaEnvelope size={14} /> },
    { label: "Résumé", href: RESUME_PDF, icon: <FaFilePdf size={14} /> },
];

const CAPABILITIES = ["Generative AI & agents", "Security automation", "Full-stack products", "ML pipelines"];

// Role cards: one portrait style per role (original / sketch / painterly / pixel).
type PortraitStyle = "original" | "sketch" | "painterly" | "pixel";
const ROLES: { name: string; note: string; style: PortraitStyle }[] = [
    { name: "GenAI engineer", note: "Agents with guardrails", style: "original" },
    { name: "Security builder", note: "Automation for the SOC", style: "sketch" },
    { name: "Full-stack dev", note: "From the UI to the database", style: "painterly" },
    { name: "ML tinkerer", note: "Explainable pipelines", style: "pixel" },
];
const PORTRAIT_FILTER: Record<PortraitStyle, string> = {
    original: "none",
    sketch: "grayscale(1) contrast(1.5) brightness(1.08)",
    painterly: "url(#bl-paint) saturate(1.5) contrast(1.08) sepia(0.2)",
    pixel: "none",
};

const PASTELS = ["#d9d0c3", "#bdb5c2", "#a8b9ba", "#d7c4b5", "#c9d5b0", "#cdb8c6", "#b9c7d9", "#e0cfa8"];

// Lessons from Pulkit's own project write-ups.
const NOTES = [
    {
        repo: "NEO-Hazard-AI",
        lead: "A high metric",
        em: "isn't the result.",
        body: "Understanding why a model scores well matters more than the score itself. A lesson from NEO-Hazard-AI.",
        accent: "#c8b8c9",
        art: "bars",
    },
    {
        repo: "GDriveX",
        lead: "The feature",
        em: "is half the job.",
        body: "Building it is only part of the work. Understanding how it can fail is just as important. A lesson from GDriveX.",
        accent: "#aebfc3",
        art: "crack",
    },
    {
        repo: "NEO-Hazard-AI",
        lead: "Real data,",
        em: "reproducible.",
        body: "No fabricated benchmarks. Another lesson from NEO-Hazard-AI, built on NASA/JPL Near-Earth Object data.",
        accent: "#d7c4b5",
        art: "grid",
    },
] as const;

const bullets = (desc: string) =>
    desc
        .split("\n")
        .map((l) => l.replace(/^•\s*/, "").trim())
        .filter(Boolean);

// ----- Work items ------------------------------------------------------------------------

interface WorkItem {
    id: number;
    title: string;
    desc: string;
    lang: string;
    year: number;
    live: boolean;
    url: string;
    video?: ProjectVideoMeta;
}

const toWorkItem = (repo: Repo): WorkItem => {
    const meta = REPO_META[repo.name];
    return {
        id: repo.id,
        title: meta?.displayName ?? repo.name.replace(/[_-]/g, " "),
        desc: meta?.description ?? repo.description ?? "A project by Pulkit Tiwari.",
        lang: repo.language ?? "Project",
        year: new Date(repo.updated_at).getFullYear(),
        live: !!repo.homepage?.trim(),
        url: projectUrl(repo),
        video: videoFor(repo.name),
    };
};

const initials = (title: string) =>
    title
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

// Original generated cover art: concentric rings + monogram on the row's pastel.
const Cover: React.FC<{ item: WorkItem; color: string; open: boolean }> = ({ item, color, open }) => (
    <div className="bl-cover" style={{ background: color }}>
        <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="#202025" strokeWidth="1">
            <circle cx="240" cy="40" r="30" />
            <circle cx="240" cy="40" r="60" />
            <circle cx="240" cy="40" r="90" />
            <circle cx="240" cy="40" r="120" />
            <path d="M0 150 C80 110 140 190 320 130" />
        </svg>
        <span className="bl-cover-mono" aria-hidden="true">
            {initials(item.title)}
        </span>
        <span className="bl-cover-chip">
            {item.lang} &middot; {item.year}
        </span>
        {item.video && <ProjectVideo video={item.video} active={open} className="absolute inset-0 z-[3] h-full w-full rounded-none" />}
    </div>
);

// ----- Portrait --------------------------------------------------------------------------

// Cover-crop the portrait (4:5) into a ~28px canvas; CSS scales it up pixelated.
const PIXEL_W = 28;
const PIXEL_H = 35;

const PixelCanvas: React.FC<{ visible: boolean }> = ({ visible }) => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            const canvas = ref.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;
            const ta = PIXEL_W / PIXEL_H;
            let sx = 0;
            let sy = 0;
            let sw = img.naturalWidth;
            let sh = img.naturalHeight;
            if (sw / sh > ta) {
                sw = sh * ta;
                sx = (img.naturalWidth - sw) * 0.5;
            } else {
                sh = sw / ta;
                sy = (img.naturalHeight - sh) * 0.33;
            }
            // Two-step downsample keeps the cells smooth instead of aliased.
            const mid = document.createElement("canvas");
            mid.width = PIXEL_W * 4;
            mid.height = PIXEL_H * 4;
            mid.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, mid.width, mid.height);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(mid, 0, 0, PIXEL_W, PIXEL_H);
            const data = ctx.getImageData(0, 0, PIXEL_W, PIXEL_H);
            for (let i = 0; i < data.data.length; i += 4) {
                for (let c = 0; c < 3; c++) data.data[i + c] = Math.round(data.data[i + c] / 28) * 28;
            }
            ctx.putImageData(data, 0, 0);
        };
        img.src = profileImg;
    }, []);
    return (
        <canvas
            ref={ref}
            width={PIXEL_W}
            height={PIXEL_H}
            aria-hidden="true"
            style={{ imageRendering: "pixelated", mixBlendMode: "multiply", opacity: visible ? 1 : 0 }}
        />
    );
};

// ----- Field-note artwork (original SVG) -------------------------------------------------

const NoteArt: React.FC<{ kind: (typeof NOTES)[number]["art"] }> = ({ kind }) => (
    <svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#202025" strokeWidth="2" aria-hidden="true">
        {kind === "bars" && (
            <>
                {[70, 120, 95, 210, 80].map((h, i) => (
                    <rect key={i} x={26 + i * 40} y={270 - h} width="26" height={h} rx="3" fill={i === 3 ? "#202025" : "none"} />
                ))}
                <path d="M20 270 H224" />
                <circle cx="109" cy="42" r="22" />
                <path d="M101 36 q8 -12 16 0 q0 8 -8 10 M109 56 v2" strokeLinecap="round" />
            </>
        )}
        {kind === "crack" && (
            <>
                <rect x="40" y="60" width="160" height="180" rx="18" />
                <path d="M120 60 L106 110 L134 140 L112 182 L128 240" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M62 96 h26 M62 118 h18 M152 196 h30 M158 216 h22" strokeLinecap="round" />
            </>
        )}
        {kind === "grid" && (
            <>
                {Array.from({ length: 8 }).flatMap((_, r) =>
                    Array.from({ length: 6 }).map((__, c) => (
                        <circle key={`${r}-${c}`} cx={40 + c * 32} cy={50 + r * 28} r={(r + c) % 3 === 0 ? 5 : 2.5} fill="#202025" stroke="none" />
                    ))
                )}
                <path d="M172 232 l14 14 l32 -40" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
            </>
        )}
    </svg>
);

// ----- Page -----------------------------------------------------------------------------

const BlahhhDesign: React.FC<BlahhhDesignProps> = ({ isDarkMode, toggleTheme, onExit }) => {
    const [entered, setEntered] = useState(false);
    const [compact, setCompact] = useState(false);
    const [light, setLight] = useState<"paper" | "tomato">("paper");
    const [repos, setRepos] = useState<Repo[]>([]);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [openIdx, setOpenIdx] = useState<number | null>(null);
    const [roleIdx, setRoleIdx] = useState(0);
    const [nowOpen, setNowOpen] = useState(false);
    const [nowIdx, setNowIdx] = useState(0);
    const [copied, setCopied] = useState(false);
    const copyTimer = useRef<number | undefined>(undefined);
    const closeRef = useRef<HTMLButtonElement | null>(null);

    // Night follows the app-wide dark flag; paper/tomato are the two light moods.
    const theme: Theme = isDarkMode ? "night" : light;
    const pickTheme = (t: Theme) => {
        if (t !== "night") setLight(t);
        if ((t === "night") !== isDarkMode) toggleTheme();
    };

    // Smooth scroll + hidden scrollbars only while this design is mounted.
    useEffect(() => {
        document.documentElement.classList.add("bl-active");
        return () => document.documentElement.classList.remove("bl-active");
    }, []);

    // Intro splash: lock scroll, then slide the scene away after 1150ms.
    useEffect(() => {
        document.body.style.overflow = "hidden";
        const t = window.setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            document.body.style.overflow = "";
            setEntered(true);
        }, 1150);
        return () => {
            window.clearTimeout(t);
            document.body.style.overflow = "";
        };
    }, []);

    // Header becomes a floating pill once scrolled past 88px.
    useEffect(() => {
        const onScroll = () => setCompact(window.scrollY > 88);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        fetchAllRepos()
            .then((r) => {
                setRepos(r);
                setStatus("ready");
            })
            .catch(() => setStatus("error"));
    }, []);

    // NOW drawer: Escape closes, focus moves to the close button.
    useEffect(() => {
        if (!nowOpen) return;
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNowOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [nowOpen]);

    useEffect(() => () => window.clearTimeout(copyTimer.current), []);

    const goTo = (id: string) =>
        id === "top" ? window.scrollTo({ top: 0 }) : document.getElementById(id)?.scrollIntoView({ block: "start" });

    const copyEmail = () => {
        const done = () => {
            setCopied(true);
            window.clearTimeout(copyTimer.current);
            copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
        };
        // Clipboard unavailable or denied: fall back to the mail client instead of a false "copied".
        const fallback = () => {
            window.location.href = EMAIL;
        };
        if (navigator.clipboard) navigator.clipboard.writeText(EMAIL_ADDRESS).then(done, fallback);
        else fallback();
    };

    // Flagship / live first (stable, so recency is kept inside each group), first 8.
    const work = repos.slice(0, 8).map(toWorkItem);
    const noteLink = (name: string) => {
        const repo = repos.find((r) => r.name === name);
        return repo ? projectUrl(repo) : `${GITHUB}/${name}`;
    };

    const role = ROLES[roleIdx];
    const recents = experiences.slice(0, 3);
    const recent = recents[nowIdx];

    return (
        <div className="bl-root" data-theme={theme}>
            {/* Painterly filter: turbulence displacement gives the brushy edges */}
            <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
                <filter id="bl-paint" x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>

            {/* 1. Intro splash */}
            <div className={`bl-entry${entered ? " has-entered" : ""}`} aria-hidden={entered}>
                <div className="bl-entry-word" role="img" aria-label="Blah">
                    {"BLAH".split("").map((ch, i) => (
                        <span key={i} aria-hidden="true">
                            {ch}
                        </span>
                    ))}
                </div>
            </div>

            {/* 2. Header: full bar, floating pill after scrolling */}
            <header className={`bl-header${compact ? " is-compact" : ""}`}>
                <button className="bl-identity" onClick={() => goTo("top")} aria-label="Pulkit Tiwari, back to top">
                    <img src={faceImg} alt="" />
                    <span className="bl-identity-text">PULKIT</span>
                </button>
                <nav className="bl-nav" aria-label="Blahhh sections">
                    {NAV.map((n) => (
                        <button key={n.id} className="bl-link" onClick={() => goTo(n.id)}>
                            {n.label}
                        </button>
                    ))}
                    <button
                        className="bl-icon-btn"
                        onClick={toggleTheme}
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>
                    <button className="bl-link" onClick={onExit} aria-label="Back to portfolio">
                        &lsaquo;<span className="max-[680px]:hidden"> Portfolio</span>
                    </button>
                </nav>
            </header>

            <main>
                {/* 3. Hero */}
                <section id="top" className="bl-hero">
                    <div className="bl-meta">
                        <span>
                            <i className="bl-dot" aria-hidden="true" />
                            Available for opportunity
                        </span>
                        <span>GenAI &middot; Security &middot; Full-stack</span>
                        <span>Dehradun, India</span>
                    </div>

                    <p className="bl-eyebrow">
                        Final-year computer science student at UPES, building agentic AI, security automation and full-stack products.
                    </p>

                    <h1 className="bl-h1">
                        <span>Pulkit</span>
                        <em>builds</em>
                        <span>ideas.</span>
                    </h1>

                    {/* 4. Role card (character cycler) */}
                    <button
                        className="bl-role"
                        onClick={() => setRoleIdx((i) => (i + 1) % ROLES.length)}
                        aria-label={`Change role. Currently ${role.name}, ${roleIdx + 1} of ${ROLES.length}`}
                    >
                        <span className="bl-count">
                            {String(roleIdx + 1).padStart(2, "0")} / {String(ROLES.length).padStart(2, "0")}
                        </span>
                        <span className="bl-portrait">
                            <img
                                src={profileImg}
                                alt={`Portrait of Pulkit Tiwari, ${role.style} style`}
                                draggable={false}
                                style={{
                                    filter: PORTRAIT_FILTER[role.style],
                                    mixBlendMode: "multiply",
                                    opacity: role.style === "pixel" ? 0 : 1,
                                }}
                            />
                            <PixelCanvas visible={role.style === "pixel"} />
                            {role.style === "sketch" && (
                                <span
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        mixBlendMode: "multiply",
                                        background: "repeating-linear-gradient(45deg, rgba(23,23,23,0.16) 0 1px, transparent 1px 4px)",
                                    }}
                                    aria-hidden="true"
                                />
                            )}
                            <i aria-hidden="true" />
                        </span>
                        <span>
                            <span className="bl-role-name">{role.name}</span>
                            <span className="bl-role-note">{role.note}</span>
                            <span className="bl-role-act">
                                Change role <span aria-hidden="true">&rarr;</span>
                            </span>
                        </span>
                    </button>

                    <p className="bl-foot">B.Tech CSE, Cybersecurity &amp; Forensics &middot; UPES Dehradun</p>
                    <button className="bl-cue" onClick={() => goTo("work")}>
                        Scroll for the work
                        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <path d="M7 1v13M2 9l5 5 5-5" />
                        </svg>
                    </button>
                </section>

                {/* 6. Selected projects: single-open accordion */}
                <section id="work" className="bl-work scroll-mt-14">
                    <div className="bl-work-head">
                        <p className="bl-label">Selected work &middot; live from GitHub</p>
                        <h2 className="bl-h2">
                            Selected
                            <br />
                            <em>projects.</em>
                        </h2>
                        <p className="bl-label" style={{ margin: "28px 0 0" }}>
                            {status === "loading" && "Loading projects…"}
                            {status === "error" && "Couldn't reach GitHub right now. See everything at github.com/PulkitTiwari87."}
                            {status === "ready" && openIdx === null && "Select a project to view its scope and outcome."}
                            {status === "ready" && openIdx !== null && " "}
                        </p>
                    </div>
                    <div className="bl-projects">
                        {work.map((item, i) => {
                            const open = openIdx === i;
                            return (
                                <div key={item.id} className="bl-project" style={{ background: PASTELS[i % PASTELS.length] }}>
                                    <button
                                        className="bl-summary"
                                        aria-expanded={open}
                                        aria-controls={`bl-stage-${item.id}`}
                                        onClick={() => setOpenIdx(open ? null : i)}
                                    >
                                        <span className="bl-num">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="bl-title">{item.title}</span>
                                        <span className="bl-kind">{item.lang}</span>
                                        <span className="bl-status">{item.live ? "Live" : "Repo"}</span>
                                        <span className="bl-toggle" aria-hidden="true">
                                            {open ? "−" : "+"}
                                        </span>
                                    </button>
                                    <div id={`bl-stage-${item.id}`} className={`bl-stage${open ? " is-open" : ""}`} aria-hidden={!open}>
                                        <div className="bl-stage-grid">
                                            <div>
                                                <p className="bl-blurb">{item.desc}</p>
                                                <p className="bl-result">
                                                    {item.live ? "Live on the web." : "Source is public on GitHub."} Last updated {item.year}.
                                                </p>
                                            </div>
                                            <Cover item={item} color={PASTELS[i % PASTELS.length]} open={open} />
                                            <a className="bl-view" href={item.url} target="_blank" rel="noreferrer">
                                                {item.live ? "View project" : "View on GitHub"} <span className="bl-arrow">&#8599;</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 7. About */}
                <section id="about" className="bl-about scroll-mt-14">
                    <div className="bl-about-photo">
                        <div>
                            <img src={profileImg} alt="Portrait of Pulkit Tiwari" />
                        </div>
                        <span className="bl-sticker">Final year &middot; UPES</span>
                    </div>
                    <div>
                        <p className="bl-label">About</p>
                        <h2 className="bl-lede">
                            I turn ambitious ideas into <em>things that run.</em>
                        </h2>
                        <p className="bl-about-p">{content.anyone}</p>
                        <p className="bl-about-p" style={{ marginTop: 12 }}>
                            B.Tech CSE (Cybersecurity &amp; Forensics), UPES Dehradun
                        </p>
                        <ul className="bl-caps">
                            {CAPABILITIES.map((c, i) => (
                                <li key={c}>
                                    <span>{String(i + 1).padStart(2, "0")}</span>
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 9. Field notes: sticky stacking cards */}
                <section id="notes" className="bl-notes scroll-mt-14">
                    <div className="bl-notes-head">
                        <p className="bl-label">Field notes</p>
                        <h2 className="bl-h2">
                            Notes on building
                            <br />
                            <em>and breaking.</em>
                        </h2>
                        <p className="bl-hint">Scroll to continue.</p>
                    </div>
                    <div className="bl-note-stack">
                        {NOTES.map((n, i) => (
                            <article key={n.lead} className="bl-note" style={{ ["--note-accent" as string]: n.accent }}>
                                <div className="bl-note-text">
                                    <p className="bl-label">Note {String(i + 1).padStart(2, "0")}</p>
                                    <h3>
                                        {n.lead}
                                        <em>{n.em}</em>
                                    </h3>
                                    <p>{n.body}</p>
                                    <a href={noteLink(n.repo)} target="_blank" rel="noreferrer" aria-label={`Read note ${i + 1}: see the ${n.repo} project`}>
                                        Read note <span className="bl-arrow">&#8599;</span>
                                    </a>
                                </div>
                                <div className="bl-note-visual">
                                    <NoteArt kind={n.art} />
                                    <b className="bl-pill">{n.repo}</b>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Journey */}
                <section id="journey" className="bl-journey scroll-mt-14">
                    <p className="bl-label">Journey</p>
                    <h2 className="bl-h2">
                        Where I&apos;ve
                        <br />
                        <em>been building.</em>
                    </h2>
                    <ol className="bl-jobs">
                        {experiences.map((exp) => (
                            <li key={exp.role + exp.year} className="bl-job">
                                <div>
                                    <p className="bl-job-when">{exp.year}</p>
                                    <h3>{exp.role}</h3>
                                    <p className="bl-job-co">{exp.company}</p>
                                </div>
                                <div>
                                    <ul className="bl-bullets">
                                        {bullets(exp.description).map((l) => (
                                            <li key={l}>{l}</li>
                                        ))}
                                    </ul>
                                    <ul className="bl-tags">
                                        {exp.technologies.map((t) => (
                                            <li key={t}>{t}</li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            </main>

            {/* 11. Footer with copy-email ticket */}
            <footer id="contact" className="bl-footer scroll-mt-14">
                <div className="bl-footer-top">
                    <span>Open to software engineering roles</span>
                    <span>Dehradun, India</span>
                </div>
                <h2>
                    Say
                    <em>hello.</em>
                </h2>
                <button className="bl-ticket" onClick={copyEmail} aria-label={`Copy email address ${EMAIL_ADDRESS}`}>
                    <span aria-live="polite">{copied ? "COPIED - SEE YOU SOON" : EMAIL_ADDRESS}</span>
                    <span aria-hidden="true">&#8599;</span>
                </button>
                <div className="bl-footer-bottom">
                    <span>&copy; {new Date().getFullYear()} Pulkit Tiwari</span>
                    <ul>
                        {FOOTER_LINKS.map((l) => (
                            <li key={l.label}>
                                <a
                                    href={l.href}
                                    target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                                    rel="noreferrer"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                >
                                    {l.icon}
                                    {l.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => goTo("top")}>Back to top &uarr;</button>
                </div>
            </footer>

            {/* 8. Mood dial: theme switcher */}
            <div className="bl-dial" role="group" aria-label="Mood">
                <span>Mood</span>
                {(["paper", "night", "tomato"] as Theme[]).map((t) => (
                    <button key={t} data-swatch={t} aria-pressed={theme === t} aria-label={`${t} theme`} onClick={() => pickTheme(t)} />
                ))}
            </div>

            {/* 10. NOW drawer */}
            <button className="bl-tab" onClick={() => setNowOpen(true)} aria-haspopup="dialog" aria-expanded={nowOpen}>
                NOW <span aria-hidden="true">+</span>
            </button>
            {nowOpen && <div className="bl-scrim" onClick={() => setNowOpen(false)} aria-hidden="true" />}
            <aside className={`bl-drawer${nowOpen ? " is-open" : ""}`} aria-hidden={!nowOpen} aria-label="Recent chapters">
                <button ref={closeRef} className="bl-close" onClick={() => setNowOpen(false)} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6" fill="none" aria-hidden="true">
                        <path d="M2 2l12 12M14 2L2 14" />
                    </svg>
                </button>
                <div aria-live="polite">
                    <p className="bl-drawer-count">
                        {String(nowIdx + 1).padStart(2, "0")} / {String(recents.length).padStart(2, "0")}
                    </p>
                    <p className="bl-drawer-month">{recent.year}</p>
                    <h2>{recent.role}</h2>
                    <div className="bl-drawer-tile">
                        <strong>{recent.company.split(",")[0]}</strong>
                        <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" fill="none" aria-hidden="true">
                            <path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17" />
                        </svg>
                    </div>
                    <dl>
                        <div>
                            <dt>Where</dt>
                            <dd>{recent.company}</dd>
                        </div>
                        <div>
                            <dt>Stack</dt>
                            <dd>{recent.technologies.slice(0, 4).join(", ")}</dd>
                        </div>
                        <div>
                            <dt>Highlight</dt>
                            <dd>{bullets(recent.description)[0]}</dd>
                        </div>
                    </dl>
                </div>
                <div className="bl-drawer-nav">
                    <button onClick={() => setNowIdx((i) => (i - 1 + recents.length) % recents.length)} aria-label="Previous chapter">
                        &larr;
                    </button>
                    <button onClick={() => setNowIdx((i) => (i + 1) % recents.length)} aria-label="Next chapter">
                        &rarr;
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default BlahhhDesign;
