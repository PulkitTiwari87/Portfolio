import React, { useRef, useState } from "react";
import { clamp, useFrameScroll, useInView, useReducedMotion } from "./hooks";

// Effects for the top half of the "Frame" page, rebuilt from what the reference
// site does: curtain preloader with a drawn signature, line-by-line title rise
// with a shimmer sweep, floating social icons, spotlight + dot-grid backdrop,
// colour-wipe headline + count-up stats, and a scroll-pinned About panel.
// All motion is transform/opacity (plus a few paint-only properties) and has a
// prefers-reduced-motion fallback at the bottom of FRAME_FX_CSS.

const DISPLAY = "font-['Anton',Impact,'Arial_Narrow',sans-serif] font-normal uppercase";
const EASE_OUT = "cubic-bezier(.16,1,.3,1)";

const FRAME_FX_CSS = `
.frame-rise{opacity:0;transform:translate3d(0,30px,0);transition:opacity 1.2s ${EASE_OUT} var(--d,0s),transform 1.2s ${EASE_OUT} var(--d,0s)}
.frame-rise.frame-rise-l{transform:translate3d(-20px,0,0);transition-duration:.8s}
.frame-rise.frame-rise-r{transform:translate3d(20px,0,0);transition-duration:.8s}
.frame-ready .frame-rise{opacity:1;transform:none}
.frame-main{opacity:0;transform:translate3d(0,40px,0);transition:opacity .8s ${EASE_OUT},transform 1.4s ${EASE_OUT}}
.frame-ready .frame-main{opacity:1;transform:none}

.frame-preloader{transition:transform 1.2s cubic-bezier(.7,0,.3,1)}
.frame-preloader[data-exiting="true"]{transform:translate3d(0,-100%,0)}
.frame-sign-wrap{animation:frame-sign-in .6s ${EASE_OUT} both}
.frame-preloader[data-exiting="true"] .frame-sign-wrap{opacity:0;transform:translate3d(0,-40px,0);transition:opacity .6s ease,transform .6s ease}
@keyframes frame-sign-in{from{opacity:0;transform:translate3d(0,20px,0)}to{opacity:1;transform:none}}
.frame-draw{stroke-dasharray:1 1;animation:frame-draw var(--dur,1s) cubic-bezier(.42,0,.58,1) var(--dl,0s) both}
@keyframes frame-draw{0%{stroke-dashoffset:1;opacity:0}1%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}
.frame-dot{animation:frame-dot 2s ease-in-out infinite}
@keyframes frame-dot{0%,100%{opacity:.2}50%{opacity:.5}}

.frame-shiny{color:transparent;-webkit-text-fill-color:transparent;background-image:linear-gradient(120deg,var(--f-fg) 30%,color-mix(in srgb,var(--f-fg) 40%,var(--f-bg)) 50%,var(--f-fg) 70%);background-size:200%;-webkit-background-clip:text;background-clip:text;animation:frame-shiny 4s linear infinite}
@keyframes frame-shiny{0%{background-position:200%}100%{background-position:-200%}}
.frame-outline{color:transparent;-webkit-text-stroke:1.5px var(--f-fg);transition:-webkit-text-stroke-color .3s}
@media (min-width:1024px){.frame-outline{-webkit-text-stroke-width:2.5px}}
.frame-outline-line:hover .frame-outline{-webkit-text-stroke-color:var(--f-accent)}

.frame-float-a{animation:frame-float-up 2s ease-in-out 1.2s infinite alternate both}
.frame-float-b{animation:frame-float-down 2.5s ease-in-out 1.3s infinite alternate both}
.frame-float-c{animation:frame-float-right 3s ease-in-out 1.4s infinite alternate both}
@keyframes frame-float-up{to{transform:translate3d(0,-10px,0)}}
@keyframes frame-float-down{to{transform:translate3d(0,10px,0)}}
@keyframes frame-float-right{to{transform:translate3d(10px,0,0)}}
.frame-pulse{animation:frame-pulse .6s ease-in-out infinite alternate}
@keyframes frame-pulse{to{transform:scale(1.2)}}
.frame-sway{animation:frame-sway 1.8s ease-in-out infinite alternate}
@keyframes frame-sway{to{transform:translate3d(0,-10px,0) rotate(8deg)}}
.frame-tip{animation:frame-tip .2s ${EASE_OUT} both}
@keyframes frame-tip{from{opacity:0;scale:.8}to{opacity:1;scale:1}}

.frame-spot-l{animation:frame-spot-l 10s ease-in-out infinite alternate}
.frame-spot-r{animation:frame-spot-r 10s ease-in-out infinite alternate}
@keyframes frame-spot-l{to{transform:translate3d(120px,0,0)}}
@keyframes frame-spot-r{to{transform:translate3d(-120px,0,0)}}
.frame-bob{display:inline-block;animation:frame-bob 1.5s ease-in-out infinite}
@keyframes frame-bob{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,5px,0)}}

.frame-wipe-text{opacity:0}
.frame-wipe-bar{clip-path:inset(0 100% 0 0)}
[data-in="true"] .frame-wipe-text{opacity:1;transition:opacity .01s linear var(--d,0s)}
[data-in="true"] .frame-wipe-bar{animation:frame-wipe-a .75s cubic-bezier(.85,0,.15,1) var(--wd,0s) both}
[data-in="true"] .frame-wipe-bar.frame-wipe-rev{animation-name:frame-wipe-b}
@keyframes frame-wipe-a{0%{clip-path:inset(0 100% 0 0)}45%,55%{clip-path:inset(0 0 0 0)}100%{clip-path:inset(0 0 0 100%)}}
@keyframes frame-wipe-b{0%{clip-path:inset(0 0 0 100%)}45%,55%{clip-path:inset(0 0 0 0)}100%{clip-path:inset(0 100% 0 0)}}

.frame-about-panel{transform:translate3d(0,60vh,0) scale(.8);border-radius:60px;transform-origin:50% 100%}
.frame-about-track{animation:frame-about-scroll 18s linear infinite}
@keyframes frame-about-scroll{to{transform:translate3d(-50%,0,0)}}
.frame-photo{filter:grayscale(1) contrast(1.1);transition:filter .8s ease-out}
.frame-photo:hover{filter:none}
.frame-char{display:inline-block;opacity:0;transform:translate3d(0,12px,0);filter:blur(4px)}
[data-on="true"] .frame-char{opacity:1;transform:none;filter:blur(0);transition:opacity .5s ${EASE_OUT} var(--d,0s),transform .5s ${EASE_OUT} var(--d,0s),filter .5s ${EASE_OUT} var(--d,0s)}

::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}

@media (prefers-reduced-motion:reduce){
  .frame-rise,.frame-main{opacity:1!important;transform:none!important;transition:none!important}
  .frame-float-a,.frame-float-b,.frame-float-c,.frame-pulse,.frame-sway,.frame-spot-l,.frame-spot-r,.frame-bob,.frame-dot,.frame-about-track,.frame-tip{animation:none!important}
  .frame-shiny{animation:none;background-image:none;color:var(--f-fg);-webkit-text-fill-color:currentColor}
  .frame-wipe-bar{display:none}
  .frame-wipe-text{opacity:1!important}
  .frame-char{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}
}
`;

export const FrameFxStyles: React.FC = () => <style>{FRAME_FX_CSS}</style>;

// ---- preloader: a signature drawn stroke by stroke, then the curtain lifts ----
const SIGN_PATHS = [
    { d: "M62 146 C66 108 72 66 82 28 C116 18 150 28 148 58 C146 88 108 98 72 90", dur: ".7s", dl: "0s" },
    { d: "M178 44 C214 38 252 38 292 44 M236 42 C234 86 226 118 214 142 C208 154 194 152 192 142", dur: "1s", dl: ".45s" },
    { d: "M22 150 C110 128 232 164 378 118", dur: "1s", dl: "1.2s" },
];

export const FramePreloader: React.FC<{ exiting: boolean }> = ({ exiting }) => (
    <div
        aria-hidden="true"
        data-exiting={exiting}
        className="frame-preloader fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--f-bg)]"
    >
        <div className="frame-sign-wrap">
            <svg
                viewBox="0 0 400 170"
                fill="none"
                stroke="currentColor"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-20 text-[color:var(--f-fg)] sm:h-24 md:h-28"
            >
                {SIGN_PATHS.map((p) => (
                    <path key={p.d} d={p.d} pathLength={1} className="frame-draw" style={{ "--dur": p.dur, "--dl": p.dl } as React.CSSProperties} />
                ))}
            </svg>
        </div>
        <span className="frame-dot absolute bottom-12 h-1.5 w-1.5 rounded-full bg-[var(--f-fg)]" />
    </div>
);

// ---- hero backdrop: dot grid + two swinging spotlight beams ---------------------
const beam = (w: number, tf: string, alpha: number, side: "left-0" | "right-0", origin?: string): React.CSSProperties => ({
    width: w,
    height: 1380,
    transform: tf,
    transformOrigin: origin,
    background: `radial-gradient(50% 50% at 50% 50%, rgb(var(--f-spot) / ${alpha}) 0, rgb(var(--f-spot) / ${alpha / 4}) 80%, transparent 100%)`,
    ...(side === "left-0" ? { left: 0 } : { right: 0 }),
});

export const HeroBackdrop: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
    <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ "--f-spot": isDarkMode ? "255 255 255" : "17 17 17" } as React.CSSProperties}
    >
        <div
            className="absolute inset-0 opacity-40"
            style={{
                backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--f-fg) 35%, transparent) 0.75px, transparent 0.75px)",
                backgroundSize: "24px 24px",
            }}
        />
        <div className="frame-spot-l absolute inset-0">
            <div className="absolute top-0" style={beam(560, "translateY(-300px) rotate(-45deg)", isDarkMode ? 0.14 : 0.07, "left-0")} />
            <div className="absolute top-0" style={beam(240, "rotate(-45deg) translate(5%, -50%)", isDarkMode ? 0.1 : 0.05, "left-0", "top left")} />
        </div>
        <div className="frame-spot-r absolute inset-0">
            <div className="absolute top-0" style={beam(560, "translateY(-300px) rotate(45deg)", isDarkMode ? 0.14 : 0.07, "right-0")} />
            <div className="absolute top-0" style={beam(240, "rotate(45deg) translate(-5%, -50%)", isDarkMode ? 0.1 : 0.05, "right-0", "top right")} />
        </div>
    </div>
);

// ---- icon inside the headline with a cursor-following label ----------------------
export const TitleIcon: React.FC<{
    label: string;
    href?: string;
    onClick?: () => void;
    className: string;
    children: React.ReactNode;
}> = ({ label, href, onClick, className, children }) => {
    const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
    const move = (e: React.MouseEvent) => setTip({ x: e.clientX, y: e.clientY });
    const shared = {
        onMouseEnter: move,
        onMouseMove: move,
        onMouseLeave: () => setTip(null),
        "aria-label": label,
        className,
    };
    return (
        <>
            {href ? (
                <a href={href} {...shared}>
                    {children}
                </a>
            ) : (
                <button type="button" onClick={onClick} {...shared}>
                    {children}
                </button>
            )}
            {tip && (
                <span
                    aria-hidden="true"
                    className="frame-tip pointer-events-none fixed z-[100] rounded-full bg-[var(--f-fg)] px-4 py-2 font-sans text-sm font-bold normal-case tracking-normal text-[color:var(--f-bg)] shadow-2xl"
                    style={{ left: tip.x, top: tip.y, transform: "translate(-50%,-150%)", WebkitTextStroke: 0 }}
                >
                    {label}
                </span>
            )}
        </>
    );
};

// ---- circular resume button that widens on hover ---------------------------------
export const ResumePill: React.FC<{ href: string; label: string }> = ({ href, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        className="group relative flex h-12 w-44 items-center overflow-hidden rounded-full bg-[var(--f-btn-bg)] text-[color:var(--f-btn-fg)] shadow-xl transition-[width] duration-500 ease-[cubic-bezier(.23,1,.32,1)] focus-visible:w-44 sm:w-12 sm:hover:w-44 sm:focus-visible:w-44"
    >
        <span className="whitespace-nowrap pl-6 pr-12 text-[10px] font-black uppercase tracking-widest opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:delay-150 sm:group-focus-visible:opacity-100">
            {label}
        </span>
        <span className="absolute right-0 flex h-12 w-12 items-center justify-center text-xl transition-transform duration-500 group-hover:rotate-45">
            <span aria-hidden="true">↗</span>
        </span>
    </a>
);

// ---- left-edge "available" tab that slides open into a small profile card ---------
export const AvailableTab: React.FC<{
    photo: string;
    name: string;
    role: string;
    blurb: string;
    links: { label: string; href: string; icon: React.ReactNode }[];
}> = ({ photo, name, role, blurb, links }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 items-center lg:flex"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
        >
            <button
                type="button"
                aria-expanded={open}
                className="rounded-r-3xl bg-[var(--f-fg)] px-8 py-2.5 text-[9px] font-black uppercase tracking-[0.5em] text-[color:var(--f-bg)] shadow-2xl transition-transform duration-300 hover:translate-x-2.5 focus-visible:translate-x-2.5 [writing-mode:vertical-rl]"
            >
                Available for opportunity
            </button>
            <div
                className={`ml-4 w-[22rem] origin-left rounded-[2rem] border bg-[var(--f-bg)] p-5 shadow-2xl transition-[transform,opacity] duration-500 border-[color:var(--f-line)] ${
                    open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(.22,1,.36,1)" }}
            >
                <div className="flex items-center gap-4">
                    <img src={photo} alt="" className="h-16 w-16 rounded-2xl object-cover object-[50%_20%]" />
                    <div>
                        <p className="font-semibold leading-tight">{name}</p>
                        <p className="mt-1 text-xs text-[color:var(--f-muted)]">{role}</p>
                    </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--f-muted)]">{blurb}</p>
                <div className="mt-4 flex gap-3">
                    {links.map((l) => (
                        <a
                            key={l.label}
                            href={l.href}
                            target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                            rel="noreferrer"
                            aria-label={l.label}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--f-fg)] text-[color:var(--f-bg)] transition-transform hover:scale-110"
                        >
                            {l.icon}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ---- stats intro: pill with a pinging dot + headline lines wiped in by colour bars -----
export const StatsIntro: React.FC<{ lines: string[] }> = ({ lines }) => {
    const ref = useRef<HTMLDivElement>(null);
    const seen = useInView(ref, "-20px");
    return (
        <div ref={ref} data-in={seen} className="mx-auto max-w-[1400px] px-4 pt-20 text-center sm:px-8 md:pt-28">
            <div className="mb-8 flex justify-center">
                <span className="inline-flex items-center gap-2.5 rounded-full border border-[color:var(--f-line)] px-5 py-1.5 text-xs font-semibold uppercase tracking-wider">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--f-accent)] opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--f-accent)]" />
                    </span>
                    By the numbers
                </span>
            </div>
            <h2 className="mx-auto max-w-5xl space-y-1">
                {lines.map((text, i) => {
                    const delay = i * 0.15;
                    return (
                        <span key={text} className="relative block overflow-hidden py-1.5">
                            <span
                                className={`${DISPLAY} frame-wipe-text block text-[clamp(30px,5.6vw,72px)] leading-[1.05]`}
                                style={{ "--d": `${delay + 0.35}s` } as React.CSSProperties}
                            >
                                {text}
                            </span>
                            <span
                                aria-hidden="true"
                                className={`frame-wipe-bar absolute inset-0 z-10 ${i % 2 ? "frame-wipe-rev" : ""}`}
                                style={{ background: i % 2 ? "var(--f-fg)" : "var(--f-accent)", "--wd": `${delay}s` } as React.CSSProperties}
                            />
                        </span>
                    );
                })}
            </h2>
        </div>
    );
};

// ---- count-up number (0 -> value, 2s ease-out, once when scrolled into view) ---------
export const CountUp: React.FC<{ value: string }> = ({ value }) => {
    const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
    const target = match ? parseFloat(match[1]) : 0;
    const decimals = match ? (match[1].split(".")[1] ?? "").length : 0;
    const suffix = match ? match[2] : "";
    const ref = useRef<HTMLSpanElement>(null);
    const seen = useInView(ref, "-100px");
    const reduced = useReducedMotion();
    const [n, setN] = useState(0);
    const startedFor = useRef<number | null>(null);

    React.useEffect(() => {
        if (!match || !seen || reduced || startedFor.current === target) return;
        startedFor.current = target;
        let raf = 0;
        const t0 = performance.now();
        const step = (now: number) => {
            const k = Math.min(1, (now - t0) / 2000);
            setN(target * (1 - Math.pow(1 - k, 3)));
            if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seen, target, reduced]);

    const shown = (reduced ? target : n).toFixed(decimals) + suffix;
    if (!match) return <span ref={ref}>{value}</span>;
    return (
        <span ref={ref} className="relative inline-block tabular-nums">
            <span className="invisible" aria-hidden="true">
                {value}
            </span>
            <span className="absolute left-0 top-0" aria-hidden="true">
                {shown}
            </span>
            <span className="sr-only">{value}</span>
        </span>
    );
};

// ---- character-by-character blur-up reveal ---------------------------------------
const CharReveal: React.FC<{ text: string; on: boolean }> = ({ text, on }) => {
    const words = text.split(" ");
    return (
        <span aria-label={text} data-on={on}>
            {words.map((w, i) => (
                <React.Fragment key={i}>
                    <span aria-hidden="true" className="inline-block whitespace-pre">
                        {Array.from(w).map((c, j) => (
                            <span key={j} className="frame-char" style={{ "--d": `${(i * 0.012 + j * 0.006).toFixed(3)}s` } as React.CSSProperties}>
                                {c}
                            </span>
                        ))}
                    </span>
                    {i < words.length - 1 && (
                        <span aria-hidden="true" className="inline-block">
                            {" "}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </span>
    );
};

// ---- About: scroll-pinned stage. The panel rises and grows, a big marquee gives way to a
// parallax portrait, then the statement + narrative arrive (narrative reveals per character).
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const AboutCopy: React.FC<{ heading: string; narrative: string; on: boolean }> = ({ heading, narrative, on }) => (
    <div className="grid w-full gap-8 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-7">
            <div className="mb-5 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--f-accent)]" aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--f-muted)]">About Pulkit</span>
            </div>
            <blockquote className={`${DISPLAY} border-l-2 border-[color:var(--f-accent)] pl-5 text-[clamp(26px,4.2vw,60px)] leading-[1.08] md:pl-8`}>{heading}</blockquote>
        </div>
        <p className="text-[14px] leading-relaxed text-[color:var(--f-muted)] md:col-span-5 md:pt-12 md:text-[15px]">
            <CharReveal text={narrative} on={on} />
        </p>
    </div>
);

export const AboutPanel: React.FC<{
    isDarkMode: boolean;
    photo: string;
    marquee: string;
    heading: string;
    narrative: string;
}> = ({ isDarkMode, photo, marquee, heading, narrative }) => {
    const reduced = useReducedMotion();
    const wrapRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const leadRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const tintRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const scaleRef = useRef<HTMLDivElement>(null);
    const parRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const charsRef = useRef<HTMLElement[] | null>(null);

    useFrameScroll(() => {
        const wrap = wrapRef.current;
        const stage = stageRef.current;
        if (!wrap || !stage || reduced) return;
        const H = stage.clientHeight;
        const r = wrap.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, r.height - H));

        const lead = leadRef.current;
        if (lead) {
            lead.style.opacity = String(1 - clamp((p - 0.03) / 0.17));
            lead.style.pointerEvents = p > 0.15 ? "none" : "auto";
        }
        const e = ease(clamp((p - 0.05) / 0.25));
        const panel = panelRef.current;
        if (panel) {
            panel.style.transform = `translate3d(0,${(1 - e) * 0.6 * H}px,0) scale(${0.8 + 0.2 * e})`;
            panel.style.borderRadius = `${(1 - e) * 60}px`;
        }
        const u = clamp((p - 0.3) / 0.6);
        if (trackRef.current) trackRef.current.style.transform = `translate3d(0,${-ease(u) * 2 * H}px,0)`;
        if (marqueeRef.current) marqueeRef.current.style.opacity = String(clamp((p - 0.1) / 0.15));
        if (scaleRef.current) scaleRef.current.style.transform = `scale(${1.15 - 0.15 * clamp(u / 0.6)})`;
        if (parRef.current) parRef.current.style.transform = `translate3d(0,${-10 + 20 * u}%,0)`;
        if (tintRef.current) tintRef.current.style.opacity = String(clamp((u - 0.8) / 0.2));
        if (textRef.current) textRef.current.style.opacity = String(clamp((u - 0.7) / 0.25));
        // narrative: characters resolve one by one as the scroll position advances
        const text = textRef.current;
        if (text) {
            const chars = (charsRef.current ??= Array.from(text.querySelectorAll<HTMLElement>(".frame-char")));
            const lead = clamp((u - 0.74) / 0.26) * (chars.length + 24);
            chars.forEach((c, i) => {
                const a = clamp((lead - i) / 24);
                c.style.opacity = String(a);
                c.style.transform = `translate3d(0,${(1 - a) * 12}px,0)`;
                c.style.filter = a < 1 ? `blur(${(1 - a) * 4}px)` : "none";
            });
        }
    });

    if (reduced) {
        return (
            <section id="about" className="mx-auto max-w-[1400px] scroll-mt-14 px-4 py-20 sm:px-8 md:py-28">
                <div className="mb-10 aspect-[16/10] w-full overflow-hidden border border-[color:var(--f-line)]">
                    <img src={photo} alt="Portrait of Pulkit Tiwari" className="h-full w-full object-cover object-[50%_25%]" />
                </div>
                <AboutCopy heading={heading} narrative={narrative} on />
            </section>
        );
    }

    const panelColor = isDarkMode ? "#1a1a1a" : "#e9e9e2";
    const forward = () => window.scrollBy({ top: window.innerHeight * 1.4, behavior: "smooth" });
    const marqueeItems = (
        <div className="flex shrink-0 items-center">
            <span className={`${DISPLAY} mx-10 whitespace-nowrap text-[clamp(120px,24vw,280px)] leading-none`}>{marquee}</span>
            <span
                className="mx-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#d4ff3a] text-5xl text-[#111] md:h-44 md:w-44 md:text-8xl"
                aria-hidden="true"
            >
                ✦
            </span>
        </div>
    );

    return (
        <section id="about" ref={wrapRef} aria-label="About" className="relative h-[460vh] scroll-mt-14" style={{ "--f-panel": panelColor } as React.CSSProperties}>
            <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden">
                {/* lead-in */}
                <div ref={leadRef} className="absolute inset-0 z-0 flex flex-col items-center justify-center px-6">
                    <button type="button" onClick={forward} className="group mb-16 flex items-center gap-2">
                        <span className="relative overflow-hidden rounded-full bg-[var(--f-fg)] px-8 py-4 shadow-lg transition-[background-color,box-shadow] duration-500 group-hover:bg-[#d4ff3a] group-hover:shadow-[0_0_30px_rgba(212,255,58,0.3)] sm:px-10 sm:py-5">
                            <span className="relative block h-7 overflow-hidden">
                                <span className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-1/2">
                                    <span className="block h-7 text-xl font-bold leading-7 text-[color:var(--f-bg)]">About me</span>
                                    <span className="block h-7 text-xl font-bold leading-7 text-[#111]">About me</span>
                                </span>
                            </span>
                        </span>
                        <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[var(--f-fg)] shadow-lg transition-colors duration-500 group-hover:bg-[#d4ff3a] sm:h-16 sm:w-16">
                            <span className="block h-8 overflow-hidden text-2xl leading-8">
                                <span className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-1/2">
                                    <span className="block h-8 text-center text-[color:var(--f-bg)]">↗</span>
                                    <span className="block h-8 text-center text-[#111]">↗</span>
                                </span>
                            </span>
                        </span>
                    </button>
                    <div className="flex w-full max-w-[1200px] items-center justify-between px-2 text-sm font-medium tracking-tight text-[color:var(--f-muted)] sm:px-12">
                        <span className="flex items-center gap-3">
                            <span className="frame-bob" aria-hidden="true">
                                ↓
                            </span>
                            Scroll to explore
                        </span>
                        <span>My short story</span>
                    </div>
                </div>

                {/* rising panel */}
                <div ref={panelRef} className="frame-about-panel absolute inset-0 z-10 overflow-hidden" style={{ background: "var(--f-panel)" }}>
                    <div ref={tintRef} className="absolute inset-0 bg-[var(--f-bg)] opacity-0" />
                    <div ref={trackRef} className="absolute left-0 top-0 w-full">
                        {/* 1 · marquee */}
                        <div className="flex h-screen items-center overflow-hidden">
                            <div ref={marqueeRef} className="w-full opacity-0">
                                <div className="frame-about-track flex w-max">
                                    {marqueeItems}
                                    {marqueeItems}
                                </div>
                            </div>
                        </div>
                        {/* 2 · portrait with parallax */}
                        <div className="h-screen px-4 md:px-10 lg:px-20">
                            <div className="frame-photo relative mx-auto h-full max-w-[1500px] cursor-pointer overflow-hidden">
                                <div ref={scaleRef} className="absolute inset-0 origin-center">
                                    <div className="absolute -left-[50px] -top-[15%] h-[130%] w-[calc(100%+100px)]">
                                        <div ref={parRef} className="h-full w-full">
                                            <img src={photo} alt="Portrait of Pulkit Tiwari" className="h-full w-full object-cover object-[50%_20%]" />
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="pointer-events-none absolute left-0 top-0 h-32 w-full"
                                    style={{ background: "linear-gradient(to bottom, var(--f-panel), transparent)" }}
                                />
                                <div
                                    className="pointer-events-none absolute bottom-0 left-0 h-32 w-full"
                                    style={{ background: "linear-gradient(to top, var(--f-panel), transparent)" }}
                                />
                            </div>
                        </div>
                        {/* 3 · statement + narrative */}
                        <div className="flex h-screen items-center px-6 md:px-16 lg:px-24">
                            <div ref={textRef} className="mx-auto w-full max-w-[1500px] opacity-0">
                                <AboutCopy heading={heading} narrative={narrative} on={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
