// Activity data: last-30-days GitHub contributions + LeetCode submissions.
// Real data only. Results are cached in sessionStorage (short TTL) and in-flight requests are
// de-duplicated, so GitHub's shared unauthenticated quota (60 req/h per IP) is barely touched.

export const GITHUB_USER = 'PulkitTiwari87';
export const LEETCODE_USER = 'pulkittiwari51';
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USER}`;
export const LEETCODE_PROFILE_URL = `https://leetcode.com/u/${LEETCODE_USER}/`;

export const WINDOW_DAYS = 30;

// Same-origin path. Vite dev/preview proxy (vite.config.ts) and a Vercel rewrite (vercel.json)
// forward it to https://leetcode.com/graphql, which sends no CORS headers.
const LEETCODE_ENDPOINT = '/api/leetcode';

const CACHE_PREFIX = 'activity:v1:';
const CACHE_TTL_MS = 15 * 60 * 1000;
const STALE_MAX_MS = 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export interface ActivityDay {
  /** UTC calendar day, YYYY-MM-DD */
  date: string;
  count: number;
  level: ActivityLevel;
}

export interface ActivityGraph {
  /** Exactly WINDOW_DAYS entries, oldest first, ending today (UTC). */
  days: ActivityDay[];
  total: number;
  activeDays: number;
  /** Longest run of consecutive active days inside the window. */
  longestStreak: number;
  /** Busiest day in the window, or null when there was no activity. */
  busiest: ActivityDay | null;
  /** Consecutive active days ending today (or yesterday, since today may be young). */
  currentStreak: number;
  /** Most recent active day in the window, or null. */
  lastActive: ActivityDay | null;
}

export interface GitHubActivity extends ActivityGraph {
  /** 'calendar' = GitHub contribution calendar; 'events' = fallback counted from public events. */
  source: 'calendar' | 'events';
}

export type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

export interface SolvedStat {
  difficulty: Difficulty;
  solved: number;
  total: number;
}

export interface LeetCodeActivity extends ActivityGraph {
  solved: SolvedStat[];
}

type DayCounts = Record<string, number>;

interface GitHubRaw {
  source: 'calendar' | 'events';
  counts: DayCounts;
  /** GitHub's own 0-4 level per day (calendar source only). */
  levels?: DayCounts;
}

interface LeetCodeRaw {
  counts: DayCounts;
  solved: SolvedStat[];
}

// ── Dates / bucketing ────────────────────────────────────────────────────────

export const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** The last `days` UTC days ending today, oldest first. */
function windowDates(now: number, days: number): string[] {
  return Array.from({ length: days }, (_, i) => dayKey(now - (days - 1 - i) * DAY_MS));
}

/** Fallback level (GitHub's own levels are used when the calendar provides them): quartiles of the
 *  window's busiest day, with a floor of 4 so one or two items never look like a peak. */
function levelOf(count: number, max: number): ActivityLevel {
  if (count <= 0) return 0;
  const scale = Math.max(max, 4);
  return Math.min(4, Math.ceil((count / scale) * 4)) as ActivityLevel;
}

function buildGraph(counts: DayCounts, levels?: DayCounts, now = Date.now()): ActivityGraph {
  const dates = windowDates(now, WINDOW_DAYS);
  const values = dates.map((d) => counts[d] ?? 0);
  const max = Math.max(0, ...values);
  const days = dates.map((date, i) => ({
    date,
    count: values[i],
    level: (levels?.[date] as ActivityLevel | undefined) ?? levelOf(values[i], max),
  }));
  let run = 0;
  let longestStreak = 0;
  for (const v of values) {
    run = v > 0 ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }
  let i = values.length - 1;
  if (values[i] === 0) i -= 1;
  let currentStreak = 0;
  for (; i >= 0 && values[i] > 0; i--) currentStreak++;
  const lastIdx = values.map((v) => v > 0).lastIndexOf(true);
  return {
    days,
    total: values.reduce((a, b) => a + b, 0),
    activeDays: values.filter((v) => v > 0).length,
    longestStreak,
    busiest: max > 0 ? days[values.indexOf(max)] : null,
    currentStreak,
    lastActive: lastIdx >= 0 ? days[lastIdx] : null,
  };
}

/** Keep only recent days in the cache (a few spare days cover midnight roll-over). */
function recentOnly(counts: DayCounts, now = Date.now()): DayCounts {
  const keep = new Set(windowDates(now, WINDOW_DAYS + 5));
  return Object.fromEntries(Object.entries(counts).filter(([d]) => keep.has(d)));
}

// ── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  at: number;
  data: T;
}

function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    return typeof entry?.at === 'number' && entry.data ? entry : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ at: Date.now(), data } satisfies CacheEntry<T>));
  } catch {
    // storage unavailable or full: run uncached
  }
}

const inflight = new Map<string, Promise<unknown>>();

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = readCache<T>(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  let pending = inflight.get(key) as Promise<T> | undefined;
  if (!pending) {
    pending = load()
      .then((data) => {
        writeCache(key, data);
        return data;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }

  try {
    return await pending;
  } catch (err) {
    // A slightly old real result beats an error card.
    if (hit && Date.now() - hit.at < STALE_MAX_MS) return hit.data;
    throw err;
  }
}

// ── GitHub ───────────────────────────────────────────────────────────────────

// Primary: CORS-enabled public mirror of the GitHub contribution calendar (the same per-day
// numbers github.com draws). It does not use GitHub's API quota.
async function fetchContributionCalendar(): Promise<{ counts: DayCounts; levels: DayCounts }> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`);
  if (!res.ok) throw new Error(`Contribution calendar responded ${res.status}`);
  const json = (await res.json()) as { contributions?: { date?: unknown; count?: unknown; level?: unknown }[] };
  if (!Array.isArray(json.contributions)) throw new Error('Unexpected contribution calendar response');
  const counts: DayCounts = {};
  const levels: DayCounts = {};
  for (const c of json.contributions) {
    if (typeof c.date !== 'string' || typeof c.count !== 'number') continue;
    counts[c.date] = c.count;
    if (typeof c.level === 'number' && c.level >= 0 && c.level <= 4) levels[c.date] = c.level;
  }
  return { counts: recentOnly(counts), levels: recentOnly(levels) };
}

const CONTRIBUTION_EVENTS = new Set([
  'PushEvent',
  'PullRequestEvent',
  'PullRequestReviewEvent',
  'IssuesEvent',
  'CreateEvent',
]);

interface GitHubEvent {
  type: string;
  created_at: string;
  payload?: { size?: number; commits?: unknown[] };
}

// Fallback: first-party public events (roughly the last 90 days), counted per UTC day.
// Push events count their commits when the payload exposes them, otherwise one event = one.
async function fetchPublicEvents(): Promise<DayCounts> {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=100`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub events responded ${res.status}`);
  const events = (await res.json()) as GitHubEvent[];
  if (!Array.isArray(events)) throw new Error('Unexpected GitHub events response');
  const counts: DayCounts = {};
  for (const e of events) {
    if (!CONTRIBUTION_EVENTS.has(e.type)) continue;
    const n =
      e.type === 'PushEvent'
        ? typeof e.payload?.size === 'number'
          ? e.payload.size
          : (e.payload?.commits?.length ?? 1)
        : 1;
    const day = e.created_at.slice(0, 10);
    counts[day] = (counts[day] ?? 0) + Math.max(1, n);
  }
  return recentOnly(counts);
}

async function fetchGitHubRaw(): Promise<GitHubRaw> {
  try {
    return { source: 'calendar', ...(await fetchContributionCalendar()) };
  } catch {
    return { source: 'events', counts: await fetchPublicEvents() };
  }
}

export async function loadGitHubActivity(): Promise<GitHubActivity> {
  const raw = await cached('github', fetchGitHubRaw);
  return { ...buildGraph(raw.counts, raw.levels), source: raw.source };
}

// ── LeetCode ─────────────────────────────────────────────────────────────────

const LEETCODE_QUERY = `query($u:String!){
  allQuestionsCount{difficulty count}
  matchedUser(username:$u){
    submissionCalendar
    submitStatsGlobal{acSubmissionNum{difficulty count}}
  }
}`;

interface DifficultyCount {
  difficulty: string;
  count: number;
}

const DIFFICULTIES: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard'];

async function fetchLeetCodeRaw(): Promise<LeetCodeRaw> {
  const res = await fetch(LEETCODE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: LEETCODE_QUERY, variables: { u: LEETCODE_USER } }),
  });
  if (!res.ok) throw new Error(`LeetCode responded ${res.status}`);

  // A missing proxy yields an HTML page (SPA fallback); res.json() then throws, which is the error state.
  const json = (await res.json()) as {
    data?: {
      allQuestionsCount?: DifficultyCount[];
      matchedUser?: {
        submissionCalendar?: string;
        submitStatsGlobal?: { acSubmissionNum?: DifficultyCount[] };
      } | null;
    };
  };
  const user = json.data?.matchedUser;
  if (!user || typeof user.submissionCalendar !== 'string') throw new Error('LeetCode user not found');

  // submissionCalendar: JSON string of { "<UTC midnight epoch seconds>": submissions }
  const calendar = JSON.parse(user.submissionCalendar) as Record<string, number>;
  const counts: DayCounts = {};
  for (const [ts, n] of Object.entries(calendar)) {
    const day = dayKey(Number(ts) * 1000);
    counts[day] = (counts[day] ?? 0) + Number(n);
  }

  const solvedBy = new Map((user.submitStatsGlobal?.acSubmissionNum ?? []).map((s) => [s.difficulty, s.count]));
  const totalBy = new Map((json.data?.allQuestionsCount ?? []).map((s) => [s.difficulty, s.count]));
  const solved = DIFFICULTIES.flatMap((difficulty) => {
    const s = solvedBy.get(difficulty);
    const t = totalBy.get(difficulty);
    return typeof s === 'number' && typeof t === 'number' ? [{ difficulty, solved: s, total: t }] : [];
  });

  return { counts: recentOnly(counts), solved };
}

export async function loadLeetCodeActivity(): Promise<LeetCodeActivity> {
  const raw = await cached('leetcode', fetchLeetCodeRaw);
  return { ...buildGraph(raw.counts), solved: raw.solved };
}

// ── GitHub: one calendar year (NERD design year tabs) ────────────────────────

export interface YearContribution {
  date: string;
  count: number;
  level: ActivityLevel;
}

/** Full-year GitHub contribution calendar for `year` (or the rolling last 12 months with 'last') (same mirror as the 30-day graph), cached per year. */
export async function loadGitHubYear(year: number | 'last'): Promise<YearContribution[]> {
  return cached(`github-year:${year}`, async () => {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=${year}`);
    if (!res.ok) throw new Error(`Contribution calendar responded ${res.status}`);
    const json = (await res.json()) as { contributions?: { date?: unknown; count?: unknown; level?: unknown }[] };
    if (!Array.isArray(json.contributions)) throw new Error('Unexpected contribution calendar response');
    const out: YearContribution[] = [];
    for (const c of json.contributions) {
      if (typeof c.date !== 'string' || typeof c.count !== 'number') continue;
      const level = typeof c.level === 'number' && c.level >= 0 && c.level <= 4 ? (c.level as ActivityLevel) : 0;
      out.push({ date: c.date, count: c.count, level });
    }
    return out;
  });
}
