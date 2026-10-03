import React, { useCallback, useEffect, useRef, useState } from "react";

// Hand-authored centerline of a monoline cursive "hello" (one continuous pen stroke).
const HELLO_PATH =
    "M 20 138 C 22 156 44 160 58 124 C 68 94 82 42 92 18 C 98 4 80 -4 74 16 C 66 50 60 104 58 138 C 57 152 62 164 68 150 " +
    "C 72 128 72 104 82 98 C 98 92 118 100 120 128 C 121 146 118 154 124 158 " +
    "C 132 150 142 138 158 124 C 170 112 176 96 160 96 C 142 96 138 128 146 148 C 152 162 172 164 184 146 " +
    "C 198 128 214 66 226 24 C 232 6 212 -4 206 18 C 198 56 194 118 200 148 C 204 160 218 158 228 142 " +
    "C 242 126 258 66 270 24 C 276 6 256 -4 250 18 C 242 56 238 118 244 148 C 248 160 262 158 272 142 " +
    "C 284 128 292 108 304 100 C 286 100 276 128 284 148 C 292 164 322 164 326 134 C 328 112 318 98 304 100 C 322 94 358 106 412 62";

const DRAW_MS = 2400;
const HOLD_MS = 500;
const EXIT_MS = 600;

// easeInOutSine: matches a gentle "ease-in-out" pen
const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

interface AppleHelloProps {
    onDone: () => void;
}

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const AppleHello: React.FC<AppleHelloProps> = ({ onDone }) => {
    const [reduced] = useState(prefersReducedMotion);
    const [leaving, setLeaving] = useState(false);
    const pathRef = useRef<SVGPathElement>(null);
    const tipRef = useRef<SVGGElement>(null);
    const doneRef = useRef(onDone);
    doneRef.current = onDone;

    const leave = useCallback(() => setLeaving(true), []);

    // Reduced motion: skip the intro entirely.
    useEffect(() => {
        if (reduced) doneRef.current();
    }, [reduced]);

    // Lock page scroll without shifting layout (keep the scrollbar gutter reserved).
    useEffect(() => {
        if (reduced) return;
        const html = document.documentElement;
        const body = document.body;
        const prev = {
            htmlOverflow: html.style.overflow,
            gutter: html.style.scrollbarGutter,
            htmlBg: html.style.backgroundColor,
            bodyOverflow: body.style.overflow,
        };
        html.style.scrollbarGutter = "stable";
        html.style.backgroundColor = "#000";
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        return () => {
            html.style.overflow = prev.htmlOverflow;
            html.style.scrollbarGutter = prev.gutter;
            html.style.backgroundColor = prev.htmlBg;
            body.style.overflow = prev.bodyOverflow;
        };
    }, [reduced]);

    // Draw the stroke, hold, then leave.
    useEffect(() => {
        if (reduced) return;
        const path = pathRef.current;
        const tip = tipRef.current;
        if (!path || !tip) return;
        const length = path.getTotalLength();
        let raf = 0;
        let holdTimer = 0;
        const start = performance.now();

        const frame = (now: number) => {
            const t = Math.min((now - start) / DRAW_MS, 1);
            const p = ease(t);
            path.style.strokeDashoffset = String(1 - p);
            path.style.visibility = p > 0.0005 ? "visible" : "hidden";
            const pt = path.getPointAtLength(p * length);
            tip.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
            tip.style.opacity = t < 1 ? "1" : "0";
            if (t < 1) {
                raf = requestAnimationFrame(frame);
            } else {
                holdTimer = window.setTimeout(leave, HOLD_MS);
            }
        };
        raf = requestAnimationFrame(frame);
        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(holdTimer);
        };
    }, [reduced, leave]);

    // Unmount after the exit transition.
    useEffect(() => {
        if (!leaving) return;
        const id = window.setTimeout(() => doneRef.current(), EXIT_MS);
        return () => window.clearTimeout(id);
    }, [leaving]);

    // Skip with Esc / Enter.
    useEffect(() => {
        if (reduced) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" || e.key === "Enter") leave();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [reduced, leave]);

    if (reduced) return null;

    return (
        <div
            role="dialog"
            aria-label="Welcome"
            onClick={leave}
            className="fixed inset-0 flex cursor-pointer items-center justify-center"
            style={{
                zIndex: 2147483000,
                backgroundColor: "#000",
                touchAction: "none",
                opacity: leaving ? 0 : 1,
                transform: leaving ? "scale(1.06)" : "scale(1)",
                filter: leaving ? "blur(6px)" : "blur(0px)",
                transition: `opacity ${EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1), filter ${EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                pointerEvents: leaving ? "none" : "auto",
            }}
        >
            <svg
                viewBox="0 0 480 210"
                role="img"
                aria-label="hello"
                style={{ width: "min(80vw, 560px)", height: "auto", overflow: "visible" }}
            >
                <defs>
                    <filter id="hello-glow" x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="6" />
                    </filter>
                </defs>
                <g transform="translate(26 30)">
                    <path
                        ref={pathRef}
                        d={HELLO_PATH}
                        pathLength={1}
                        fill="none"
                        stroke="#fff"
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="1 1"
                        style={{ strokeDashoffset: 1, visibility: "hidden" }}
                    />
                    <g ref={tipRef} aria-hidden="true" style={{ opacity: 0, transition: "opacity 300ms ease-out" }}>
                        <circle r="12" fill="#fff" opacity="0.55" filter="url(#hello-glow)" />
                        <circle r="3.5" fill="#fff" />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default AppleHello;
