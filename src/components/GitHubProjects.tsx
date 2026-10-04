import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllRepos } from '../utils/github';
import type { Repo } from '../types';
import { LANG_COLORS, REPO_META, isFlagship, orderRepos, projectUrl } from '../data/repos';

interface GitHubProjectsProps {
  isDarkMode: boolean;
}

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
      href={projectUrl(repo)}
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
        aria-hidden="true"
        className={`flex-shrink-0 w-12 text-2xl font-bold opacity-30 group-hover:opacity-100 transition-opacity duration-300
          ${isDarkMode ? 'text-white' : 'text-gray-600'}`}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0 ml-4">
        <h3
          className={`text-3xl md:text-5xl font-semibold type-headline md:truncate break-words transition-all duration-300 group-hover:pl-4
            ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'}`}
        >
          {meta.displayName}
        </h3>
        <p
          className={`text-sm mt-1 truncate hidden sm:block transition-opacity duration-300
            ${isDarkMode ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'}`}
        >
          {meta.description}
        </p>
      </div>

      {/* Language badge */}
      {repo.language && (
        <div className="flex-shrink-0 ml-4 hidden md:flex items-center gap-1.5 group-hover:opacity-100 transition-opacity">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: langColor }}
          />
          <span
            className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
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
                   e.currentTarget.onerror = null; // avoid an error loop if the fallback fails too
                   e.currentTarget.src = `https://placehold.co/600x300/111/fff?text=${encodeURIComponent(repo.name)}`;
                }}
              />
              <div className="px-3 py-2">
                <p className={`text-xs tabular-nums mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {repo.full_name}
                </p>
                <div className="flex items-center gap-3 text-xs font-medium type-label">
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
      .then(fetchedRepos => {
        const finalRepos = [...fetchedRepos];

        // Ensure GDriveX is in the list of repos
        const hasGDriveX = finalRepos.some(r => r.name.toLowerCase() === 'gdrivex');
        if (!hasGDriveX) {
          const mockGDrive: Repo = {
            id: 999998,
            name: 'GDriveX',
            full_name: 'PulkitTiwari87/GDriveX',
            description: 'Google Drive clone built with React, Firebase & Tailwind CSS.',
            html_url: 'https://github.com/PulkitTiwari87/GDriveX',
            stargazers_count: 0,
            forks_count: 0,
            language: 'JavaScript',
            fork: false,
            updated_at: new Date().toISOString(),
            homepage: 'https://g-drive-x.vercel.app',
            owner: {
              login: 'PulkitTiwari87',
              avatar_url: 'https://github.com/PulkitTiwari87.png',
            }
          };
          finalRepos.unshift(mockGDrive);
        }

        setRepos(orderRepos(finalRepos));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);


  // Derive unique languages for filter buttons
  const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[]));
  const filterOptions = ['All', 'Flagship', ...languages];

  const filtered = filter === 'All'
    ? repos
    : filter === 'Flagship'
    ? repos.filter(isFlagship)
    : repos.filter(r => r.language === filter);

  return (
    <div
      id="github"
      className={`w-full min-h-screen bg-transparent flex flex-col items-center pt-24 pb-32
        ${isDarkMode ? 'text-white' : 'text-black'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Heading */}
        <motion.div
          id="projects"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-5xl min-[400px]:text-6xl md:text-8xl font-semibold mb-6 type-display">
            PROJECTS
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            A collection of my open-source work and personal projects, fetched live from my GitHub profile.
          </p>
        </motion.div>

        {/* Language Filter */}
        {!loading && !error && (
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {filterOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                aria-pressed={filter === opt}
                className={`text-sm px-6 py-2 rounded-full font-medium type-label transition-all duration-300
                  ${filter === opt
                    ? isDarkMode
                      ? 'bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                      : 'bg-black text-white scale-110 shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                    : isDarkMode
                    ? 'border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                    : 'border border-gray-300 text-gray-600 hover:text-black hover:border-gray-500'
                  }`}
              >
                {opt}
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
            <p className="text-sm animate-pulse type-label">Fetching Repositories...</p>
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
          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
              className={`group flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-medium tracking-normal transition-all
                ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              <span>View all on GitHub (@PulkitTiwari87)</span>
              <span aria-hidden="true" className="opacity-40 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GitHubProjects;
