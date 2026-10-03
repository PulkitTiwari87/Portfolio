import React, { useEffect, useState } from "react";
import { FaFire, FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import {
    GITHUB_PROFILE_URL,
    GITHUB_USER,
    LEETCODE_PROFILE_URL,
    LEETCODE_USER,
    loadGitHubActivity,
    loadLeetCodeActivity,
    WINDOW_DAYS,
    type ActivityDay,
    type ActivityGraph,
    type GitHubActivity,
    type LeetCodeActivity,
    type SolvedStat,
} from "../utils/activity";

// "Activity": last-30-days GitHub contributions + LeetCode submissions as GitHub-style heatmaps.
// Port of the Stitch "Activity" screen. Used by the main site (variant="site") and the Apple
// design page (variant="apple"). Colours come in light/dark pairs via the class-based `dark:` variant.
// Every number shown is derived from live data (see utils/activity.ts); nothing is hard-coded.

interface ActivityProps {
    variant?: "site" | "apple";
}

const AXIS_W = 28; // weekday-label column
const AXIS_GAP = 8;
const BLANK_COLUMNS = 5;

// Cell size comes from CSS variables so narrow phones can shrink it.
const SIZE_VARS = "[--cell:20px] [--gap:4px] min-[400px]:[--cell:24px] min-[400px]:[--gap:5px]";

// GitHub's contribution greens, light / dark.
const LEVEL_BG = [
    "bg-[#ebedf0] dark:bg-[#161b22]",
    "bg-[#9be9a8] dark:bg-[#0e4429]",
    "bg-[#40c463] dark:bg-[#006d32]",
    "bg-[#30a14e] dark:bg-[#26a641]",
    "bg-[#216e39] dark:bg-[#39d353]",
];
const CELL_RING = "outline outline-1 -outline-offset-1 outline-black/[0.05] dark:outline-white/[0.05]";

const DIFFICULTY_BAR: Record<string, string> = {
    Easy: "bg-[#30a14e] dark:bg-[#34c759]",
    Medium: "bg-[#ff9500] dark:bg-[#ff9f0a]",
    Hard: "bg-[#ff3b30] dark:bg-[#ff453a]",
};

const linkBlue = "text-[#0066cc] dark:text-[#2997ff] hover:underline";

// ── Data loading ─────────────────────────────────────────────────────────────

type Loaded<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

function useLoaded<T>(load: () => Promise<T>) {
    const [state, setState] = useState<Loaded<T>>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let live = true;
        load()
            .then((data) => live && setState({ status: "ready", data }))
            .catch(() => live && setState({ status: "error" }));
        return () => {
            live = false;
        };
    }, [load, attempt]);

    const retry = () => {
        setState({ status: "loading" });
        setAttempt((a) => a + 1);
    };
    return [state, retry] as const;
}

// ── Dates ────────────────────────────────────────────────────────────────────

const fromKey = (date: string) => new Date(`${date}T00:00:00Z`);
const fmt = (date: string, opts: Intl.DateTimeFormatOptions) =>
    fromKey(date).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
const longDate = (date: string) => fmt(date, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const shortDate = (date: string) => fmt(date, { month: "short", day: "numeric" });
const monthName = (date: string) => fmt(date, { month: "short" });
const plural = (n: number, noun: string) => `${n.toLocaleString("en-US")} ${noun}${n === 1 ? "" : "s"}`;

// ── Heatmap ──────────────────────────────────────────────────────────────────

type Week = (ActivityDay | null)[];

/** Sunday-first week columns; days outside the window stay null (not drawn). */
function toWeeks(days: ActivityDay[]): Week[] {
    const cells: Week = [...Array<null>(fromKey(days[0].date).getUTCDay()).fill(null), ...days];
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

/** Label the first column and any column holding the 1st of a month, dropping labels that would collide. */
function monthLabels(weeks: Week[]): { col: number; label: string }[] {
    const labels: { col: number; label: string }[] = [];
    weeks.forEach((week, col) => {
        const real = week.filter((d): d is ActivityDay => d !== null);
        const day = real.find((d) => d.date.endsWith("-01")) ?? (col === 0 ? real[0] : undefined);
        if (!day) return;
        const prev = labels[labels.length - 1];
        if (prev && col - prev.col < 2) labels.pop();
        labels.push({ col, label: monthName(day.date) });
    });
    return labels;
}

const GRID_STYLE: React.CSSProperties = {
    gridAutoFlow: "column",
    gridTemplateRows: "repeat(7, var(--cell))",
    gridAutoColumns: "var(--cell)",
    gap: "var(--gap)",
};
const LABEL_ROW = "h-[14px] mb-2"; // month-label row: 14px + 8px spacing = 22px
const LABEL_OFFSET = 22;

const Heatmap: React.FC<{ graph: ActivityGraph; noun: string; label: string }> = ({ graph, noun, label }) => {
    const weeks = toWeeks(graph.days);
    const months = monthLabels(weeks);

    return (
        <div role="img" aria-label={label} className={`flex ${SIZE_VARS}`}>
            {/* Weekday labels (Mon / Wed / Fri) */}
            <div
                aria-hidden
                className="grid shrink-0 text-[11px] font-medium leading-none tracking-[0.01em] text-[#6e6e73] dark:text-[#86868b]"
                style={{ gridTemplateRows: "repeat(7, var(--cell))", gap: "var(--gap)", width: AXIS_W, marginRight: AXIS_GAP, paddingTop: LABEL_OFFSET }}
            >
                {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                    <span key={i} className="flex items-center">
                        {d}
                    </span>
                ))}
            </div>

            <div>
                {/* Month labels, aligned to week columns */}
                <div
                    aria-hidden
                    className={`grid text-[11px] font-medium leading-none tracking-[0.01em] text-[#6e6e73] dark:text-[#86868b] ${LABEL_ROW}`}
                    style={{ gridTemplateColumns: `repeat(${weeks.length}, var(--cell))`, columnGap: "var(--gap)" }}
                >
                    {months.map((m) => (
                        <span key={m.col} className="whitespace-nowrap" style={{ gridColumn: m.col + 1, gridRow: 1 }}>
                            {m.label}
                        </span>
                    ))}
                </div>

                {/* Cells: columns are weeks, rows are weekdays */}
                <div className="grid" style={GRID_STYLE}>
                    {weeks.flat().map((day, i) =>
                        day ? (
                            <div
                                key={day.date}
                                title={`${day.count === 0 ? `No ${noun}s` : plural(day.count, noun)} on ${longDate(day.date)}`}
                                className={`rounded-[4px] ${LEVEL_BG[day.level]} ${CELL_RING} hover:outline-black/30 dark:hover:outline-white/40`}
                            />
                        ) : (
                            <div key={`blank-${i}`} />
                        ),
                    )}
                </div>
            </div>
        </div>
    );
};

const HeatmapSkeleton: React.FC = () => (
    <div aria-hidden className={`${SIZE_VARS}`} style={{ paddingLeft: AXIS_W + AXIS_GAP, paddingTop: LABEL_OFFSET }}>
        <div className="grid animate-pulse motion-reduce:animate-none" style={GRID_STYLE}>
            {Array.from({ length: 7 * BLANK_COLUMNS }, (_, i) => (
                <div key={i} className={`rounded-[4px] ${LEVEL_BG[0]}`} />
            ))}
        </div>
    </div>
);

const Legend: React.FC = () => (
    <div aria-hidden className="mt-4 flex items-center justify-end gap-1.5 text-[11px] text-[#6e6e73] dark:text-[#86868b]">
        <span className="mr-1">Less</span>
        {LEVEL_BG.map((bg) => (
            <span key={bg} className={`h-2.5 w-2.5 rounded-[2px] ${bg} ${CELL_RING}`} />
        ))}
        <span className="ml-1">More</span>
    </div>
);

// ── Panel pieces ─────────────────────────────────────────────────────────────

const Stat: React.FC<{ label: string; value: React.ReactNode; detail?: string }> = ({ label, value, detail }) => (
    <div>
        <dt className="text-[11px] font-medium leading-none tracking-[0.01em] text-[#6e6e73] dark:text-[#86868b]">{label}</dt>
        <dd className="mt-1.5 text-[17px] font-semibold leading-none tabular-nums tracking-[-0.01em]">
            {value}
            {detail && <span className="ml-1 text-xs font-normal text-[#6e6e73] dark:text-[#86868b]">{detail}</span>}
        </dd>
    </div>
);

/** Derived stats shown beside the heatmap, top-aligned with the first row of cells. */
const GraphStats: React.FC<{ graph: ActivityGraph }> = ({ graph }) => (
    <dl className="space-y-5" style={{ paddingTop: LABEL_OFFSET }}>
        <Stat label="Active days" value={graph.activeDays} detail={`of ${WINDOW_DAYS}`} />
        <Stat label="Longest streak" value={graph.longestStreak} detail={graph.longestStreak === 1 ? "day" : "days"} />
        <Stat
            label="Busiest day"
            value={graph.busiest ? graph.busiest.count.toLocaleString("en-US") : "-"}
            detail={graph.busiest ? shortDate(graph.busiest.date) : undefined}
        />
    </dl>
);

const SolvedBreakdown: React.FC<{ stats: SolvedStat[] }> = ({ stats }) => {
    const all = stats.find((s) => s.difficulty === "All");
    const levels = stats.filter((s) => s.difficulty !== "All");
    const [grown, setGrown] = useState(false);

    // Bars grow from 0 on mount (instant under prefers-reduced-motion).
    useEffect(() => {
        const id = requestAnimationFrame(() => setGrown(true));
        return () => cancelAnimationFrame(id);
    }, []);

    if (!all && levels.length === 0) return null;

    return (
        <div className="mt-5 border-t border-black/[0.04] pt-3.5 dark:border-white/[0.08]">
            {all && (
                <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium">Solved: {all.solved.toLocaleString("en-US")}</span>
                    <span className="text-[#6e6e73] dark:text-[#86868b]">of {all.total.toLocaleString("en-US")} problems</span>
                </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
                {levels.map((s) => (
                    <div
                        key={s.difficulty}
                        title={`${s.difficulty}: ${s.solved.toLocaleString("en-US")} of ${s.total.toLocaleString("en-US")} solved`}
                        className="rounded-lg bg-black/[0.02] p-2 dark:bg-white/[0.04]"
                    >
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-[#6e6e73] dark:text-[#86868b]">{s.difficulty}</span>
                            <span className="font-medium tabular-nums">{s.solved}</span>
                        </div>
                        <div
                            role="progressbar"
                            aria-label={`${s.difficulty} problems solved`}
                            aria-valuemin={0}
                            aria-valuemax={s.total}
                            aria-valuenow={s.solved}
                            className="h-1 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.12]"
                        >
                            <div
                                className={`h-full rounded-full transition-[width] duration-[600ms] ease-out motion-reduce:transition-none ${DIFFICULTY_BAR[s.difficulty]}`}
                                style={{ width: grown && s.total > 0 && s.solved > 0 ? `${Math.max(2, (s.solved / s.total) * 100)}%` : 0 }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** Status pill derived from real data: current streak, else the last active day. */
const StatusPill: React.FC<{ graph: ActivityGraph; flame?: boolean }> = ({ graph, flame }) => {
    const live = graph.currentStreak > 0;
    if (!live && !graph.lastActive) return null;
    return (
        <span className="inline-flex shrink-0 items-center rounded-full border border-black/[0.06] bg-white px-2.5 py-1 text-[11px] font-medium text-[#1d1d1f] shadow-sm dark:border-white/[0.1] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-none">
            {live && flame ? (
                <FaFire aria-hidden className="mr-1 text-[11px] text-[#ff9500]" />
            ) : (
                <span
                    aria-hidden
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-[#30a14e] motion-reduce:animate-none dark:bg-[#39d353]" : "bg-[#86868b]"}`}
                />
            )}
            {live ? `${graph.currentStreak}-day streak` : `Last active ${shortDate(graph.lastActive!.date)}`}
        </span>
    );
};

// ── Cards ────────────────────────────────────────────────────────────────────

interface CardShellProps {
    icon: React.ReactNode;
    title: string;
    handle: string;
    profileUrl: string;
    noun: string;
    panelTitle: string;
    sourceNote: string;
    state: Loaded<ActivityGraph>;
    retry: () => void;
    flame?: boolean;
    /** Shown under the heatmap panel's graph (e.g. the apology for an approximate fallback). */
    note?: string;
    /** Rendered inside the panel, below the legend (LeetCode solved breakdown). */
    panelFooter?: React.ReactNode;
}

const CardShell: React.FC<CardShellProps> = ({
    icon,
    title,
    handle,
    profileUrl,
    noun,
    panelTitle,
    sourceNote,
    state,
    retry,
    flame,
    note,
    panelFooter,
}) => {
    const graph = state.status === "ready" ? state.data : null;
    const first = graph?.days[0].date;
    const last = graph?.days[graph.days.length - 1].date;
    const heatmapLabel = graph
        ? `${title} ${noun}s in the last ${WINDOW_DAYS} days: ${graph.total} across ${graph.activeDays} active days`
        : "";

    return (
        <article
            aria-busy={state.status === "loading"}
            className="flex flex-col justify-between rounded-[18px] border border-black/[0.06] bg-[#f5f5f7] p-6 text-[#1d1d1f] sm:p-8 transition-colors duration-300 hover:border-black/[0.12] md:p-9 dark:border-white/[0.08] dark:bg-[#1d1d1f] dark:text-[#f5f5f7] dark:hover:border-white/[0.16]"
        >
            <div>
                {/* Identity + status */}
                <header className="mb-8 flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
                    <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-xl dark:border-white/[0.1] dark:bg-[#2c2c2e]">
                            {icon}
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-[17px] font-semibold leading-tight tracking-tight">{title}</h3>
                            <p className="truncate text-xs leading-tight text-[#6e6e73] dark:text-[#86868b]">@{handle}</p>
                        </div>
                    </div>
                    {graph && <StatusPill graph={graph} flame={flame} />}
                </header>

                {state.status === "loading" && (
                    <>
                        <div aria-hidden className="mb-8">
                            <div className="h-10 w-48 animate-pulse rounded-lg bg-black/[0.06] motion-reduce:animate-none dark:bg-white/[0.08]" />
                            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-black/[0.05] motion-reduce:animate-none dark:bg-white/[0.06]" />
                        </div>
                        <p className="sr-only" role="status">
                            Loading {title} activity
                        </p>
                        <div className="mb-8 rounded-xl border border-black/[0.04] bg-white/80 p-4 sm:p-5 dark:border-white/[0.06] dark:bg-black/30">
                            <HeatmapSkeleton />
                        </div>
                    </>
                )}

                {state.status === "error" && (
                    <div className="mb-8 text-sm text-[#6e6e73] dark:text-[#86868b]">
                        <p>Activity unavailable right now.</p>
                        <button onClick={retry} className={`mt-2 cursor-pointer text-sm font-medium ${linkBlue}`}>
                            Try again ›
                        </button>
                    </div>
                )}

                {graph && (
                    <>
                        <div className="mb-8">
                            <p className="text-3xl font-semibold leading-[1.1] sm:text-4xl tracking-[-0.02em] tabular-nums">
                                {graph.total.toLocaleString("en-US")} {noun}s
                            </p>
                            <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#86868b]">in the last {WINDOW_DAYS} days</p>
                        </div>

                        <div className="mb-8 rounded-xl border border-black/[0.04] bg-white/80 p-4 sm:p-5 dark:border-white/[0.06] dark:bg-black/30">
                            <div className="mb-3 flex items-center justify-between gap-3 text-xs font-medium text-[#6e6e73] dark:text-[#86868b]">
                                <span>{panelTitle}</span>
                                <span>
                                    {shortDate(first!)} — {shortDate(last!)}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-start gap-x-5 gap-y-5">
                                <Heatmap graph={graph} noun={noun} label={heatmapLabel} />
                                {graph.total > 0 && (
                                    <div className="min-w-[104px] flex-1">
                                        <GraphStats graph={graph} />
                                    </div>
                                )}
                            </div>
                            <Legend />
                            {graph.total === 0 && <p className="mt-3 text-sm text-[#6e6e73] dark:text-[#86868b]">No {noun}s in the last {WINDOW_DAYS} days.</p>}
                            {note && <p className="mt-3 text-xs leading-relaxed text-[#6e6e73] dark:text-[#86868b]">{note}</p>}
                            {panelFooter}
                        </div>
                    </>
                )}
            </div>

            {/* Source + profile link */}
            <footer className="flex items-center justify-between gap-3 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
                <span className="text-xs text-[#6e6e73] dark:text-[#86868b]">{sourceNote}</span>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={`group inline-flex items-center text-sm font-medium ${linkBlue}`}>
                    View profile
                    <span className="ml-1 text-xs transition-transform group-hover:translate-x-0.5">›</span>
                </a>
            </footer>
        </article>
    );
};

const GitHubCard: React.FC = () => {
    const [state, retry] = useLoaded<GitHubActivity>(loadGitHubActivity);
    const approx = state.status === "ready" && state.data.source === "events";
    return (
        <CardShell
            icon={<FaGithub />}
            title="GitHub"
            handle={GITHUB_USER}
            profileUrl={GITHUB_PROFILE_URL}
            noun="contribution"
            panelTitle="Daily distribution"
            sourceNote={approx ? "From recent public activity" : "Contribution calendar"}
            state={state}
            retry={retry}
            note={approx ? "Approximate: counted from recent public activity because the contribution calendar is unavailable." : undefined}
        />
    );
};

const LeetCodeCard: React.FC = () => {
    const [state, retry] = useLoaded<LeetCodeActivity>(loadLeetCodeActivity);
    return (
        <CardShell
            icon={<SiLeetcode className="text-lg" />}
            title="LeetCode"
            handle={LEETCODE_USER}
            profileUrl={LEETCODE_PROFILE_URL}
            noun="submission"
            panelTitle="Submission frequency"
            sourceNote="Daily submissions"
            state={state}
            retry={retry}
            flame
            panelFooter={state.status === "ready" ? <SolvedBreakdown stats={state.data.solved} /> : undefined}
        />
    );
};

// ── Section ──────────────────────────────────────────────────────────────────

const Activity: React.FC<ActivityProps> = ({ variant = "apple" }) => {
    const cards = (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <GitHubCard />
            <LeetCodeCard />
        </div>
    );

    if (variant === "apple") {
        return (
            <div>
                <div className="mb-14">
                    <p className="text-xs font-medium tracking-[0.02em] text-[#6e6e73] dark:text-[#86868b]">Consistency</p>
                    <h2 className="mt-1 text-3xl font-semibold leading-[1.1] tracking-[-0.022em] text-[#1d1d1f] md:text-5xl dark:text-[#f5f5f7]">
                        Activity.
                    </h2>
                    <p className="mt-3 max-w-xl text-[17px] leading-[1.3] text-[#6e6e73] md:text-xl dark:text-[#a1a1a6]">
                        The last 30 days of shipping and problem solving.
                    </p>
                </div>
                {cards}
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-center pt-24 pb-32">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="mb-6 text-6xl font-semibold type-display text-black md:text-8xl dark:text-white">ACTIVITY</h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">The last 30 days of shipping and problem solving.</p>
                </div>
                {cards}
            </div>
        </div>
    );
};

export default Activity;
