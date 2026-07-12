import React, { useState, useEffect } from "react";
import {
  User,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Code2,
  AlertCircle,
} from "lucide-react";

/* ─── tiny helper ─── */
const LC_KEY = "leetcode_users";

function Badge({ type, children }) {
  const styles = {
    easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    medium: "bg-amber-100   text-amber-700   dark:bg-amber-900/40   dark:text-amber-300",
    hard:   "bg-rose-100    text-rose-700    dark:bg-rose-900/40    dark:text-rose-300",
    total:  "bg-indigo-100  text-indigo-700  dark:bg-indigo-900/40  dark:text-indigo-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[type]}`}>
      {children}
    </span>
  );
}

/* ─── Weekly activity bar chart ─── */
function WeeklyChart({ submissionCalendar }) {
  const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Build an array of {day, count} for the last 7 days (Mon→Sun of current week)
  const bars = React.useMemo(() => {
    const cal = submissionCalendar ?? {};
    // anchor to "this week" Mon–Sun
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    // shift so week starts Monday: Mon=0 … Sun=6
    const mondayOffset = (dayOfWeek + 6) % 7;

    return DAYS.map((label, i) => {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - mondayOffset + i);
      const ts = Math.floor(d.getTime() / 1000).toString();
      return { label, count: cal[ts] ?? 0 };
    });
  }, [submissionCalendar]);

  const maxCount = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div
      style={{ background: "#161b22", borderRadius: 12 }}
      className="p-3 mt-1"
    >
      <p className="text-[10px] font-semibold text-emerald-400 mb-2 tracking-wider uppercase">
        This week
      </p>
      <div className="flex items-end gap-1.5" style={{ height: 56 }}>
        {bars.map(({ label, count }) => {
          const heightPct = Math.max((count / maxCount) * 100, count > 0 ? 12 : 6);
          // brighter green for the tallest bar
          const isMax = count === maxCount && count > 0;
          return (
            <div key={label} className="flex flex-col items-center flex-1 gap-1">
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height: `${heightPct}%`,
                  background: isMax
                    ? "#39d353"
                    : count > 0
                    ? "#26a641"
                    : "#21262d",
                  minHeight: 3,
                }}
              />
              <span
                style={{ fontSize: 8, color: "#8b949e", letterSpacing: "0.05em" }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserCard({ user, onRemove }) {
  const rank = user.ranking
    ? `#${Number(user.ranking).toLocaleString()}`
    : "—";
  const pct = user.totalQuestions
    ? Math.round((user.totalSolved / user.totalQuestions) * 100)
    : 0;

  return (
    <div
      className="group relative flex flex-col gap-4 p-5 rounded-2xl border
                 bg-[--color-surface-container-low] border-[--color-separator]
                 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* avatar + handle */}
      <div className="flex items-center gap-3">
        <div
          className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                     flex items-center justify-center text-white font-bold text-lg shrink-0"
        >
          {user.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[--color-on-surface] truncate">
            {user.username}
          </p>
          <p className="text-xs text-[--color-outline]">
            Global rank&nbsp;{rank}
          </p>
        </div>
        <button
          onClick={() => onRemove(user.username)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg
                     hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500"
          title="Remove user"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[--color-outline] mb-1">
          <span>Problems solved</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-[--color-surface-dim] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* stat pills */}
      <div className="flex flex-wrap gap-2">
        <Badge type="easy">  Easy &nbsp;{user.easySolved}</Badge>
        <Badge type="medium">Med &nbsp;{user.mediumSolved}</Badge>
        <Badge type="hard">  Hard &nbsp;{user.hardSolved}</Badge>
        <Badge type="total"> Total {user.totalSolved}</Badge>
      </div>

      {/* acceptance rate */}
      {user.acceptanceRate != null && (
        <p className="text-xs text-[--color-outline]">
          Acceptance rate&nbsp;
          <span className="font-medium text-[--color-on-surface]">
            {Number(user.acceptanceRate).toFixed(1)}%
          </span>
        </p>
      )}

      {/* weekly activity chart */}
      {user.submissionCalendar && (
        <WeeklyChart submissionCalendar={user.submissionCalendar} />
      )}
    </div>
  );
}

export default function Settings() {
  const [usernames, setUsernames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LC_KEY)) ?? [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  /* persist & refresh whenever usernames change */
  useEffect(() => {
    localStorage.setItem(LC_KEY, JSON.stringify(usernames));
    if (usernames.length === 0) { setUsersData([]); return; }

    (async () => {
      setLoadingFetch(true);
      const results = await Promise.all(
        usernames.map(async (u) => {
          try {
            const r = await fetch(
              `https://leetcode-api-faisalshohag.vercel.app/${u}`
            );
            const d = await r.json();
            return d.totalSolved !== undefined ? { username: u, ...d } : null;
          } catch { return null; }
        })
      );
      setUsersData(results.filter(Boolean).sort((a, b) => b.totalSolved - a.totalSolved));
      setLoadingFetch(false);
    })();
  }, [usernames]);

  /* validate + add */
  async function handleAdd(e) {
    e.preventDefault();
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;
    if (usernames.includes(trimmed)) {
      setError("This username is already added.");
      return;
    }

    setValidating(true);
    setError("");

    try {
      const r = await fetch(
        `https://leetcode-api-faisalshohag.vercel.app/${trimmed}`
      );
      const d = await r.json();

      if (d.totalSolved === undefined) {
        setError("LeetCode username not found. Please check and try again.");
      } else {
        setUsernames((prev) => [...prev, trimmed]);
        setInput("");
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  function handleRemove(username) {
    setUsernames((prev) => prev.filter((u) => u !== username));
  }

  return (
    <div className="min-h-full px-6 py-8 max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
            <Code2 size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-[--color-on-surface] tracking-tight">
            LeetCode Settings
          </h1>
        </div>
        <p className="text-sm text-[--color-outline] ml-12">
          Add usernames to track progress across your dashboard.
        </p>
      </div>

      {/* ── Add username card ── */}
      <div className="rounded-2xl border bg-[--color-surface-container-low] border-[--color-separator] p-6 mb-8 shadow-sm">
        <h2 className="font-semibold text-[--color-on-surface] mb-4 flex items-center gap-2">
          <User size={16} className="text-indigo-500" />
          Add a LeetCode Username
        </h2>

        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="relative flex-1">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-outline] pointer-events-none"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="e.g. neal_wu"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[--color-outline-variant]
                         bg-[--color-surface-container] text-[--color-on-surface] text-sm
                         outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                         transition-all placeholder:text-[--color-outline]"
            />
          </div>
          <button
            type="submit"
            disabled={validating || !input.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                       bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {validating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {validating ? "Checking…" : "Add User"}
          </button>
        </form>

        {/* feedback messages */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
            <XCircle size={15} />
            {error}
          </div>
        )}
        {addSuccess && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={15} />
            Username added successfully!
          </div>
        )}
      </div>

      {/* ── User cards ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[--color-on-surface] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-indigo-500" />
            Tracked Users
            <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40
                             text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              {usernames.length}
            </span>
          </h2>
          {usernames.length > 0 && (
            <button
              onClick={() => setUsernames([])}
              className="text-xs text-rose-500 hover:text-rose-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {loadingFetch && (
          <div className="flex items-center justify-center gap-3 py-16 text-[--color-outline]">
            <Loader2 size={22} className="animate-spin text-indigo-500" />
            <span className="text-sm">Loading stats…</span>
          </div>
        )}

        {!loadingFetch && usernames.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[--color-outline]">
            <AlertCircle size={36} className="opacity-40" />
            <p className="text-sm">No users added yet. Add a username above to get started.</p>
          </div>
        )}

        {!loadingFetch && usersData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {usersData.map((u) => (
              <UserCard key={u.username} user={u} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
