import { backendFetch } from "./backend.js";
import { lcAcceptance } from "./api.js";

/** Builds a compact stats payload for the AI insights endpoint. */
export function buildInsightsStats({ github, leetcode, gh, lc }) {
  const stats = { generatedAt: new Date().toISOString() };

  if (github && gh?.status === "ready") {
    stats.github = {
      username: github,
      contributionsThisYear: gh.yearTotal ?? 0,
      currentStreak: gh.streaks?.current ?? 0,
      longestStreak: gh.streaks?.longest ?? 0,
      publicRepos: gh.profile?.public_repos ?? null,
      totalStars: gh.totalStars ?? 0,
      topLanguages: (gh.languages ?? []).slice(0, 5).map((l) => l.name),
      topRepos: (gh.topRepos ?? []).slice(0, 3).map((r) => ({
        name: r.name,
        stars: r.stargazers_count,
        language: r.language,
      })),
    };
  }

  if (leetcode && lc?.user) {
    const user = lc.user;
    stats.leetcode = {
      username: user.username ?? leetcode,
      totalSolved: user.totalSolved ?? 0,
      easySolved: user.easySolved ?? 0,
      mediumSolved: user.mediumSolved ?? 0,
      hardSolved: user.hardSolved ?? 0,
      ranking: user.ranking ?? null,
      acceptanceRate: lcAcceptance(user),
      submissionsThisYear: lc.yearTotal ?? 0,
      currentStreak: lc.streaks?.current ?? 0,
      longestStreak: lc.streaks?.longest ?? 0,
      recentSubmissions: (user.recentSubmissions ?? []).slice(0, 5).map((s) => ({
        title: s.title,
        status: s.statusDisplay,
        language: s.lang,
      })),
    };
  }

  return stats;
}

export async function fetchInsights(stats) {
  return backendFetch("/api/v1/ai/insights", {
    method: "POST",
    auth: true,
    body: { stats },
  });
}
