import type { Repo } from '../types';
import { SECONDARY_FEATURED, orderRepos } from '../data/repos';

// PulkitTiwari87 is the main profile. PulkitTiwari51 is secondary: none of its repos are
// listed unless named in SECONDARY_FEATURED (src/data/repos.ts).
const PRIMARY_USERNAME = 'PulkitTiwari87';
const SECONDARY_USERNAME = 'PulkitTiwari51';

// Repos to exclude (profile READMEs, forks, etc.)
const EXCLUDED_REPOS = ['PulkitTiwari87', 'PulkitTiwari51', 'Get-Set-Git', 'WHTEGOD', 'README', 'Open_When_Messages'];
// Compared case-insensitively with '-' / '_' ignored, so name variants are also excluded.
const normalizeName = (n: string) => n.toLowerCase().replace(/[-_]/g, '');
const EXCLUDED_NORMALIZED = EXCLUDED_REPOS.map(normalizeName);

export async function fetchRepos(username: string): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) throw new Error(`GitHub API error for ${username}: ${res.status}`);
  const data: Repo[] = await res.json();
  return data.filter(r => !r.fork && !EXCLUDED_NORMALIZED.includes(normalizeName(r.name)));
}

export async function fetchAllRepos(): Promise<Repo[]> {
  const combined = await fetchRepos(PRIMARY_USERNAME);
  // Only hit the secondary profile (and the API rate limit) if something is whitelisted.
  if (SECONDARY_FEATURED.length > 0) {
    try {
      const secondary = await fetchRepos(SECONDARY_USERNAME);
      combined.push(...secondary.filter(r => SECONDARY_FEATURED.includes(r.name)));
    } catch {
      // The secondary profile is optional; keep the primary list.
    }
  }
  return orderRepos(combined);
}
