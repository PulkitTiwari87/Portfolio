import React, { useEffect, useRef, useState } from "react";
import type { ProjectVideoMeta } from "../../data/videos";

interface ProjectVideoProps {
    video: ProjectVideoMeta;
    /** Size/position the idle block or the player (e.g. "w-full aspect-video"). */
    className?: string;
    /** Small inline pill instead of a full poster block while idle. */
    compact?: boolean;
    /** When false (e.g. accordion collapsed) the player is unloaded back to idle. */
    active?: boolean;
}

const ring = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500";

const PlayIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
    </svg>
);

/**
 * Click-to-load project video. Nothing is fetched until the user clicks; no autoplay
 * (and no auto-start at all under prefers-reduced-motion). Pauses when scrolled out of
 * view and unloads when `active` turns false.
 */
const ProjectVideo: React.FC<ProjectVideoProps> = ({ video, className = "", compact = false, active = true }) => {
    const [loaded, setLoaded] = useState(false);
    const wrap = useRef<HTMLDivElement>(null);
    const el = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!active) setLoaded(false);
    }, [active]);

    useEffect(() => {
        if (!loaded) return;
        const v = el.current;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (v && !reduce) v.play().catch(() => {});
        const node = wrap.current;
        if (!node || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) el.current?.pause();
        });
        io.observe(node);
        return () => io.disconnect();
    }, [loaded]);

    if (loaded) {
        return (
            <div ref={wrap} className={`overflow-hidden rounded-lg bg-black ${compact ? "aspect-video w-[min(28rem,80vw)]" : ""} ${className}`}>
                <video
                    ref={el}
                    src={video.src}
                    controls
                    playsInline
                    preload="auto"
                    aria-label={`${video.label} demo video`}
                    className="h-full w-full object-contain"
                />
            </div>
        );
    }

    if (compact) {
        return (
            <button
                type="button"
                onClick={() => setLoaded(true)}
                aria-label={`Play ${video.label} demo video`}
                className={`inline-flex items-center gap-1.5 rounded-full border border-current px-2.5 py-1 text-[11px] font-semibold opacity-80 transition-opacity hover:opacity-100 ${ring} ${className}`}
            >
                <PlayIcon /> Watch demo
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setLoaded(true)}
            aria-label={`Play ${video.label} demo video`}
            className={`group flex flex-col items-center justify-center gap-2 rounded-lg bg-neutral-900/85 text-white transition-colors hover:bg-neutral-900 ${ring} ${className}`}
        >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/40 transition-transform group-hover:scale-110">
                <PlayIcon />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">{video.label} demo</span>
        </button>
    );
};

export default ProjectVideo;
