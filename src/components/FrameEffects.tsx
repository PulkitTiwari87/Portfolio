import React, { useEffect, useRef, useState } from "react";
import {
    AnimatePresence,
    motion,
    useAnimationFrame,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import { gsap } from "gsap";
import type { IconType } from "react-icons";
import {
    LuArrowUp,
    LuBrain,
    LuChevronDown,
    LuCode,
    LuCompass,
    LuCpu,
    LuDatabase,
    LuFingerprint,
    LuGithub,
    LuLayers,
    LuNetwork,
    LuServer,
    LuShield,
    LuTarget,
    LuTerminal,
    LuWorkflow,
    LuZap,
} from "react-icons/lu";
import { experiences } from "../data/experience";
import { REPO_META, isFlagship, projectUrl } from "../data/repos";
import type { Repo } from "../types";

// Scroll / hover effects for the bottom half of the "Frame" design. The motion
// mechanics follow the inspiration site (framer-motion scroll-linked stages,
// gsap cube, velocity-driven ribbons); all copy and data are Pulkit's own.
// Every effect has a prefers-reduced-motion fallback that shows the final state.

const display = "font-['Anton',Impact,'Arial_Narrow',sans-serif] font-normal uppercase";
const muted = "text-[color:var(--f-muted)]";
const line = "border-[color:var(--f-line)]";
const mono = "font-mono uppercase tracking-[0.2em]";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--f-accent)]";
const bg = "bg-[var(--f-bg)]";
const MASK_EDGES = "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)";

const useMediaQuery = (query: string): boolean => {
    const [match, setMatch] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const update = () => setMatch(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [query]);
    return match;
};

/* ------------------------------------------------------------------ */
/* Technology marquee: two rows, opposite directions, duplicated tracks */
/* ------------------------------------------------------------------ */

const TECH_ROW_1 = ["Python", "TypeScript", "React", "Node.js", "PyTorch", "Docker", "AWS", "PostgreSQL", "FastAPI", "Redis"];
const TECH_ROW_2 = ["CrewAI", "AWS Bedrock", "LangChain", "Wazuh", "TheHive", "MISP", "XGBoost", "MongoDB", "Burp Suite", "OWASP"];

const MarqueeRow: React.FC<{ items: string[]; reverse?: boolean; outline?: boolean; reduce: boolean }> = ({ items, reverse, outline, reduce }) => (
    <div className="flex overflow-hidden py-2" style={{ maskImage: MASK_EDGES, WebkitMaskImage: MASK_EDGES }}>
        <motion.div
            className="flex w-max whitespace-nowrap"
            animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        >
            {[0, 1].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 ? "true" : undefined}>
                    {items.map((t) => (
                        <li key={t} className="group flex items-center">
                            <span
                                className={`${display} cursor-default px-6 text-4xl transition-colors duration-500 sm:text-6xl ${
                                    outline
                                        ? "text-transparent group-hover:text-[color:var(--f-fg)]"
                                        : "group-hover:text-[color:var(--f-accent)]"
                                }`}
                                style={outline ? { WebkitTextStroke: "1.5px var(--f-fg)" } : undefined}
                            >
                                {t}
                            </span>
                            <span className="text-2xl text-[color:var(--f-accent)]" aria-hidden="true">
                                ✦
                            </span>
                        </li>
                    ))}
                </ul>
            ))}
        </motion.div>
    </div>
);

export const TechMarquees: React.FC = () => {
    const reduce = !!useReducedMotion();
    return (
        <section aria-label="Technologies" className={`overflow-hidden border-y py-4 ${line}`}>
            <MarqueeRow items={TECH_ROW_1} reduce={reduce} />
            <MarqueeRow items={TECH_ROW_2} reverse outline reduce={reduce} />
        </section>
    );
};

/* ------------------------------------------------------------------ */
/* Feature stage: pinned stage, halves slide in on scroll, gsap cube    */
/* ------------------------------------------------------------------ */

interface Face {
    Icon: IconType;
    label: string;
}
interface Feature {
    n: string;
    title: string;
    body: string;
    tags: string[];
    faces: Face[];
}

const FEATURES: Feature[] = [
    {
        n: "01",
        title: "Intelligence systems",
        body: "Agentic AI with guardrails. At Ascendion I built a 3-agent CrewAI pipeline on AWS Bedrock, plus a validation agent that checks 10+ GenAI applications for bias and grounded answers. Retrieval, evaluation and structured output are part of the design, not an afterthought.",
        tags: ["Agentic AI", "CrewAI", "AWS Bedrock", "RAG", "AI Guardrails", "LLMs"],
        faces: [
            { Icon: LuBrain, label: "AI" },
            { Icon: LuNetwork, label: "Agents" },
            { Icon: LuCpu, label: "LLM" },
            { Icon: LuDatabase, label: "RAG" },
            { Icon: LuFingerprint, label: "Eval" },
            { Icon: LuZap, label: "ML" },
        ],
    },
    {
        n: "02",
        title: "Scalable systems",
        body: "Full-stack products from schema to deploy: React on the front, Node or Python behind it, PostgreSQL or MongoDB underneath. An API-first rework at Weblicious cut response time by 25%, and Atlas explores fault-tolerant distributed compute.",
        tags: ["React", "Node.js", "FastAPI", "PostgreSQL", "MongoDB", "Docker"],
        faces: [
            { Icon: LuServer, label: "Backend" },
            { Icon: LuCode, label: "Code" },
            { Icon: LuTerminal, label: "CLI" },
            { Icon: LuLayers, label: "Arch" },
            { Icon: LuDatabase, label: "Data" },
            { Icon: LuWorkflow, label: "CI/CD" },
        ],
    },
    {
        n: "03",
        title: "Security automation",
        body: "My cybersecurity and forensics degree shows up in the code. SOAR Intelligence wires Wazuh, TheHive, Cortex and MISP together, with an XGBoost triage model that reached 92.41% accuracy on 45,000 alert records.",
        tags: ["Wazuh", "TheHive", "Cortex", "MISP", "XGBoost", "Burp Suite"],
        faces: [
            { Icon: LuShield, label: "SIEM" },
            { Icon: LuWorkflow, label: "SOAR" },
            { Icon: LuTarget, label: "Triage" },
            { Icon: LuCompass, label: "Intel" },
            { Icon: LuFingerprint, label: "Forensics" },
            { Icon: LuTerminal, label: "Pentest" },
        ],
    },
];

const FACE_COLORS = ["#d4ff3a", "#f3f3ee", "#bfe82f", "#e6e6df", "#d4ff3a", "#f3f3ee"];
const FACE_TRANSFORMS = [
    "rotateY(0deg) translateZ(var(--cube-half))",
    "rotateY(180deg) translateZ(var(--cube-half))",
    "rotateY(90deg) translateZ(var(--cube-half))",
    "rotateY(-90deg) translateZ(var(--cube-half))",
    "rotateX(90deg) translateZ(var(--cube-half))",
    "rotateX(-90deg) translateZ(var(--cube-half))",
];
const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+";

const Cube: React.FC<{ faces: Face[]; running: boolean; reduce: boolean }> = ({ faces, running, reduce }) => {
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    const shadow = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reduce || !running) return;
        const ctx = gsap.context(() => {
            gsap.set(outer.current, { scale: 1, rotateX: -20, rotateY: 0 });
            gsap.to(outer.current, { scale: 1.3, rotateX: 160, rotateY: 180, duration: 2, ease: "power1.inOut", yoyo: true, repeat: -1 });
            gsap.to(inner.current, { rotateY: 360, rotateZ: 360, duration: 8, ease: "none", repeat: -1 });
            gsap.set(shadow.current, { scale: 1, opacity: 0.5 });
            gsap.to(shadow.current, { scale: 0.4, opacity: 0.1, duration: 2, ease: "power1.inOut", yoyo: true, repeat: -1 });
        });
        return () => ctx.revert();
    }, [reduce, running]);

    return (
        <div
            className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden [--cube:84px] [--cube-half:42px] md:[--cube:110px] md:[--cube-half:55px]"
            style={{ perspective: 1500 }}
            aria-hidden="true"
        >
            <div className="relative flex scale-[0.9] items-center justify-center md:scale-[1.7]">
                <div
                    ref={outer}
                    className="relative"
                    style={{
                        width: "var(--cube)",
                        height: "var(--cube)",
                        transformStyle: "preserve-3d",
                        transform: reduce ? "rotateX(-20deg) rotateY(28deg)" : undefined,
                    }}
                >
                    <div ref={inner} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                        {faces.map(({ Icon, label }, i) => (
                            <div
                                key={label}
                                className="absolute flex h-full w-full flex-col items-center justify-center overflow-hidden"
                                style={{
                                    background: FACE_COLORS[i],
                                    transform: FACE_TRANSFORMS[i],
                                    border: "4px solid #111",
                                    boxSizing: "border-box",
                                }}
                            >
                                <div className="absolute h-[18px] w-[150%] -translate-y-8 -rotate-45 bg-black opacity-15" />
                                <Icon className="z-10 h-8 w-8 text-[#111] md:h-9 md:w-9" />
                                <span className="z-10 mt-1 rounded-sm bg-[#111] px-2 text-[9px] font-bold uppercase tracking-widest text-white">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    ref={shadow}
                    className="absolute -bottom-[70px] h-[26px] w-[110px] rounded-[100%] bg-[color:var(--f-fg)] opacity-30 blur-[8px]"
                />
            </div>
        </div>
    );
};

const MagneticChip: React.FC<{ text: string; index: number }> = ({ text, index }) => {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const x = useSpring(mx, { stiffness: 150, damping: 15, mass: 0.1 });
    const y = useSpring(my, { stiffness: 150, damping: 15, mass: 0.1 });
    const fill = index % 2 === 0 ? "var(--f-accent)" : "var(--f-fg)";
    return (
        <div
            className="relative -m-2 cursor-pointer p-2"
            onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                mx.set((e.clientX - (r.left + r.width / 2)) * 0.4);
                my.set((e.clientY - (r.top + r.height / 2)) * 0.4);
            }}
            onMouseLeave={() => {
                mx.set(0);
                my.set(0);
            }}
        >
            <motion.div
                style={{ x, y }}
                className={`group/chip relative overflow-hidden rounded-xl border px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest md:px-7 md:py-3.5 md:text-[11px] ${line}`}
            >
                <span
                    className="absolute inset-0 translate-y-[101%] transition-transform duration-300 ease-out group-hover/chip:translate-y-0"
                    style={{ background: fill }}
                    aria-hidden="true"
                />
                <span className="relative z-10 transition-colors duration-300 group-hover/chip:text-[color:var(--f-bg)]">{text}</span>
            </motion.div>
        </div>
    );
};

const FeatureText: React.FC<{ feature: Feature }> = ({ feature }) => (
    <div className="group relative flex h-full w-full items-center overflow-hidden p-5 md:p-12 lg:p-16">
        <div
            className="absolute inset-0 origin-top scale-y-0 bg-[var(--f-accent)] opacity-[0.1] transition-transform duration-[400ms] group-hover:scale-y-100"
            aria-hidden="true"
        />
        <div className="relative z-10 flex w-full max-w-2xl flex-col items-start gap-4 md:gap-9">
            <div className="flex items-center gap-4">
                <span className={`${mono} text-[10px] font-black text-[color:var(--f-accent)] md:text-[11px]`}>FEATURE — {feature.n}</span>
                <span className="h-px w-12 bg-[color:var(--f-accent)] opacity-40" aria-hidden="true" />
            </div>
            <h3
                className={`${display} origin-left cursor-default text-3xl leading-[0.98] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-6 hover:text-[color:var(--f-muted)] md:text-6xl lg:text-7xl`}
            >
                {feature.title}
            </h3>
            <p className={`max-w-lg text-[13px] leading-snug md:text-xl ${muted}`}>{feature.body}</p>
            <div className="flex flex-wrap gap-2 pt-1 md:gap-4 md:pt-4">
                {feature.tags.map((t, i) => (
                    <MagneticChip key={t} text={t} index={i} />
                ))}
            </div>
        </div>
    </div>
);

const ScrambleText: React.FC<{ text: string; className: string; enabled: boolean }> = ({ text, className, enabled }) => {
    const [out, setOut] = useState(text);
    const timer = useRef<number | null>(null);
    useEffect(
        () => () => {
            if (timer.current) window.clearInterval(timer.current);
        },
        [],
    );
    const scramble = () => {
        if (!enabled) return;
        if (timer.current) window.clearInterval(timer.current);
        let step = 0;
        timer.current = window.setInterval(() => {
            setOut(
                text
                    .split("")
                    .map((c, i) => (i < step || c === " " || c === "\n" ? c : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)]))
                    .join(""),
            );
            if (step >= text.length && timer.current) {
                window.clearInterval(timer.current);
                timer.current = null;
                setOut(text);
            }
            step += 2;
        }, 30);
    };
    return (
        <h3 className={className} onMouseEnter={scramble} aria-label={text.replace("\n", " ")}>
            <span aria-hidden="true" className="whitespace-pre-line">
                {out}
            </span>
        </h3>
    );
};

const PAGES = FEATURES.length + 1; // three features + the bridge page

const FeaturePage: React.FC<{ feature: Feature; index: number; progress: MotionValue<number>; running: boolean; reduce: boolean }> = ({
    feature,
    index,
    progress,
    running,
    reduce,
}) => {
    const n = 1 / PAGES;
    const c = index * n;
    let d = index === 0 ? -0.1 : c - n / 4;
    let h = index === 0 ? -0.05 : c + n / 4;
    let m = c + 0.75 * n;
    let u = c + 1.25 * n;
    if (index === 0) {
        m = 0.125;
        u = 0.3125;
    } else if (index === 1) {
        d = 0.125;
        h = 0.3125;
    }
    const range = [d, h, m, u];
    const yVisual = useTransform(progress, range, ["-120%", "0%", "0%", "-120%"]);
    const yText = useTransform(progress, range, ["120%", "0%", "0%", "120%"]);
    const zIndex = useTransform(progress, range, [10, 20, 20, 10]);
    return (
        <motion.div style={{ zIndex }} className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 md:p-8 lg:p-12">
            <div className={`pointer-events-auto relative flex h-full w-full max-w-[1400px] flex-col gap-3 md:gap-4 ${index === 1 ? "md:flex-row-reverse" : "md:flex-row"}`}>
                <motion.div style={{ y: yVisual }} className={`relative h-[30%] shrink-0 overflow-hidden rounded-3xl border md:h-full md:w-1/2 ${bg} ${line}`}>
                    <Cube faces={feature.faces} running={running} reduce={reduce} />
                </motion.div>
                <motion.div style={{ y: yText }} className={`relative min-h-0 flex-1 overflow-hidden rounded-3xl border md:w-1/2 ${bg} ${line}`}>
                    <FeatureText feature={feature} />
                </motion.div>
            </div>
        </motion.div>
    );
};

const BridgePage: React.FC<{ progress: MotionValue<number>; active: boolean; reduce: boolean }> = ({ progress, active, reduce }) => {
    const n = 1 / PAGES;
    const o = (PAGES - 1) * n;
    const range = [o - n / 4, o + n / 4, 0.98, 1];
    const opacity = useTransform(progress, range, [0, 1, 1, 0]);
    const y = useTransform(progress, range, [50, 0, 0, -50]);
    return (
        <motion.div
            style={{ opacity, zIndex: 30 }}
            className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center md:p-12 ${bg} ${active ? "pointer-events-auto" : "pointer-events-none"}`}
        >
            <motion.div style={{ y }} className="w-full max-w-[1200px] space-y-10 px-[3%] md:space-y-16">
                <ScrambleText
                    enabled={!reduce}
                    text={"Things I built, shipped\nand still maintain."}
                    className={`${display} cursor-default text-[clamp(40px,8vw,120px)] leading-[0.95]`}
                />
                <div className="flex flex-col items-center gap-5 opacity-50">
                    <span className={`${mono} text-[11px] font-bold`}>Scroll to explore</span>
                    <motion.div animate={reduce ? undefined : { y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                        <LuChevronDown className="h-6 w-6" aria-hidden="true" />
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const FeatureStage: React.FC = () => {
    const reduce = !!useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const [activePage, setActivePage] = useState(0);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 });
    const { scrollYProgress: enterRaw } = useScroll({ target: ref, offset: ["start end", "start start"] });
    const enter = useSpring(enterRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const scale = useTransform(enter, [0, 1], [0.85, 1]);
    const opacity = useTransform(enter, [0, 1], [0, 1]);
    const radius = useTransform(enter, [0, 1], ["40px", "0px"]);
    useMotionValueEvent(scrollYProgress, "change", (v) => {
        const next = Math.min(Math.floor(v * PAGES), PAGES - 1);
        setActivePage((prev) => (prev === next ? prev : next));
    });

    if (reduce) {
        return (
            <section aria-label="What I work on" className="mx-auto max-w-[1400px] px-4 sm:px-8">
                {FEATURES.map((f) => (
                    <article key={f.n} className={`grid gap-6 border-b py-12 md:grid-cols-12 md:gap-10 md:py-16 ${line}`}>
                        <div className="md:col-span-5">
                            <p className="mb-3 text-sm font-semibold tabular-nums text-[color:var(--f-accent)]">FEATURE — {f.n}</p>
                            <h3 className={`${display} text-[clamp(44px,6vw,84px)] leading-[0.95]`}>{f.title}</h3>
                        </div>
                        <div className="md:col-span-7">
                            <p className={`max-w-2xl text-lg leading-relaxed ${muted}`}>{f.body}</p>
                            <ul className="mt-6 flex flex-wrap gap-2">
                                {f.tags.map((t) => (
                                    <li key={t} className={`rounded-full border px-3.5 py-1 text-xs font-medium ${line}`}>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </article>
                ))}
            </section>
        );
    }

    return (
        <section ref={ref} aria-label="What I work on" className="pointer-events-none relative h-[600vh] w-full">
            <motion.div
                style={{ scale, opacity, borderRadius: radius }}
                className={`pointer-events-auto sticky top-0 h-screen w-full origin-center overflow-hidden ${bg}`}
            >
                {FEATURES.map((f, i) => (
                    <FeaturePage key={f.n} feature={f} index={i} progress={progress} running={Math.abs(activePage - i) <= 1} reduce={reduce} />
                ))}
                <BridgePage progress={progress} active={activePage === PAGES - 1} reduce={reduce} />
            </motion.div>
        </section>
    );
};

/* ------------------------------------------------------------------ */
/* Projects: pinned slider with minimap bar + page counter, then a list */
/* ------------------------------------------------------------------ */

interface ProjectItem {
    key: number;
    title: string;
    desc: string;
    category: string;
    year: string;
    url: string;
    live: boolean;
    stars: number;
}

const toItem = (repo: Repo): ProjectItem => {
    const meta = REPO_META[repo.name];
    return {
        key: repo.id,
        title: meta?.displayName ?? repo.name.replace(/[_-]/g, " "),
        desc: meta?.description ?? repo.description ?? "A project by Pulkit Tiwari.",
        category: repo.language ?? "Project",
        year: String(new Date(repo.updated_at).getFullYear()),
        url: projectUrl(repo),
        live: !!repo.homepage?.trim(),
        stars: repo.stargazers_count,
    };
};

const STEP = 250; // minimap bar height in px; both columns move one bar-height per project

const SliderPlate: React.FC<{ item: ProjectItem; index: number; y: MotionValue<string> }> = ({ item, index, y }) => (
    <div className="absolute h-full w-full overflow-hidden" style={{ top: `${index * 100}vh` }}>
        <motion.div style={{ y }} className="absolute inset-x-0 -top-[12%] flex h-[124%] items-center justify-end overflow-hidden pr-[6vw]">
            <span
                className={`${display} select-none text-[48vw] leading-none text-transparent opacity-30`}
                style={{ WebkitTextStroke: "2px var(--f-line)" }}
                aria-hidden="true"
            >
                {String(index + 1).padStart(2, "0")}
            </span>
            <span
                className={`${display} absolute left-[4vw] top-[22%] select-none text-[11vw] leading-none opacity-[0.07]`}
                aria-hidden="true"
            >
                {item.category}
            </span>
        </motion.div>
    </div>
);

const ProjectSlider: React.FC<{ items: ProjectItem[]; github: string; onViewAll: () => void }> = ({ items, github, onViewAll }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(0);
    const count = items.length;
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const p = useSpring(scrollYProgress, { stiffness: 60, damping: 30, mass: 1 });
    const unit = 0.85 / count;

    const inputs = [0];
    const vh = ["0vh"];
    const px = ["0px"];
    for (let t = 1; t < count; t++) {
        const a = t * unit;
        inputs.push(a - 0.025, a + 0.025);
        vh.push(`-${(t - 1) * 100}vh`, `-${t * 100}vh`);
        px.push(`-${(t - 1) * STEP}px`, `-${t * STEP}px`);
    }
    inputs.push(0.85, 1);
    vh.push(`-${(count - 1) * 100}vh`, `-${(count - 1) * 100}vh`);
    px.push(`-${(count - 1) * STEP}px`, `-${(count - 1) * STEP}px`);

    const listY = useTransform(p, inputs, vh);
    const barY = useTransform(p, inputs, px);
    const stageOpacity = useTransform(p, [0, 0.05, 0.85, 1], [0, 1, 1, 0]);
    const barOpacity = useTransform(p, [0, 0.05, 0.85, 1], [0, 1, 1, 0]);
    const ctaOpacity = useTransform(p, [0.85, 0.9], [0, 1]);
    const lift = useTransform(p, [0.85, 0.9], ["0px", `-${STEP}px`]);
    const ctaEvents = useTransform(p, (v) => (v > 0.85 ? "auto" : "none"));
    const plateY = useTransform(p, [0, 1], ["-12%", "12%"]);
    const labelOpacity = useTransform(p, [0, 0.05, 0.85, 0.9], [0, 1, 1, 0]);
    const lineWidth = useTransform(p, [0, 0.85], ["0%", "100%"]);
    const counter = useTransform(p, (v) => `${Math.min(Math.floor(v / unit), count - 1) + 1} / ${count}`);
    useMotionValueEvent(p, "change", (v) => {
        const next = Math.min(Math.floor(v / unit), count - 1);
        setPage((prev) => (prev === next ? prev : next));
    });

    return (
        <div ref={ref} className="relative" style={{ height: `${count * 100}vh` }}>
            <div className={`sticky top-0 z-20 h-screen w-full overflow-hidden ${bg}`}>
                <motion.div style={{ opacity: stageOpacity }}>
                    <div
                        className="pointer-events-none absolute inset-0 z-[5]"
                        style={{ background: "radial-gradient(circle at center, transparent 20%, color-mix(in srgb, var(--f-bg) 80%, transparent) 100%)" }}
                    />
                    <motion.div className="absolute h-full w-full will-change-transform" style={{ y: listY }} aria-hidden="true">
                        {items.map((it, i) => (
                            <SliderPlate key={it.key} item={it} index={i} y={plateY} />
                        ))}
                    </motion.div>
                </motion.div>

                <div className="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center">
                    <motion.div style={{ y: lift }} className="flex flex-col items-center will-change-transform">
                        <motion.div
                            style={{
                                opacity: barOpacity,
                                background: "var(--f-fg)",
                                color: "var(--f-bg)",
                                height: STEP,
                                boxShadow: "0 50px 120px -30px rgba(0,0,0,0.6)",
                            }}
                            className="relative w-[88vw] max-w-[1400px] overflow-hidden"
                        >
                            <div className="absolute left-1/2 top-0 z-10 hidden h-full w-[min(440px,36%)] -translate-x-1/2 overflow-hidden md:block">
                                <motion.div style={{ y: barY }} className="relative h-full w-full" aria-hidden="true">
                                    {items.map((it, i) => (
                                        <div key={it.key} className="absolute flex h-full w-full items-center justify-center py-3" style={{ top: i * STEP }}>
                                            <div className="flex h-full w-full flex-col justify-between rounded-sm bg-[var(--f-btn-fg)] p-4 text-[color:var(--f-btn-bg)]">
                                                <span className={`${mono} text-[10px] font-bold`}>{it.category}</span>
                                                <span className={`${display} text-7xl leading-none`}>{String(i + 1).padStart(2, "0")}</span>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                            <div className="absolute inset-0 z-[5]">
                                <motion.div style={{ y: barY }} className="relative h-full w-full">
                                    {items.map((it, i) => (
                                        <div
                                            key={it.key}
                                            aria-hidden={i === page ? undefined : "true"}
                                            className="absolute flex h-full w-full flex-col justify-between px-[3.5%] py-8 uppercase"
                                            style={{ top: i * STEP }}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <p className="text-[10px] font-extrabold tracking-[0.2em]">{String(i + 1).padStart(2, "0")}</p>
                                                <h4 className="max-w-[60%] text-right text-lg font-medium leading-tight tracking-tight md:max-w-[30%] md:text-2xl">{it.title}</h4>
                                            </div>
                                            <div className="flex items-start justify-between gap-4 text-[10px] font-bold tracking-[0.2em] opacity-60">
                                                <p>{it.category}</p>
                                                <p className="tabular-nums">{it.year}</p>
                                            </div>
                                            <div className="flex items-end justify-between gap-4">
                                                <p className="line-clamp-3 max-w-[55%] text-[10px] font-medium lowercase leading-relaxed opacity-80 md:max-w-[30%]">{it.desc}</p>
                                                <a
                                                    href={it.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    tabIndex={i === page ? 0 : -1}
                                                    className={`pointer-events-auto group/link text-right text-[10px] font-medium tracking-[0.1em] opacity-60 transition-opacity duration-300 hover:opacity-100 ${focusRing}`}
                                                >
                                                    <span className="border-b border-current pb-1">{it.live ? "Open live site" : "View on GitHub"}</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>

                        <div className="flex h-[200px] w-full items-center justify-center pt-10">
                            <motion.div style={{ opacity: ctaOpacity, pointerEvents: ctaEvents }} className="flex items-center gap-4">
                                <a
                                    href={github}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="GitHub profile"
                                    aria-label="GitHub profile"
                                    className={`flex h-14 w-14 items-center justify-center rounded-full bg-[var(--f-btn-bg)] text-[color:var(--f-btn-fg)] shadow-xl transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:bg-[#d4ff3a] hover:text-[#111] active:scale-95 ${focusRing}`}
                                >
                                    <LuGithub className="h-6 w-6" />
                                </a>
                                <div className="group/more flex items-center gap-2">
                                    <button
                                        onClick={onViewAll}
                                        className={`rounded-full bg-[var(--f-btn-bg)] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.08em] text-[color:var(--f-btn-fg)] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:scale-105 group-hover/more:bg-[#d4ff3a] group-hover/more:text-[#111] group-hover/more:shadow-[0_0_30px_rgba(212,255,58,0.3)] active:scale-95 ${focusRing}`}
                                    >
                                        View all projects
                                    </button>
                                    <button
                                        onClick={onViewAll}
                                        aria-label="View all projects"
                                        tabIndex={-1}
                                        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--f-btn-bg)] text-xl text-[color:var(--f-btn-fg)] shadow-xl transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:scale-110 group-hover/more:bg-[#d4ff3a] group-hover/more:text-[#111]"
                                    >
                                        <span className="transition-transform group-hover/more:-translate-y-0.5 group-hover/more:translate-x-0.5">↗</span>
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                <motion.div style={{ opacity: labelOpacity }} className="absolute bottom-10 left-[5%] z-[110] flex items-center gap-4 md:gap-6">
                    <span className={`${mono} text-[10px] opacity-40`}>Page</span>
                    <div className="relative h-px w-[140px] bg-[color:var(--f-line)]">
                        <motion.div className="absolute left-0 top-0 h-full bg-[color:var(--f-fg)] will-change-[width]" style={{ width: lineWidth }} />
                    </div>
                    <motion.span className="font-mono text-[11px] font-bold tabular-nums">{counter}</motion.span>
                </motion.div>
                <p className={`${mono} absolute left-[5%] top-20 z-[110] text-[10px] opacity-60`}>Selected work · live from GitHub</p>
            </div>
        </div>
    );
};

const ProjectList: React.FC<{ repos: Repo[]; status: "loading" | "ready" | "error"; liveCount: number; github: string }> = ({
    repos,
    status,
    liveCount,
    github,
}) => {
    const reduce = !!useReducedMotion();
    const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
    const [showAll, setShowAll] = useState(false);
    const [hover, setHover] = useState<number | null>(null);
    const card = useRef<HTMLDivElement>(null);
    const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const raf = useRef(0);

    useEffect(
        () => () => {
            if (raf.current) cancelAnimationFrame(raf.current);
        },
        [],
    );

    const tick = () => {
        const s = pos.current;
        s.x += (s.tx - s.x) * 0.15;
        s.y += (s.ty - s.y) * 0.15;
        if (card.current) card.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
        raf.current = Math.abs(s.tx - s.x) > 0.2 || Math.abs(s.ty - s.y) > 0.2 ? requestAnimationFrame(tick) : 0;
    };
    const follow = (e: React.MouseEvent) => {
        if (!canHover || reduce) return;
        const s = pos.current;
        s.tx = Math.max(8, Math.min(e.clientX + 32, window.innerWidth - 308));
        s.ty = Math.max(72, Math.min(e.clientY - 90, window.innerHeight - 220));
        if (hover === null) {
            s.x = s.tx;
            s.y = s.ty;
        }
        if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const items = repos.map(toItem);
    const visible = showAll ? items : items.slice(0, 8);
    const current = hover !== null ? items[hover] : null;

    return (
        <div id="all-projects" className="mx-auto max-w-[1400px] scroll-mt-14 px-4 py-20 sm:px-8 md:py-28">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className={`text-xs font-medium uppercase tracking-[0.18em] ${muted}`}>All work · live from GitHub</p>
                    <h2 className={`${display} mt-3 text-[clamp(56px,10vw,140px)] leading-[0.9]`}>Projects</h2>
                </div>
                {status === "ready" && (
                    <p className={`text-sm tabular-nums ${muted}`}>
                        {repos.length} repositories · {liveCount} live
                    </p>
                )}
            </div>

            <div className={`border-t ${line}`} onMouseMove={follow} onMouseLeave={() => setHover(null)}>
                {status === "loading" && <p className={`py-10 ${muted}`}>Loading projects…</p>}
                {status === "error" && (
                    <p className={`py-10 ${muted}`}>
                        Couldn't reach GitHub right now.{" "}
                        <a href={github} target="_blank" rel="noreferrer" className="underline">
                            View on GitHub ↗
                        </a>
                    </p>
                )}
                {visible.map((it, i) => (
                    <a
                        key={it.key}
                        href={it.url}
                        target="_blank"
                        rel="noreferrer"
                        title={it.live ? "Open live site" : "Open on GitHub"}
                        onMouseEnter={() => setHover(i)}
                        onFocus={() => setHover(null)}
                        className={`group relative grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-4 gap-y-1 overflow-hidden border-b py-6 transition-colors hover:bg-[var(--f-hover)] md:grid-cols-[4rem_1fr_9rem_5rem_2rem] md:gap-x-6 md:py-8 ${line} ${focusRing}`}
                    >
                        <span
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[color:var(--f-accent)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                            aria-hidden="true"
                        />
                        <span className={`text-sm tabular-nums transition-colors group-hover:text-[color:var(--f-accent)] ${muted}`}>{String(i + 1).padStart(2, "0")}</span>
                        <div className="min-w-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-4">
                            <h3 className={`${display} flex flex-wrap items-center gap-x-3 gap-y-1 text-3xl leading-none sm:text-4xl md:text-5xl`}>
                                <span className="break-words">{it.title}</span>
                                {it.live && (
                                    <span className="rounded-full bg-[var(--f-btn-bg)] px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--f-btn-fg)]">
                                        Live
                                    </span>
                                )}
                            </h3>
                            <p className={`mt-2 line-clamp-1 text-sm ${muted}`}>{it.desc}</p>
                        </div>
                        <span className={`hidden text-sm md:block ${muted}`}>{it.category}</span>
                        <span className={`hidden text-sm tabular-nums md:block ${muted}`}>{it.year}</span>
                        <span
                            className="justify-self-end text-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-[10deg] group-hover:text-[color:var(--f-accent)]"
                            aria-hidden="true"
                        >
                            ↗
                        </span>
                    </a>
                ))}
            </div>
            {repos.length > 8 && (
                <button
                    onClick={() => setShowAll((s) => !s)}
                    className={`mt-8 inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--f-hover)] ${line} ${focusRing}`}
                >
                    {showAll ? "Show fewer" : `Show all ${repos.length} projects`}
                </button>
            )}

            {/* Cursor-following preview card (fine-pointer devices only) */}
            {canHover && !reduce && (
                <div ref={card} className="pointer-events-none fixed left-0 top-0 z-[70] w-[300px]" aria-hidden="true">
                    <div
                        className={`origin-top-left rounded-2xl bg-[var(--f-fg)] p-5 text-[color:var(--f-bg)] shadow-2xl transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            current ? "scale-100 opacity-100" : "scale-90 opacity-0"
                        }`}
                    >
                        {current && (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <span className={`${display} text-5xl leading-none`}>{String((hover ?? 0) + 1).padStart(2, "0")}</span>
                                    <span className={`${mono} pt-1 text-[10px] font-bold opacity-60`}>{current.category}</span>
                                </div>
                                <p className="mt-4 text-lg font-semibold leading-tight">{current.title}</p>
                                <p className="mt-2 line-clamp-4 text-xs leading-relaxed opacity-70">{current.desc}</p>
                                <p className={`${mono} mt-4 text-[10px] font-bold`}>{current.live ? "Live site" : "GitHub"} ↗ · {current.year}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ProjectsSection: React.FC<{ repos: Repo[]; status: "loading" | "ready" | "error"; liveCount: number; github: string }> = ({
    repos,
    status,
    liveCount,
    github,
}) => {
    const reduce = !!useReducedMotion();
    const featured = [...repos].sort((a, b) => Number(isFlagship(b)) - Number(isFlagship(a))).slice(0, 5).map(toItem);
    const viewAll = () => document.getElementById("all-projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return (
        <section id="work" className="scroll-mt-14">
            {!reduce && status === "ready" && featured.length >= 2 && <ProjectSlider items={featured} github={github} onViewAll={viewAll} />}
            <ProjectList repos={repos} status={status} liveCount={liveCount} github={github} />
        </section>
    );
};

/* ------------------------------------------------------------------ */
/* Journey: pinned horizontal timeline, line draws with scroll          */
/* ------------------------------------------------------------------ */

const bullets = (description: string): string[] =>
    description
        .split("\n")
        .map((l) => l.replace(/^•\s*/, "").trim())
        .filter(Boolean);

export const JourneyTimeline: React.FC<{ email: string; emailAddress: string }> = ({ email, emailAddress }) => {
    const reduce = !!useReducedMotion();
    const outer = useRef<HTMLDivElement>(null);
    const track = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [trackW, setTrackW] = useState(0);
    const [vw, setVw] = useState(0);
    const [active, setActive] = useState(-1);
    const count = experiences.length + 1; // last node = "what's next"
    const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
    const x = useTransform(scrollYProgress, [0, 1], [0, -Math.max(0, trackW - vw + 200)]);
    const lineOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
    const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    useEffect(() => {
        const measure = () => {
            setVw(window.innerWidth);
            if (track.current) setTrackW(track.current.scrollWidth);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (track.current) ro.observe(track.current);
        window.addEventListener("resize", measure);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, []);

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        const marker = v * window.innerWidth;
        let found = -1;
        for (let i = 0; i < count; i++) {
            const el = itemRefs.current[i];
            if (!el) continue;
            const r = el.getBoundingClientRect();
            const next = itemRefs.current[i + 1];
            const end = next ? next.getBoundingClientRect().left : r.left + r.width;
            if (marker >= r.left && marker < end) {
                found = i;
                break;
            }
        }
        setActive((prev) => (prev === found ? prev : found));
    });

    const heading = (
        <>
            <p className={`text-xs font-medium uppercase tracking-[0.18em] ${muted}`}>Trajectory</p>
            <h2 className={`${display} mt-3 text-[clamp(56px,10vw,140px)] leading-[0.9]`}>Experience</h2>
        </>
    );

    if (reduce) {
        return (
            <section id="experience" className={`scroll-mt-14 border-t ${line}`}>
                <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-8 md:py-28">
                    <div className="mb-12">{heading}</div>
                    <ol className={`relative ml-2 border-l ${line}`}>
                        {experiences.map((exp) => (
                            <li key={exp.role + exp.year} className="relative pb-14 pl-8 last:pb-0 md:pl-12">
                                <span className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-[var(--f-accent)] ring-4 ring-[var(--f-bg)]" aria-hidden="true" />
                                <p className="text-sm font-semibold tabular-nums text-[color:var(--f-accent)]">{exp.year}</p>
                                <h3 className={`${display} mt-2 text-3xl leading-[1.02] md:text-4xl`}>{exp.role}</h3>
                                <p className={`mt-2 text-sm ${muted}`}>{exp.company}</p>
                                <ul className={`mt-4 max-w-3xl space-y-3 text-base leading-relaxed ${muted}`}>
                                    {bullets(exp.description).map((l) => (
                                        <li key={l} className="flex gap-3">
                                            <span className="mt-2.5 h-px w-4 shrink-0 bg-current" aria-hidden="true" />
                                            <span>{l}</span>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="mt-5 flex flex-wrap gap-2">
                                    {exp.technologies.map((t) => (
                                        <li key={t} className={`rounded-full border px-3 py-1 text-xs ${line}`}>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        );
    }

    return (
        <section id="experience" className={`scroll-mt-14 border-t ${line}`}>
            <div ref={outer} className="relative w-full" style={{ height: "400vh" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute left-0 top-20 z-20 w-full px-4 sm:px-8 md:top-28"
                >
                    <div className="mx-auto max-w-[1400px]">
                        {heading}
                        <p className={`mt-5 max-w-xl text-base leading-relaxed md:text-xl ${muted}`}>
                            Roles, research and leadership, in order. Keep scrolling and the line draws itself.
                        </p>
                    </div>
                </motion.div>

                <div className="sticky top-0 z-40 flex h-screen w-full max-w-[100vw] flex-col justify-center overflow-hidden">
                    <div className="relative flex h-full w-full items-center justify-center">
                        <div
                            className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-[color:var(--f-line)]"
                            style={{ maskImage: MASK_EDGES, WebkitMaskImage: MASK_EDGES }}
                            aria-hidden="true"
                        />
                        <motion.div
                            style={{
                                width: lineWidth,
                                opacity: lineOpacity,
                                background: "linear-gradient(to right, var(--f-accent), var(--f-accent) 10%, transparent)",
                            }}
                            className="absolute left-0 top-1/2 z-10 h-[2px] -translate-y-1/2 rounded-full"
                            aria-hidden="true"
                        />
                        <motion.div
                            ref={track}
                            style={{ x }}
                            className="absolute left-0 top-1/2 z-20 flex w-max -translate-y-1/2 flex-row items-center gap-12 px-8 will-change-transform md:gap-24 md:px-32"
                        >
                            {experiences.map((exp, i) => {
                                const up = i % 2 === 0; // even: title/content below the line
                                const on = active === i;
                                const reveal = on ? "opacity-100" : "opacity-0 group-hover:opacity-100";
                                return (
                                    <div
                                        key={exp.role + exp.year}
                                        ref={(el) => {
                                            itemRefs.current[i] = el;
                                        }}
                                        className="group relative h-0 w-[300px] shrink-0 cursor-default md:w-[420px]"
                                    >
                                        <div className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--f-bg)]">
                                            <div
                                                className={`h-4 w-4 rounded-full border transition-all duration-500 ${
                                                    on
                                                        ? "scale-125 border-[color:var(--f-accent)] bg-[var(--f-accent)]"
                                                        : "border-[color:var(--f-line)] bg-[var(--f-hover)] group-hover:scale-125 group-hover:border-[color:var(--f-accent)] group-hover:bg-[var(--f-accent)]"
                                                }`}
                                            />
                                        </div>
                                        <div className={`absolute left-8 z-20 w-[260px] transition-all duration-500 md:w-[350px] ${up ? "top-4" : "bottom-4"}`}>
                                            <h3
                                                className={`${display} text-xl leading-tight transition-all duration-500 md:text-2xl ${
                                                    on ? "translate-x-2 opacity-0" : "opacity-80 group-hover:translate-x-2 group-hover:opacity-0"
                                                }`}
                                            >
                                                {exp.role}
                                            </h3>
                                        </div>
                                        <div
                                            className={`pointer-events-none absolute left-8 z-20 transition-all duration-500 ${up ? "bottom-4" : "top-4"} ${reveal}`}
                                        >
                                            <span className={`inline-block rounded-md border px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest md:text-xs ${bg} ${line} ${muted}`}>
                                                {exp.year}
                                            </span>
                                        </div>
                                        <div
                                            className={`absolute left-8 z-30 w-[260px] pr-2 transition-all duration-500 ease-out md:w-[350px] ${up ? "top-2" : "bottom-2"} ${
                                                on ? "translate-y-0 opacity-100" : `pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 ${up ? "-translate-y-4" : "translate-y-4"}`
                                            }`}
                                        >
                                            <h3 className={`${display} text-xl leading-tight md:text-3xl`}>{exp.role}</h3>
                                            <p className={`mt-1 text-xs md:text-sm ${muted}`}>{exp.company}</p>
                                            <ul className={`mt-3 space-y-2 text-[12px] leading-snug md:text-[13px] ${muted}`}>
                                                {bullets(exp.description)
                                                    .slice(0, 2)
                                                    .map((l) => (
                                                        <li key={l} className="line-clamp-3">
                                                            {l}
                                                        </li>
                                                    ))}
                                            </ul>
                                            <ul className="mt-3 flex flex-wrap gap-1.5">
                                                {exp.technologies.slice(0, 4).map((t) => (
                                                    <li key={t} className={`rounded-full border px-2.5 py-0.5 text-[10px] ${line}`}>
                                                        {t}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                            <div
                                ref={(el) => {
                                    itemRefs.current[experiences.length] = el;
                                }}
                                className="group relative h-0 w-[300px] shrink-0 md:w-[420px]"
                            >
                                <div className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--f-bg)]">
                                    <div
                                        className={`h-4 w-4 rounded-full border border-[color:var(--f-accent)] bg-[var(--f-accent)] transition-transform duration-500 ${
                                            active === experiences.length ? "scale-125" : ""
                                        }`}
                                    />
                                </div>
                                <div className="absolute left-8 top-1/2 z-30 w-[260px] -translate-y-1/2 md:w-[350px]">
                                    <p className={`${mono} text-[10px] font-bold text-[color:var(--f-accent)]`}>Next</p>
                                    <h3 className={`${display} mt-2 text-3xl leading-[0.98] md:text-5xl`}>Your team?</h3>
                                    <a href={email} className={`mt-4 inline-block text-sm underline underline-offset-4 hover:text-[color:var(--f-accent)] ${focusRing}`}>
                                        {emailAddress}
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ------------------------------------------------------------------ */
/* Contact: velocity-driven crossed ribbons, cycling word, magnetic CTA */
/* ------------------------------------------------------------------ */

const RIBBON_ONE = "Python • TypeScript • React • Node.js • PyTorch • CrewAI • AWS Bedrock • Wazuh • PostgreSQL • Docker •";
const RIBBON_TWO = "GenAI Engineer • Security Engineer • Software Engineer • Full Stack Developer • Open to opportunities •";
const CYCLE_WORDS = ["intelligent", "secure", "scalable", "dependable"];

const Ribbon: React.FC<{
    text: string;
    rotation: number;
    baseVelocity: number;
    reverse?: boolean;
    className: string;
    reduce: boolean;
    slow: boolean;
}> = ({ text, rotation, baseVelocity, reverse, className, reduce, slow }) => {
    const base = useMotionValue(reverse ? -50 : 0);
    const { scrollY } = useScroll();
    const velocity = useVelocity(scrollY);
    const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
    const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
    const x = useTransform(base, (v) => `${((((v + 50) % 50) + 50) % 50) - 50}%`);
    useAnimationFrame((_, delta) => {
        if (reduce || slow) return;
        let move = (delta / 1000) * baseVelocity;
        if (reverse) move = -move;
        move += move * factor.get();
        base.set(base.get() - move);
    });
    const css = slow && !reduce;
    return (
        <div
            className={`absolute left-1/2 top-1/2 w-[200vw] overflow-hidden whitespace-nowrap py-4 opacity-95 ${className}`}
            style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)`, transformOrigin: "center center" }}
            aria-hidden="true"
        >
            <motion.div
                className="flex w-max items-center whitespace-nowrap text-sm font-bold uppercase tracking-widest"
                style={css || reduce ? undefined : { x }}
                animate={css ? { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] } : undefined}
                transition={css ? { duration: 60, ease: "linear", repeat: Infinity } : undefined}
            >
                {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="flex items-center pr-10">
                        {text}
                        <span className="ml-10 h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

const MagneticButton: React.FC<{ href: string; label: string; primary?: boolean; external?: boolean }> = ({ href, label, primary, external }) => {
    const [hovered, setHovered] = useState(false);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const x = useSpring(mx, { stiffness: 150, damping: 15, mass: 0.1 });
    const y = useSpring(my, { stiffness: 150, damping: 15, mass: 0.1 });
    return (
        <motion.a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            style={{ x, y }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                mx.set((e.clientX - (r.left + r.width / 2)) * 0.3);
                my.set((e.clientY - (r.top + r.height / 2)) * 0.3);
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                setHovered(false);
                mx.set(0);
                my.set(0);
            }}
            className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 px-9 py-4 text-base font-bold shadow-xl ${focusRing} ${
                primary ? "border-[color:var(--f-btn-bg)] bg-[var(--f-btn-bg)] text-[color:var(--f-btn-fg)]" : "border-[color:var(--f-line)] bg-transparent"
            }`}
        >
            <motion.span
                className="absolute inset-0 z-0 rounded-full"
                style={{ background: primary ? "var(--f-bg)" : "var(--f-fg)" }}
                initial={{ y: "100%", borderRadius: "50% 50% 0 0" }}
                animate={{ y: hovered ? "0%" : "100%", borderRadius: hovered ? "0% 0% 0 0" : "50% 50% 0 0" }}
                transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                aria-hidden="true"
            />
            <span
                className={`relative z-10 transition-colors duration-300 ${
                    hovered ? (primary ? "text-[color:var(--f-fg)]" : "text-[color:var(--f-bg)]") : ""
                }`}
            >
                {label}
            </span>
        </motion.a>
    );
};

const MagneticWord: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const x = useSpring(mx, { stiffness: 120, damping: 16, mass: 0.2 });
    const y = useSpring(my, { stiffness: 120, damping: 16, mass: 0.2 });
    const [on, setOn] = useState(false);
    return (
        <motion.a
            href={href}
            aria-label={label}
            style={{ x, y, WebkitTextStroke: on ? "2px var(--f-accent)" : "2px var(--f-fg)" }}
            onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                mx.set((e.clientX - (r.left + r.width / 2)) * 0.06);
                my.set((e.clientY - (r.top + r.height / 2)) * 0.1);
            }}
            onMouseEnter={() => setOn(true)}
            onMouseLeave={() => {
                setOn(false);
                mx.set(0);
                my.set(0);
            }}
            className={`${display} mt-4 block w-max max-w-full text-[clamp(56px,16vw,240px)] leading-[0.9] transition-[color] duration-500 ${
                on ? "text-[color:var(--f-accent)]" : "text-transparent"
            } ${focusRing}`}
        >
            {children}
        </motion.a>
    );
};

export interface ContactProps {
    email: string;
    emailAddress: string;
    resume: string;
    socials: { label: string; href: string }[];
    onTop: () => void;
}

export const ContactSection: React.FC<ContactProps> = ({ email, emailAddress, resume, socials, onTop }) => {
    const reduce = !!useReducedMotion();
    const slow = useMediaQuery("(max-width: 768px)");
    const [word, setWord] = useState(0);
    useEffect(() => {
        if (reduce) return;
        const id = window.setInterval(() => setWord((w) => (w + 1) % CYCLE_WORDS.length), 2500);
        return () => window.clearInterval(id);
    }, [reduce]);

    return (
        <section id="contact" className={`relative scroll-mt-14 overflow-hidden border-t ${line}`}>
            <div className="pointer-events-none relative mt-8 h-[300px] w-full">
                <Ribbon
                    text={RIBBON_ONE}
                    rotation={6}
                    baseVelocity={1}
                    reduce={reduce}
                    slow={slow}
                    className={`z-10 border-y font-mono tracking-tighter text-[color:var(--f-muted)] shadow-xl ${bg} ${line}`}
                />
                <Ribbon
                    text={RIBBON_TWO}
                    rotation={-6}
                    baseVelocity={1.2}
                    reverse
                    reduce={reduce}
                    slow={slow}
                    className="z-20 bg-[var(--f-btn-bg)] text-[color:var(--f-btn-fg)] shadow-2xl"
                />
            </div>

            <motion.div
                initial={reduce ? false : { y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1 }}
                className="mx-auto max-w-[1400px] px-4 pt-12 pb-10 sm:px-8 md:pt-20"
            >
                <p className={`text-xs font-medium uppercase tracking-[0.18em] ${muted}`}>Contact</p>
                <MagneticWord href={email} label={`Email ${emailAddress}`}>
                    Let's talk.
                </MagneticWord>
                <p className="mt-8 flex flex-wrap items-baseline gap-x-3 text-2xl leading-tight md:text-4xl">
                    <span>Let's build something</span>
                    <span className="inline-grid place-items-start">
                        <span className={`${display} invisible col-start-1 row-start-1 text-[color:var(--f-accent)]`} aria-hidden="true">
                            {CYCLE_WORDS.reduce((a, b) => (a.length > b.length ? a : b), "")}
                        </span>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={CYCLE_WORDS[word]}
                                initial={reduce ? false : { y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -30, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`${display} col-start-1 row-start-1 inline-block text-[color:var(--f-accent)]`}
                            >
                                {CYCLE_WORDS[word]}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                    <span>together.</span>
                </p>
                <p className={`mt-6 max-w-xl text-lg leading-relaxed ${muted}`}>
                    Looking for software engineering opportunities where I can build real products. The fastest way to reach me is email.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-5">
                    <MagneticButton href={email} label={emailAddress} primary />
                    <MagneticButton href={resume} label="View résumé" external />
                </div>

                <div className={`mt-20 flex flex-col gap-4 border-t pt-6 text-xs md:flex-row md:items-center md:justify-between ${line} ${muted}`}>
                    <p>© {new Date().getFullYear()} Pulkit Tiwari · Dehradun, India</p>
                    <ul className="flex flex-wrap gap-x-5 gap-y-2">
                        {socials.map((s) => (
                            <li key={s.label}>
                                <a href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-[color:var(--f-fg)] hover:underline">
                                    {s.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a href={resume} target="_blank" rel="noreferrer" className="transition-colors hover:text-[color:var(--f-fg)] hover:underline">
                                Résumé
                            </a>
                        </li>
                    </ul>
                    <button onClick={onTop} className={`self-start transition-colors hover:text-[color:var(--f-fg)] md:self-auto ${focusRing}`}>
                        Back to top ↑
                    </button>
                </div>
            </motion.div>
        </section>
    );
};

/* ------------------------------------------------------------------ */
/* Page-wide: click sparks + magnetic back-to-top button                */
/* ------------------------------------------------------------------ */

interface Spark {
    x: number;
    y: number;
    angle: number;
    start: number;
}

const SPARKS = 8;
const SPARK_MS = 400;

const ClickSpark: React.FC = () => {
    const canvas = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const el = canvas.current;
        const ctx = el?.getContext("2d");
        if (!el || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let sparks: Spark[] = [];
        let raf = 0;
        const resize = () => {
            el.width = window.innerWidth;
            el.height = window.innerHeight;
        };
        const draw = (now: number) => {
            ctx.clearRect(0, 0, el.width, el.height);
            ctx.strokeStyle = getComputedStyle(el).color;
            ctx.lineWidth = 2;
            sparks = sparks.filter((s) => {
                const t = (now - s.start) / SPARK_MS;
                if (t >= 1) return false;
                const eased = t * (2 - t);
                const dist = eased * 15;
                const len = 10 * (1 - eased);
                ctx.beginPath();
                ctx.moveTo(s.x + dist * Math.cos(s.angle), s.y + dist * Math.sin(s.angle));
                ctx.lineTo(s.x + (dist + len) * Math.cos(s.angle), s.y + (dist + len) * Math.sin(s.angle));
                ctx.stroke();
                return true;
            });
            raf = sparks.length ? requestAnimationFrame(draw) : 0;
        };
        const onClick = (e: MouseEvent) => {
            const now = performance.now();
            for (let i = 0; i < SPARKS; i++) sparks.push({ x: e.clientX, y: e.clientY, angle: (2 * Math.PI * i) / SPARKS, start: now });
            if (!raf) raf = requestAnimationFrame(draw);
        };
        resize();
        window.addEventListener("resize", resize);
        document.addEventListener("click", onClick);
        return () => {
            window.removeEventListener("resize", resize);
            document.removeEventListener("click", onClick);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);
    return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] h-full w-full text-[color:var(--f-fg)]" />;
};

const BackToTop: React.FC<{ onTop: () => void }> = ({ onTop }) => {
    const [show, setShow] = useState(false);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const x = useSpring(mx, { stiffness: 120, damping: 14, mass: 0.1 });
    const y = useSpring(my, { stiffness: 120, damping: 14, mass: 0.1 });
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", (v) => setShow(v > 100));
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-3 right-3 z-[100] flex h-24 w-24 items-center justify-center"
                    onMouseMove={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        mx.set((e.clientX - (r.left + r.width / 2)) * 0.35);
                        my.set((e.clientY - (r.top + r.height / 2)) * 0.35);
                    }}
                    onMouseLeave={() => {
                        mx.set(0);
                        my.set(0);
                    }}
                >
                    <motion.button
                        style={{ x, y }}
                        onClick={onTop}
                        aria-label="Back to top"
                        className={`flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--f-line)] bg-[var(--f-fg)] text-[color:var(--f-bg)] shadow-2xl ${focusRing}`}
                    >
                        <LuArrowUp className="h-5 w-5" />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const FrameGlobalFx: React.FC<{ onTop: () => void }> = ({ onTop }) => (
    <>
        <ClickSpark />
        <BackToTop onTop={onTop} />
    </>
);
