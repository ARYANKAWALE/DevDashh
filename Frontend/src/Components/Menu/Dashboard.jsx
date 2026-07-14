import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Share2, 
  Newspaper, 
  SlidersHorizontal, 
  Lock, 
  Mic, 
  Terminal as TerminalIcon, 
  Rocket, 
  Compass,
  Link as LinkIcon,
  Code2
} from "lucide-react";

// ── Contribution Grid Helpers ────────────────────────────────────────────────

/**
 * Generates an array of 364 day-objects (52 weeks × 7 days) using LeetCode submission calendar.
 */
function generateLeetCodeContributionData(submissionCalendar) {
  const today = new Date();
  const cells = [];
  const cal = submissionCalendar ?? {};

  for (let i = 363; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // LeetCode calendar keys are UTC midnight timestamps in seconds
    const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const ts = Math.floor(utcMidnight / 1000).toString();
    const count = cal[ts] ? Number(cal[ts]) : 0;

    const level =
      count === 0 ? 0
      : count <= 1 ? 1
      : count <= 3 ? 2
      : count <= 6 ? 3
      : 4;

    cells.push({ date, count, level });
  }

  return cells;
}

/**
 * Generates mock contribution data when no profile is linked.
 */
function generateContributionData() {
  const today = new Date();
  const cells = [];

  for (let i = 363; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const rand = Math.random();
    const count =
      rand < 0.45 ? 0
      : rand < 0.7 ? Math.floor(Math.random() * 3) + 1
      : rand < 0.88 ? Math.floor(Math.random() * 5) + 3
      : rand < 0.97 ? Math.floor(Math.random() * 8) + 6
      : Math.floor(Math.random() * 12) + 10;

    const level =
      count === 0 ? 0
      : count <= 2 ? 1
      : count <= 5 ? 2
      : count <= 9 ? 3
      : 4;

    cells.push({ date, count, level });
  }

  return cells;
}

/** Tailwind-safe colour classes per intensity level */
const LEVEL_COLORS = [
  "bg-[#111420]",                                          // 0 – empty
  "bg-[#0e4429]",                                          // 1 – dim
  "bg-[#006d32]",                                          // 2 – mid
  "bg-[#26a641]",                                          // 3 – bright
  "bg-[#39d353] shadow-[0_0_8px_rgba(57,211,83,0.4)]",     // 4 – neon
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ContributionGrid({ cells }) {
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="relative overflow-x-auto select-none py-1">
      {/* Day labels */}
      <div className="flex flex-col gap-[4px] absolute left-0 top-[6px] pr-1">
        {DAY_LABELS.map((d, i) => (
          <span key={d} className={`text-[8px] h-[10px] leading-[10px] font-bold ${i % 2 === 0 ? 'text-gray-600' : 'text-transparent'}`}>
            {d}
          </span>
        ))}
      </div>

      {/* Grid — column-major: 52 cols × 7 rows */}
      <div
        className="ml-6 grid gap-[4px]"
        style={{
          gridTemplateRows: "repeat(7, 10px)",
          gridAutoFlow: "column",
          gridAutoColumns: "10px",
        }}
      >
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`rounded-[2px] cursor-pointer transition-all duration-150 hover:scale-130 hover:z-10 ${
              LEVEL_COLORS[cell.level]
            }`}
            style={{ width: 10, height: 10 }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({
                text: `${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — ${cell.count} submission${cell.count !== 1 ? "s" : ""}`,
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-[9px] text-white bg-slate-950/95 border border-white/10 rounded shadow-2xl pointer-events-none -translate-x-1/2 -translate-y-8 font-medium backdrop-blur-sm"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

// ── Custom Weekly Bar Chart Widget ─────────────────────────────────────────────
function AlgorithmWeeklyChart({ submissionCalendar, isMock }) {
  const bars = React.useMemo(() => {
    const result = [];
    const now = new Date();
    const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
    const mockCounts = [1, 2, 1, 4, 3, 8, 5];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = DAYS_SHORT[d.getDay()];

      let count = 0;
      if (!isMock && submissionCalendar) {
        const utcMidnight = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
        const ts = Math.floor(utcMidnight / 1000).toString();
        count = submissionCalendar[ts] ? Number(submissionCalendar[ts]) : 0;
      } else {
        count = mockCounts[6 - i];
      }

      result.push({ label, count });
    }
    return result;
  }, [submissionCalendar, isMock]);

  const maxCount = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="flex flex-col gap-1.5 mt-2 bg-[#090a0f] border border-white/[0.03] p-2.5 rounded-xl">
      <div className="flex items-end justify-between h-14 px-2 gap-2">
        {bars.map(({ label, count }, idx) => {
          const pct = (count / maxCount) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div 
                className="w-full bg-gradient-to-t from-emerald-950/20 to-[#39d353]/70 rounded-[3px] transition-all duration-300 group-hover:to-[#39d353]"
                style={{ height: count > 0 ? `${Math.max(pct, 15)}%` : '4px', opacity: count > 0 ? 1 : 0.2 }}
                title={`${count} submissions`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between px-2 text-[8px] text-gray-600 font-extrabold tracking-wider">
        {bars.map((bar, idx) => (
          <span key={idx} className="w-full text-center">{bar.label}</span>
        ))}
      </div>
    </div>
  );
}

// ── Syntax Highlighted Code Editor Component ──────────────────────────────────
function TerminalCodeEditor() {
  return (
    <pre className="bg-[#07080c] border border-white/[0.03] rounded-lg p-3 text-[10px] sm:text-[11px] font-mono leading-normal overflow-x-auto text-gray-400 select-none">
      <code>
        <span className="text-pink-400 font-medium">const</span> <span className="text-blue-400">useConcurrentFetch</span> = (url) =&gt; &#123;{"\n"}
        {"  "}<span className="text-pink-400">const</span> [data, setData] = <span className="text-[#a5b4fc]">useState</span>(<span className="text-teal-400">null</span>);{"\n"}
        {"  "}<span className="text-pink-400">const</span> [isPending, startTransition] = <span className="text-[#a5b4fc]">useTransition</span>();{"\n\n"}
        {"  "}<span className="text-yellow-500">useEffect</span>(() =&gt; &#123;{"\n"}
        {"    "}<span className="text-teal-400">fetch</span>(url).<span className="text-[#a5b4fc]">then</span>(res =&gt; res.<span className="text-[#a5b4fc]">json</span>()).<span className="text-[#a5b4fc]">then</span>(json =&gt; &#123;{"\n"}
        {"      "}<span className="text-[#a5b4fc]">startTransition</span>(() =&gt; &#123;{"\n"}
        {"        "}<span className="text-[#a5b4fc]">setData</span>(json);{"\n"}
        {"      "}&#125;);{"\n"}
        {"    "}&#125;);{"\n"}
        {"  "}&#125;, []);{"\n"}
        &#125;;
      </code>
    </pre>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
function Dashboard() {
  // LeetCode users state linked with Settings
  const [usernames] = useState(() => {
    const saved = localStorage.getItem('leetcode_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usernames.length === 0) {
      setUsersData([]);
      return;
    }
    async function fetchAllUsersData() {
      try {
        setLoading(true);
        const promises = usernames.map(async (username) => {
          try {
            const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
            const data = await res.json();
            if (data.totalSolved !== undefined) {
              return { username, ...data }; 
            }
            return null;
          } catch (err) {
            console.error(`Error fetching ${username}:`, err);
            return null;
          }
        });
        const results = await Promise.all(promises);
        const validResults = results.filter(user => user !== null);
        validResults.sort((a, b) => b.totalSolved - a.totalSolved);
        setUsersData(validResults);
      } catch (err) {
        console.error("Error while data loading", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllUsersData();
  }, [usernames]);

  const hasLinkedUser = usersData.length > 0;
  const primaryUser = hasLinkedUser ? usersData[0] : null;

  // Generate cells based on whether we have a linked user or mock data
  const contributionCells = React.useMemo(() => {
    if (primaryUser && primaryUser.submissionCalendar) {
      return generateLeetCodeContributionData(primaryUser.submissionCalendar);
    }
    return generateContributionData();
  }, [primaryUser]);

  // Derived stats
  const yearlyTotal = contributionCells.reduce((s, c) => s + c.count, 0);
  const streak = (() => {
    let s = 0;
    for (let i = contributionCells.length - 1; i >= 0; i--) {
      if (contributionCells[i].count > 0) s++;
      else break;
    }
    return s;
  })();

  return (
    <div className="p-6 bg-[#090a0f] min-h-full text-white flex flex-col gap-6 overflow-y-auto">
      
      {/* ── Optional Link Banner if no profile is linked ── */}
      {!hasLinkedUser && !loading && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between gap-3 text-xs select-none">
          <div className="flex items-center gap-2 text-blue-300 font-medium">
            <LinkIcon size={14} className="text-blue-400" />
            <span>💡 You haven't linked a LeetCode profile yet. Live progress tracking is disabled.</span>
          </div>
          <Link to="/settings" className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-[10px] uppercase tracking-wide">
            Link Profile
          </Link>
        </div>
      )}

      {/* ── Title & Header row ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Developer Overview</h1>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-bold">
            <span className="text-[#39d353] flex items-center gap-1 bg-[#0c1611] px-1.5 py-0.5 rounded border border-[#39d353]/15">
              <Flame size={12} className="fill-[#39d353]" />
              {streak || 14} Day Streak
            </span>
            <span className="text-gray-500 font-medium select-none">•</span>
            <span className="text-gray-400">Next rank: <span className="text-blue-400 font-semibold">Elite Architect</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="bg-[#12151f] hover:bg-[#181c2b] border border-white/5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase text-gray-300 transition-colors">
            Export Report
          </button>
          <button className="bg-[#39d353] hover:bg-[#39d353]/90 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase text-[#090a0f] transition-all shadow-[0_0_12px_rgba(57,211,83,0.15)]">
            New Project
          </button>
        </div>
      </div>

      {/* ── Dashboard Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column (1/3 Width) ── */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* Card 1: Algorithm of the Day / LeetCode Stats */}
          <div className="p-5 rounded-2xl bg-[#0f111a] border border-white/5 flex flex-col gap-4 shadow-xl justify-between min-h-[340px]">
            {hasLinkedUser ? (
              // Connected State UI
              <>
                <div className="flex justify-between items-center">
                  <div className="px-2 py-0.5 bg-emerald-500/10 border border-[#39d353]/15 rounded-full text-[8px] font-extrabold tracking-wider text-[#39d353] uppercase flex items-center gap-1">
                    <Code2 size={10} />
                    LeetCode Profile
                  </div>
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0c1611] border border-[#39d353]/10 text-[#39d353]">
                    <Share2 size={13} className="fill-[#39d353]/10" />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight truncate">{primaryUser.username}</h2>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                    <span className="text-indigo-400">
                      Rank #{Number(primaryUser.ranking).toLocaleString()}
                    </span>
                    <span className="text-gray-600 font-medium select-none">•</span>
                    <span className="text-gray-400">{primaryUser.acceptanceRate ? `${Number(primaryUser.acceptanceRate).toFixed(1)}% Acc` : "0% Acc"}</span>
                  </div>
                  
                  {/* Solved details */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="p-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                      <span className="block text-xs font-extrabold text-emerald-400">{primaryUser.easySolved}</span>
                      <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider block mt-0.5">Easy</span>
                    </div>
                    <div className="p-1.5 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                      <span className="block text-xs font-extrabold text-amber-400">{primaryUser.mediumSolved}</span>
                      <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider block mt-0.5">Medium</span>
                    </div>
                    <div className="p-1.5 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                      <span className="block text-xs font-extrabold text-rose-400">{primaryUser.hardSolved}</span>
                      <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider block mt-0.5">Hard</span>
                    </div>
                  </div>
                </div>

                {/* Submissions chart */}
                <AlgorithmWeeklyChart submissionCalendar={primaryUser.submissionCalendar} isMock={false} />

                <a 
                  href={`https://leetcode.com/${primaryUser.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-gray-100 text-black py-2 rounded-lg text-[10px] font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors mt-2 select-none"
                >
                  <span>View Profile</span>
                  <ArrowRight size={12} className="stroke-[2.5]" />
                </a>
              </>
            ) : (
              // Empty/Mock Fallback UI matching the screenshot
              <>
                <div className="flex justify-between items-center">
                  <div className="px-2 py-0.5 bg-white/[0.03] border border-white/5 rounded-full text-[8px] font-extrabold tracking-wider text-gray-400 uppercase">
                    Algorithm of the day
                  </div>
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0c1611] border border-[#39d353]/10 text-[#39d353]">
                    <Share2 size={13} className="fill-[#39d353]/10" />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Two Sum</h2>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-bold">
                    <span className="text-[#39d353] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39d353]" />
                      Difficulty: Easy
                    </span>
                    <span className="text-gray-600 font-medium select-none">•</span>
                    <span className="text-gray-400">15 pts</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2.5 leading-relaxed font-medium">
                    Efficiently find two numbers in an array that sum to a specific target value. Time complexity: O(n).
                  </p>
                </div>

                {/* Mock chart */}
                <AlgorithmWeeklyChart submissionCalendar={null} isMock={true} />

                <a 
                  href="https://leetcode.com/problems/two-sum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-gray-100 text-black py-2 rounded-lg text-[10px] font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors mt-2 select-none"
                >
                  <span>Solve Challenge</span>
                  <ArrowRight size={12} className="stroke-[2.5]" />
                </a>
              </>
            )}
          </div>

          {/* Card 2: Tech Pulse */}
          <div className="p-5 rounded-2xl bg-[#0f111a] border border-white/5 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-blue-400 fill-blue-400/5" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Tech Pulse</h3>
              </div>
              <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                <SlidersHorizontal size={13} />
              </button>
            </div>

            {/* List of tech updates */}
            <div className="flex flex-col gap-3">
              {[
                { title: "The Future of CLI Tools in 2024", time: "2h ago" },
                { title: "React 19 RC: Server Component Deep Dive", time: "5h ago" },
                { title: "Rust Memory Safety: Visualized", time: "8h ago" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center group p-2 rounded-lg hover:bg-white/[0.01] transition-all border border-transparent hover:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors">
                    <Newspaper size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold text-white truncate leading-tight group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-bold text-gray-500">
                      <span>{item.time}</span>
                      <span className="text-gray-600 font-medium select-none">•</span>
                      <span className="text-[#39d353] flex items-center gap-0.5">
                        <Sparkles size={8} className="fill-[#39d353]" />
                        AI Summary Available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right Column (2/3 Width) ── */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          
          {/* Card 1: Contribution Radar */}
          <div className="p-5 rounded-2xl bg-[#0f111a] border border-white/5 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contribution Radar</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {hasLinkedUser ? (
                    <>Real-time sync with LeetCode: <span className="text-blue-400 font-semibold cursor-pointer hover:underline">leetcode.com/{primaryUser.username}</span></>
                  ) : (
                    <>Real-time sync with <span className="text-blue-400 font-semibold cursor-pointer hover:underline">github.com/pro-user</span></>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 bg-[#12151f] border border-white/5 rounded-lg text-center min-w-[54px]">
                  <span className="block text-xs font-extrabold text-white leading-none">{(yearlyTotal || 1248).toLocaleString()}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 block">Yearly</span>
                </div>
                <div className="px-2.5 py-1 bg-[#12151f] border border-white/5 rounded-lg text-center min-w-[54px]">
                  <span className="block text-xs font-extrabold text-[#39d353] leading-none">{streak || 14}</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 block">Streak</span>
                </div>
              </div>
            </div>

            {/* Matrix grid */}
            <ContributionGrid cells={contributionCells} />

            {/* Productivity Insight Bar */}
            <div className="p-3 bg-gradient-to-r from-emerald-950/10 via-[#0d1612]/30 to-[#0f111a] border border-[#39d353]/10 rounded-xl flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-[#0c1611] border border-[#39d353]/15 flex items-center justify-center text-[#39d353] shrink-0 mt-0.5">
                <Rocket size={13} className="fill-[#39d353]/10" />
              </div>
              <div>
                <div className="text-[8px] font-extrabold tracking-widest text-[#39d353] uppercase">Productivity AI Agent</div>
                <p className="text-[10px] text-gray-300 mt-0.5 leading-normal">
                  Optimization found: You are <span className="text-[#39d353] font-semibold">42% more productive</span> on Tuesdays between 7–9 AM. System suggests scheduling high-complexity tasks for this window.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Terminal */}
          <div className="rounded-2xl bg-[#06070a] border border-white/5 shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Terminal Top Bar */}
            <div className="px-4 py-2.5 bg-[#0a0c12]/80 border-b border-white/[0.04] flex items-center justify-between">
              {/* Window Controls */}
              <div className="flex gap-1.5 select-none">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              </div>
              {/* Center SSH Title */}
              <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono select-none">
                <Lock size={9} />
                <span>ssh proj@devpulse.ai --v2</span>
              </div>
              {/* Placeholder to balance window controls */}
              <div className="w-12" />
            </div>

            {/* Terminal Inner Content */}
            <div className="p-4 flex flex-col gap-3.5">
              {/* Command Prompt */}
              <div className="flex items-start gap-2 text-[11px] font-mono">
                <span className="text-[#39d353] font-bold select-none">❯</span>
                <p className="text-white font-medium">AI, optimize my useFetch hook for concurrent mode.</p>
              </div>

              {/* Response Header */}
              <div className="flex items-start gap-2 text-[11px] font-mono text-gray-400">
                <span className="text-purple-400 font-bold select-none">⚙️</span>
                <p>Optimizing for Concurrent React. Implementing <span className="text-yellow-500 font-semibold">useTransition</span> for smoother state transitions:</p>
              </div>

              {/* Code Box */}
              <TerminalCodeEditor />
            </div>

            {/* Terminal Bottom Input Bar */}
            <div className="p-3 bg-[#0a0c12]/50 border-t border-white/[0.04] flex gap-2.5 items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-teal-400 font-bold text-xs select-none">❯</span>
                <input 
                  type="text"
                  placeholder="Ask anything about your architecture..." 
                  className="bg-transparent border-none text-[11px] text-gray-200 outline-none w-full placeholder:text-gray-600 font-mono"
                  readOnly
                />
              </div>
              <button className="text-gray-500 hover:text-gray-300 transition-colors p-1 bg-white/[0.02] border border-white/5 rounded-md">
                <Mic size={12} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
