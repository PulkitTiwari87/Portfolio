import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllRepos } from '../utils/github';
import { Repo } from '../types';

// Language colour map for badges
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  'Jupyter Notebook': '#DA5B0B',
};

interface GitHubProjectsProps {
  isDarkMode: boolean;
}

// Human-readable repo names / descriptions
const REPO_META: Record<string, { displayName: string; description: string }> = {
  'Portfolio-v2': { displayName: 'Portfolio v2', description: 'Personal portfolio site built with React + TypeScript + Vite.' },
  VKJ: { displayName: 'VKJ Client Site', description: 'Full-stack client website built with the MERN stack.' },
  'Capstone-Project-2': { displayName: 'Capstone Project II', description: 'Java-based capstone project covering data structures & algorithms.' },
  'Capstone-Project1-java': { displayName: 'Capstone Project I', description: 'Java capstone – foundational OOP patterns and problem solving.' },
  'Capstone-Project': { displayName: 'Capstone Project', description: 'Academic capstone demonstrating full software engineering lifecycle.' },
  webcrawler: { displayName: 'Web Crawler', description: 'Python-based web crawler using requests & BeautifulSoup.' },
  'Amazon_Clone_Frontend': { displayName: 'Amazon Clone', description: 'Pixel-accurate Amazon.com frontend clone using pure HTML/CSS/JS.' },
  'Data_Visualization': { displayName: 'Data Visualization', description: 'Jupyter Notebook collection for exploratory data analysis & charts.' },
  Portfolio: { displayName: 'Portfolio v1', description: 'First personal portfolio built with React.js and vanilla CSS.' },
  'Azure_Developer_Community': { displayName: 'Azure Dev Community', description: 'Resources and demos for the Azure Developer Community event.' },
  'Hackathon4.0': { displayName: 'Hackathon 4.0', description: 'Hackathon project submission showcasing rapid prototyping skills.' },
  'INTERN-TASK': { displayName: 'Internship Tasks', description: 'Task repository for Weblicious internship — MERN stack features.' },
  'Strapi_Backend': { displayName: 'Strapi Backend', description: 'Headless CMS backend powered by Strapi for a client project.' },
  SystemOptimizer: { displayName: 'System Optimizer', description: 'Cross-platform shell scripts to safely clean & optimize Windows/Linux.' },
  Universal_Scraper: { displayName: 'Universal Scraper', description: 'High-performance modular web scraping engine with FastAPI + Playwright.' },
  Cyber_Kill_Chain: { displayName: 'Cyber Kill Chain Analyzer', description: 'ML-powered dashboard to classify & visualize cyber-attack progression.' },
  Hybrid_NIDS: { displayName: 'Hybrid NIDS', description: 'Hybrid Network Intrusion Detection System combining signature & anomaly detection.' },
  Dark_Web_Monitor: { displayName: 'Dark Web Monitor', description: 'Real-time threat intelligence dashboard monitoring dark-web data leaks.' },
  GDriveX: { displayName: 'GDriveX', description: 'Google Drive clone built with React, Firebase & Tailwind CSS.' },
  Orbital_Stock: { displayName: 'Orbital Stock', description: 'Real-time stock tracker with orbital data visualization.' },
};

const GitHubProjectItem: React.FC<{ repo: Repo; index: number; isDarkMode: boolean }> = ({
  repo,
  index,
  isDarkMode,
}) => {
  const [showImage, setShowImage] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const meta = REPO_META[repo.name] ?? {
    displayName: repo.name.replace(/_/g, ' ').replace(/-/g, ' '),
    description: repo.description ?? 'A project by Pulkit Tiwari.',
  };
  const langColor = LANG_COLORS[repo.language ?? ''] ?? '#8b8b8b';

  // Use GitHub's OpenGraph image as the project preview
  const imageUrl = `https://opengraph.githubassets.com/1/${repo.full_name}`;

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={() => setShowImage(true)}
      onMouseLeave={() => setShowImage(false)}
      onMouseMove={handleMouseMove}
      className={`github-project-item relative flex items-center py-8 border-b cursor-pointer group
        ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      {/* Index */}
      <div
        className={`flex-shrink-0 w-12 text-2xl font-bold opacity-30 group-hover:opacity-100 transition-opacity duration-300
          ${isDarkMode ? 'text-white' : 'text-gray-400'}`}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0 ml-4">
        <h3
          className={`text-3xl md:text-5xl font-extrabold truncate transition-all duration-300 group-hover:pl-4
            ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'}`}
        >
          {meta.displayName}
        </h3>
        <p
          className={`text-sm mt-1 truncate hidden sm:block transition-opacity duration-300
            ${isDarkMode ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600'}`}
        >
          {meta.description}
        </p>
      </div>

      {/* Language badge */}
      {repo.language && (
        <div className="flex-shrink-0 ml-4 hidden md:flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: langColor }}
          />
          <span
            className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {repo.language}
          </span>
        </div>
      )}

      {/* Hover Image Preview */}
      <AnimatePresence>
        {showImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              x: "-50%",
              y: "-110%", // Position above the cursor
            }}
          >
            <div className={`p-1 rounded-xl shadow-2xl overflow-hidden
              ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <img
                src={imageUrl}
                alt={repo.name}
                className="w-64 h-auto rounded-lg object-cover"
                onError={(e) => {
                   // Fallback if OG image fails
                   e.currentTarget.src = `https://placehold.co/600x300/111/fff?text=${repo.name}`;
                }}
              />
              <div className="px-3 py-2">
                <p className={`text-xs font-mono mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {repo.full_name}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                   <span className="text-yellow-500">★ {repo.stargazers_count}</span>
                   <span className="text-blue-500">🍴 {repo.forks_count}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.a>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const GitHubProjects: React.FC<GitHubProjectsProps> = ({ isDarkMode }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    fetchAllRepos()
      .then(setRepos)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Derive unique languages for filter buttons
  const languages = ['All', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[]))];

  const filtered = filter === 'All' ? repos : repos.filter(r => r.language === filter);

  return (
    <div
      id="github"
      className={`w-full min-h-screen bg-transparent flex flex-col items-center pt-24 pb-32
        ${isDarkMode ? 'text-white' : 'text-black'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
            PROJECTS
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            A collection of my open-source work and personal projects, fetched live from my GitHub profiles.
          </p>
        </motion.div>

        {/* Language Filter */}
        {!loading && !error && (
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setFilter(lang)}
                className={`text-sm px-6 py-2 rounded-full font-bold uppercase tracking-widest transition-all duration-300
                  ${filter === lang
                    ? isDarkMode
                      ? 'bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                      : 'bg-black text-white scale-110 shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                    : isDarkMode
                    ? 'border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
                    : 'border border-gray-200 text-gray-400 hover:text-black hover:border-gray-400'
                  }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className={`w-12 h-12 border-4 rounded-full animate-spin
                ${isDarkMode ? 'border-white border-t-transparent' : 'border-black border-t-transparent'}`}
            />
            <p className="text-sm font-mono animate-pulse uppercase tracking-widest">Fetching Repositories...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20 bg-red-500/10 rounded-2xl border border-red-500/20">
            <p className="text-red-500 font-bold mb-2">Sync Error</p>
            <p className="text-sm opacity-70">{error}</p>
          </div>
        )}

        {/* Project list */}
        {!loading && !error && (
          <div className="border-t border-gray-800">
            {filtered.length > 0 ? (
              filtered.map((repo, index) => (
                <GitHubProjectItem
                  key={repo.id}
                  repo={repo}
                  index={index}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              <p className={`text-center py-20 text-2xl font-bold opacity-30 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                NO PROJECTS FOUND
              </p>
            )}
          </div>
        )}

        {/* View all on GitHub */}
        {!loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex flex-col sm:flex-row justify-center gap-6 mt-24"
          >
            <a
              href="https://github.com/PulkitTiwari87"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-black uppercase tracking-tighter transition-all
                ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              <span>Main Profile (@PulkitTiwari87)</span>
              <span className="opacity-40 group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href="https://github.com/PulkitTiwari51"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-black uppercase tracking-tighter transition-all border
                ${isDarkMode ? 'border-gray-700 text-white hover:bg-gray-900' : 'border-gray-200 text-black hover:bg-gray-50'}`}
            >
              <span>Secondary Profile (@PulkitTiwari51)</span>
              <span className="opacity-40 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GitHubProjects;
