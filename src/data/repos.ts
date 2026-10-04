// Language colour map for badges
export const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  'Jupyter Notebook': '#DA5B0B',
};

// Human-readable repo names / descriptions
export const REPO_META: Record<string, { displayName: string; description: string }> = {
  VKJ: { displayName: 'VKJ Client Site', description: 'Full-stack client website built with the MERN stack.' },
  'Capstone-Project-2': { displayName: 'Capstone Project II', description: 'Java-based capstone project covering data structures & algorithms.' },
  'Capstone-Project1-java': { displayName: 'Capstone Project I', description: 'Java capstone – foundational OOP patterns and problem solving.' },
  'Capstone-Project': { displayName: 'Capstone Project', description: 'Academic capstone demonstrating full software engineering lifecycle.' },
  webcrawler: { displayName: 'Web Crawler', description: 'Python-based web crawler using requests & BeautifulSoup.' },
  'Amazon_Clone_Frontend': { displayName: 'Amazon Clone', description: 'Pixel-accurate Amazon.com frontend clone using pure HTML/CSS/JS.' },
  'Data_Visualization': { displayName: 'Data Visualization', description: 'Jupyter Notebook collection for exploratory data analysis & charts.' },
  'Azure_Developer_Community': { displayName: 'Azure Dev Community', description: 'Resources and demos for the Azure Developer Community event.' },
  'Hackathon4.0': { displayName: 'Hackathon 4.0', description: 'Hackathon project submission showcasing rapid prototyping skills.' },
  'INTERN-TASK': { displayName: 'Internship Tasks', description: 'Task repository for Weblicious internship — MERN stack features.' },
  'Strapi_Backend': { displayName: 'Strapi Backend', description: 'Headless CMS backend powered by Strapi for a client project.' },
  SystemOptimizer: { displayName: 'System Optimizer', description: 'Cross-platform shell scripts to safely clean & optimize Windows/Linux.' },
  Universal_Scraper: { displayName: 'Universal Scraper', description: 'High-performance modular web scraping engine with FastAPI + Playwright.' },
  Cyber_Kill_Chain: { displayName: 'Cyber Kill Chain Analyzer', description: 'ML-powered dashboard to classify & visualize cyber-attack progression.' },
  Hybrid_NIDS: { displayName: 'Hybrid NIDS', description: 'Hybrid Network Intrusion Detection System combining signature & anomaly detection.' },
  Dark_Web_Monitor: { displayName: 'Dark Web Monitor', description: 'Real-time threat intelligence dashboard monitoring dark-web data leaks.' },
  GDriveX: { displayName: 'GDriveX', description: 'Unified workspace for multiple Google Drive accounts: server-side Drive-to-Drive streaming, bulk transfers and encrypted OAuth tokens.' },
  Orbital_Stock: { displayName: 'Orbital Stock', description: 'Real-time stock tracker with orbital data visualization.' },
  SOAR_Intelligence: { displayName: 'SOAR Intelligence', description: 'AI-assisted security operations platform: Wazuh, TheHive, Cortex, MISP, ELK and Redis with XGBoost triage, anomaly detection and automated response.' },
  ATLAS: { displayName: 'Atlas', description: 'Fault-tolerant distributed compute platform in Python: priority scheduler, worker heartbeats, retries and PostgreSQL-backed job state.' },
  Real_Time_CRAG: { displayName: 'Real-Time CRAG', description: 'Corrective RAG system combining retrieval, relevance evaluation, query refinement and web search for grounded answers.' },
  'NEO-Hazard-AI': { displayName: 'NEO-Hazard-AI', description: 'Leakage-aware ML pipeline on NASA/JPL Near-Earth Object data with SHAP explainability and an interactive explorer.' },
  'NEO-Guard': { displayName: 'NEO-Guard', description: 'Explainable ML system for Near-Earth Object analysis on 42,351 NEOs, with calibration and failure analysis.' },
  'MarsLandmark-AI': { displayName: 'Mars Landmark AI', description: 'Computer-vision classification of Martian landmarks from NASA HiRISE imagery, with Grad-CAM explanations.' },
  'Music-Genre-CNN': { displayName: 'Music Genre & Mood Classification', description: 'Deep-learning genre and mood classification on GTZAN using MFCC features and CNNs.' },
};

// Primary flagship repo.
export const FLAGSHIP_REPO = 'SOAR_Intelligence';

// Repos highlighted under the "Flagship" filter.
export const FLAGSHIP_REPOS = ['SOAR_Intelligence', 'GDriveX'];

// Deployed site if the repo has one (GitHub "homepage"), otherwise the repository.
export const projectUrl = (repo: { homepage: string | null; html_url: string }): string =>
  repo.homepage?.trim() || repo.html_url;

// Repos from the secondary GitHub profile (PulkitTiwari51) to still show. Empty = show none.
export const SECONDARY_FEATURED: string[] = [];

// Global project order: these come first, in this exact order; everything else follows by recency.
export const PROJECT_ORDER = ['SOAR_Intelligence', 'GDriveX', 'NEO-Guard', 'NEO-Hazard-AI', 'Music-Genre-CNN'];

// Superseded repos never shown as projects.
export const HIDDEN_REPOS = ['Portfolio', 'Portfolio-v2'];

const norm = (n: string) => n.toLowerCase().replace(/[-_]/g, '');

// The one shared ordering: drop hidden, PROJECT_ORDER first, then updated_at desc.
export function orderRepos<T extends { name: string; updated_at: string }>(repos: T[]): T[] {
  const hidden = HIDDEN_REPOS.map(norm);
  const rank = (r: T) => {
    const i = PROJECT_ORDER.findIndex((n) => norm(n) === norm(r.name));
    return i === -1 ? PROJECT_ORDER.length : i;
  };
  return repos
    .filter((r) => !hidden.includes(norm(r.name)))
    .sort((a, b) => rank(a) - rank(b) || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

// Flagship = hand-picked repos, SOAR variants, and anything with a live site.
export const isFlagship = (r: { name: string; homepage: string | null }): boolean =>
  FLAGSHIP_REPOS.includes(r.name) || r.name.toLowerCase().includes('soar') || !!r.homepage?.trim();

// Check if a repo is the primary flagship (SOAR_Intelligence, ignoring case and dashes/underscores).
export const isPrimaryFlagship = (r: { name: string }): boolean => {
  const norm = (s: string) => s.toLowerCase().replace(/[-_]/g, '');
  return norm(r.name) === norm(FLAGSHIP_REPO);
};
