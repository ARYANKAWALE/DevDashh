import { useEffect, useMemo, useState } from "react";
import { gh } from "../lib/api";
import { useConnections } from "../lib/connections";

/** Builds 364 day-cells (52 weeks) from the contributions API response. */
function buildCells(contributions) {
  const byDate = new Map();
  for (const c of contributions ?? []) byDate.set(c.date, c);

  const cells = [];
  const today = new Date();
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const hit = byDate.get(key);
    cells.push({
      date: d,
      count: hit ? hit.count : 0,
      level: hit ? hit.level : 0,
    });
  }
  return cells;
}

function computeStreaks(cells) {
  let current = 0;
  // today may not have activity yet — start counting from yesterday if so
  let i = cells.length - 1;
  if (cells[i] && cells[i].count === 0) i--;
  for (; i >= 0; i--) {
    if (cells[i].count > 0) current++;
    else break;
  }

  let longest = 0;
  let run = 0;
  for (const c of cells) {
    run = c.count > 0 ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  return { current, longest };
}

/** Summarizes public events into a readable activity feed. */
function buildFeed(events) {
  const feed = [];
  for (const ev of events ?? []) {
    const repo = ev.repo?.name ?? "";
    const at = ev.created_at;
    switch (ev.type) {
      case "PushEvent": {
        const n = ev.payload?.commits?.length ?? 0;
        if (n > 0)
          feed.push({ at, verb: "pushed", detail: `${n} commit${n > 1 ? "s" : ""}`, repo });
        break;
      }
      case "PullRequestEvent":
        feed.push({
          at,
          verb: `${ev.payload?.action ?? "updated"} a pull request`,
          detail: ev.payload?.pull_request?.title ?? "",
          repo,
        });
        break;
      case "IssuesEvent":
        feed.push({
          at,
          verb: `${ev.payload?.action ?? "updated"} an issue`,
          detail: ev.payload?.issue?.title ?? "",
          repo,
        });
        break;
      case "CreateEvent":
        if (ev.payload?.ref_type === "repository")
          feed.push({ at, verb: "created repository", detail: "", repo });
        else if (ev.payload?.ref_type === "branch")
          feed.push({ at, verb: "created branch", detail: ev.payload?.ref ?? "", repo });
        break;
      case "WatchEvent":
        feed.push({ at, verb: "starred", detail: "", repo });
        break;
      case "ForkEvent":
        feed.push({ at, verb: "forked", detail: "", repo });
        break;
      case "ReleaseEvent":
        feed.push({
          at,
          verb: "published release",
          detail: ev.payload?.release?.tag_name ?? "",
          repo,
        });
        break;
      default:
        break;
    }
    if (feed.length >= 10) break;
  }
  return feed;
}

export function useGitHubData() {
  const { github: username } = useConnections();
  const [state, setState] = useState({
    status: username ? "loading" : "idle",
    error: null,
    profile: null,
    repos: [],
    contributions: null,
    events: [],
  });

  useEffect(() => {
    if (!username) {
      setState({ status: "idle", error: null, profile: null, repos: [], contributions: null, events: [] });
      return;
    }

    let alive = true;
    setState((s) => ({ ...s, status: "loading", error: null }));

    (async () => {
      const [profile, repos, contributions, events] = await Promise.allSettled([
        gh.profile(username),
        gh.repos(username),
        gh.contributions(username),
        gh.events(username),
      ]);
      if (!alive) return;

      if (profile.status === "rejected") {
        const status = profile.reason?.status;
        setState({
          status: "error",
          error:
            status === 403
              ? "GitHub rate limit reached. Data will load again in a few minutes."
              : status === 404
              ? `GitHub user “${username}” was not found.`
              : "Couldn't reach GitHub right now.",
          profile: null,
          repos: [],
          contributions: null,
          events: [],
        });
        return;
      }

      setState({
        status: "ready",
        error: null,
        profile: profile.value,
        repos: repos.status === "fulfilled" ? repos.value : [],
        contributions: contributions.status === "fulfilled" ? contributions.value : null,
        events: events.status === "fulfilled" ? events.value : [],
      });
    })();

    return () => {
      alive = false;
    };
  }, [username]);

  const derived = useMemo(() => {
    const { repos, contributions, events } = state;
    const own = repos.filter((r) => !r.fork);

    const totalStars = own.reduce((s, r) => s + (r.stargazers_count ?? 0), 0);
    const totalForks = own.reduce((s, r) => s + (r.forks_count ?? 0), 0);

    // language share weighted by repo size (KB) with a floor so tiny repos count
    const langMap = new Map();
    for (const r of own) {
      if (!r.language) continue;
      const w = Math.max(r.size ?? 0, 30);
      langMap.set(r.language, (langMap.get(r.language) ?? 0) + w);
    }
    const langTotal = [...langMap.values()].reduce((a, b) => a + b, 0) || 1;
    const languages = [...langMap.entries()]
      .map(([name, w]) => ({ name, pct: (w / langTotal) * 100 }))
      .sort((a, b) => b.pct - a.pct);

    const topRepos = [...own]
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          new Date(b.pushed_at) - new Date(a.pushed_at)
      )
      .slice(0, 6);

    const cells = contributions ? buildCells(contributions.contributions) : null;
    const yearTotal = contributions?.total
      ? Object.values(contributions.total).reduce((a, b) => a + b, 0)
      : cells
      ? cells.reduce((s, c) => s + c.count, 0)
      : null;
    const streaks = cells ? computeStreaks(cells) : { current: null, longest: null };

    return {
      totalStars,
      totalForks,
      languages,
      topRepos,
      cells,
      yearTotal,
      streaks,
      feed: buildFeed(events),
    };
  }, [state]);

  return { username, ...state, ...derived };
}
