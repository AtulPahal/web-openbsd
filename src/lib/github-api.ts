/**
 * Live GitHub API Client with in-memory caching, timeout protection, and offline fallback.
 * Fetches real user profile, repositories, stars, and language stats.
 */

import { PORTFOLIO_DATA } from "@/lib/portfolio-data";

export interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics?: string[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function fetchGitHubUser(username = "AtulPahal"): Promise<GitHubUser> {
  const cacheKey = `gh-user-${username}`;
  const cached = getCached<GitHubUser>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(4000) : undefined,
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data: GitHubUser = await res.json();
    setCache(cacheKey, data);
    return data;
  } catch {
    // Fallback to portfolio-data defaults
    return {
      login: username,
      name: PORTFOLIO_DATA.name,
      bio: PORTFOLIO_DATA.title,
      avatar_url: "https://avatars.githubusercontent.com/u/134540670?v=4",
      html_url: `https://github.com/${username}`,
      public_repos: 12,
      followers: 18,
      following: 24,
      created_at: "2023-05-24T00:00:00Z",
    };
  }
}

export async function fetchGitHubRepos(username = "AtulPahal"): Promise<GitHubRepo[]> {
  const cacheKey = `gh-repos-${username}`;
  const cached = getCached<GitHubRepo[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(4000) : undefined,
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data: GitHubRepo[] = await res.json();
    setCache(cacheKey, data);
    return data;
  } catch {
    // Fallback from PORTFOLIO_DATA projects
    return PORTFOLIO_DATA.projects.map((p, idx) => ({
      id: idx + 1000,
      name: p.title.toLowerCase().replace(/\s+/g, "-"),
      full_name: `${username}/${p.title.toLowerCase().replace(/\s+/g, "-")}`,
      description: p.description,
      html_url: p.links?.[0]?.href || `https://github.com/${username}`,
      stargazers_count: 5 + idx * 3,
      forks_count: 2 + idx,
      language: p.stack[0] || "TypeScript",
      updated_at: new Date().toISOString(),
    }));
  }
}
