import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

// Hooks behind the "Frame" page effects (preloader phases, smooth scrolling,
// one shared rAF-throttled scroll handler, in-view detection, reduced motion).

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export function useReducedMotion(): boolean {
    const query = "(prefers-reduced-motion: reduce)";
    const [reduced, setReduced] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = () => setReduced(mq.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return reduced;
}

// ---- single shared scroll handler (rAF-throttled) -------------------------
type ScrollFn = (y: number) => void;
const subscribers = new Set<ScrollFn>();
let ticking = false;

const onScrollOrResize = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        subscribers.forEach((fn) => fn(y));
    });
};

export function useFrameScroll(fn: ScrollFn): void {
    const latest = useRef(fn);
    useEffect(() => {
        latest.current = fn;
    });
    useEffect(() => {
        const sub: ScrollFn = (y) => latest.current(y);
        if (subscribers.size === 0) {
            window.addEventListener("scroll", onScrollOrResize, { passive: true });
            window.addEventListener("resize", onScrollOrResize);
        }
        subscribers.add(sub);
        sub(window.scrollY);
        return () => {
            subscribers.delete(sub);
            if (subscribers.size === 0) {
                window.removeEventListener("scroll", onScrollOrResize);
                window.removeEventListener("resize", onScrollOrResize);
            }
        };
    }, []);
}

// ---- preloader phases: loading (signature draws) -> exiting (curtain slides up) -> ready
export type FramePhase = "loading" | "exiting" | "ready";
const DRAW_MS = 2500; // signature draw + short hold
const EXIT_MS = 1200; // curtain slide-up

export function useFramePhase(reduced: boolean): FramePhase {
    const [phase, setPhase] = useState<FramePhase>(reduced ? "ready" : "loading");
    useEffect(() => {
        if (phase === "ready") return;
        const id = window.setTimeout(() => setPhase(phase === "loading" ? "exiting" : "ready"), phase === "loading" ? DRAW_MS : EXIT_MS);
        return () => window.clearTimeout(id);
    }, [phase]);
    // no scrollbar jump while the page is locked behind the curtain
    useEffect(() => {
        const root = document.documentElement;
        root.style.scrollbarGutter = "stable";
        return () => {
            root.style.scrollbarGutter = "";
        };
    }, []);
    useEffect(() => {
        if (phase === "ready") return;
        const root = document.documentElement;
        root.style.overflow = "hidden";
        window.scrollTo(0, 0);
        return () => {
            root.style.overflow = "";
        };
    }, [phase]);
    return phase;
}

// ---- smooth wheel scrolling (lerp 0.1, like the reference's Lenis config) ---
export function useSmoothScroll(enabled: boolean): void {
    useEffect(() => {
        if (!enabled) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (window.matchMedia("(pointer: coarse)").matches) return;

        let current = window.scrollY;
        let target = current;
        let raf = 0;
        let last = 0;
        const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

        const step = (now: number) => {
            const dt = Math.min(64, now - last);
            last = now;
            const k = 1 - Math.pow(1 - 0.1, dt / 16.667); // frame-rate independent lerp(0.1)
            current += (target - current) * k;
            if (Math.abs(target - current) < 0.4) {
                current = target;
                window.scrollTo({ top: current, behavior: "instant" });
                raf = 0;
                return;
            }
            window.scrollTo({ top: current, behavior: "instant" });
            raf = requestAnimationFrame(step);
        };

        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            e.preventDefault();
            if (!raf) {
                current = window.scrollY;
                target = current;
                last = performance.now();
            }
            const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
            target = clamp(target + dy, 0, Math.max(0, maxScroll()));
            if (!raf) raf = requestAnimationFrame(step);
        };
        // keep in sync when something else scrolls (keyboard, anchors, scrollbar drag)
        const onScroll = () => {
            if (!raf) {
                current = window.scrollY;
                target = current;
            }
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("scroll", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [enabled]);
}

// ---- true once the element has entered the viewport (never resets) ----------
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = "0px"): boolean {
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSeen(true);
                    io.disconnect();
                }
            },
            { rootMargin },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [ref, rootMargin]);
    return seen;
}
