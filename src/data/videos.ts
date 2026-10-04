// Existing "brag" launch videos (copied from each project's brag-output into public/videos).
// Keyed by GitHub repo name. Projects without an entry get no video UI.
export interface ProjectVideoMeta {
    src: string;
    label: string;
}

export const PROJECT_VIDEOS: Record<string, ProjectVideoMeta> = {
    SOAR_Intelligence: { src: "/videos/soar-intelligence.mp4", label: "SOAR Intelligence" },
    GDriveX: { src: "/videos/gdrivex.mp4", label: "GDriveX" },
    "NEO-Guard": { src: "/videos/neo-guard.mp4", label: "NEO-Guard" },
    "NEO-Hazard-AI": { src: "/videos/neo-hazard-ai.mp4", label: "NEO-Hazard-AI" },
};

const norm = (s: string) => s.toLowerCase().replace(/[-_]/g, "");
const BY_NORM = new Map(Object.entries(PROJECT_VIDEOS).map(([k, v]) => [norm(k), v]));

/** Case-insensitive lookup that ignores '-' and '_'. */
export const videoFor = (repoName: string): ProjectVideoMeta | undefined => BY_NORM.get(norm(repoName));
