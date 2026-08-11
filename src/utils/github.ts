import { Repo } from '../types';

const GITHUB_USERNAMES = ['PulkitTiwari51', 'PulkitTiwari87'];

// Repos to exclude (profile READMEs, forks, etc.)
const EXCLUDED_REPOS = ['PulkitTiwari51', 'PulkitTiwari87', 'Get-Set-Git', 'WHTEGOD', 'README'];

export async function fetchRepos(username: string): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) throw new Error(`GitHub API error for ${username}: ${res.status}`);
  const data: Repo[] = await res.json();
  return data.filter(r => !r.fork && !EXCLUDED_REPOS.includes(r.name));
}

export async function fetchAllRepos(): Promise<Repo[]> {
  const results = await Promise.allSettled(GITHUB_USERNAMES.map(fetchRepos));
  const combined: Repo[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      combined.push(...result.value);
    }
  }
  // Sort by most recently updated
  return combined.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}
