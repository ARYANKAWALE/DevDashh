/**
 * Data sources (all public, no tokens):
 *  - GitHub REST      https://api.github.com
 *  - GitHub calendar  https://github-contributions-api.jogruber.de
 *  - LeetCode proxy   https://leetcode-api-faisalshohag.vercel.app
 *
 * Every response is cached in sessionStorage for a short TTL so navigating
 * between pages doesn't burn through GitHub's unauthenticated rate limit.
 */

const CACHE_PREFIX = "devdash.cache:";
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchJSON(url, { ttl = DEFAULT_TTL } = {}) {
  const key = CACHE_PREFIX + url;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key));
    if (hit && Date.now() - hit.t < ttl) return hit.d;
  } catch {
    /* cache miss */
  }

  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
  } catch {
    /* quota exceeded — skip caching */
  }
  return data;
}

/* ── GitHub ─────────────────────────────────────────────── */

export const gh = {
  profile: (u) => fetchJSON(`https://api.github.com/users/${encodeURIComponent(u)}`),
  repos: (u) =>
    fetchJSON(
      `https://api.github.com/users/${encodeURIComponent(u)}/repos?per_page=100&sort=pushed`
    ),
  events: (u) =>
    fetchJSON(
      `https://api.github.com/users/${encodeURIComponent(u)}/events/public?per_page=100`
    ),
  contributions: (u) =>
    fetchJSON(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(u)}?y=last`
    ),
};

/** Throws if the username doesn't exist on GitHub. Returns the profile. */
export async function validateGitHub(username) {
  try {
    return await gh.profile(username);
  } catch (e) {
    if (e.status === 404) throw new Error("GitHub user not found. Check the username.");
    if (e.status === 403)
      throw new Error("GitHub rate limit reached. Try again in a few minutes.");
    throw new Error("Couldn't reach GitHub. Check your connection.");
  }
}

/* ── LeetCode ───────────────────────────────────────────── */

export const lc = {
  profile: (u) =>
    fetchJSON(`https://leetcode-api-faisalshohag.vercel.app/${encodeURIComponent(u)}`),
};

/** Throws if the username doesn't exist on LeetCode. Returns the stats. */
export async function validateLeetCode(username) {
  let data;
  try {
    data = await lc.profile(username);
  } catch (e) {
    if (e.status === 429)
      throw new Error("LeetCode data source is rate-limited right now. Try again in a minute.");
    throw new Error("Couldn't reach LeetCode right now. Try again in a moment.");
  }
  if (data?.totalSolved === undefined)
    throw new Error("LeetCode user not found. Check the username.");
  return data;
}

/**
 * Acceptance rate isn't returned directly by the proxy — derive it from
 * matchedUserStats (accepted vs total submissions, difficulty "All").
 */
export function lcAcceptance(user) {
  if (user?.acceptanceRate != null) return Number(user.acceptanceRate);
  const ac = user?.matchedUserStats?.acSubmissionNum?.find((x) => x.difficulty === "All");
  const total = user?.matchedUserStats?.totalSubmissionNum?.find((x) => x.difficulty === "All");
  if (!ac || !total || !total.submissions) return null;
  return (ac.submissions / total.submissions) * 100;
}

/* ── formatting helpers ─────────────────────────────────── */

export function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("en-US");
}

export function kfmt(n) {
  if (n === null || n === undefined) return "—";
  const num = Number(n);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(num);
}

export function timeAgo(input) {
  const date = input instanceof Date ? input : new Date(input);
  const secs = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [s, label] of units) {
    if (secs >= s) return `${Math.floor(secs / s)}${label} ago`;
  }
  return "just now";
}

/* GitHub linguist-ish colors for common languages */
const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#663399",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  "Jupyter Notebook": "#DA5B0B",
  Lua: "#000080",
  R: "#198CE7",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  "Objective-C": "#438eff",
  Zig: "#ec915c",
};

const FALLBACK_COLORS = ["#8b949e", "#d2a8ff", "#79c0ff", "#ffa657", "#7ee787"];

export function langColor(name) {
  if (LANG_COLORS[name]) return LANG_COLORS[name];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return FALLBACK_COLORS[Math.abs(h) % FALLBACK_COLORS.length];
}
