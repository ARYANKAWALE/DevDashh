import { ArrowRight, Sparkles } from "lucide-react";
import React, { useState, useEffect } from "react";

// ── Contribution Grid Helpers ────────────────────────────────────────────────

/**
 * Generates an array of 364 day-objects (52 weeks × 7 days).
 * Each object: { date: Date, count: number, level: 0-4 }
 *
 * Replace the random count with real API data by mapping your
 * contribution counts onto the `date` field.
 */
function generateContributionData() {
  const today = new Date();
  const cells = [];

  for (let i = 363; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Mock: random count weighted towards 0 so it looks realistic
    const rand = Math.random();
    const count =
      rand < 0.4 ? 0
      : rand < 0.6 ? Math.floor(Math.random() * 3) + 1
      : rand < 0.8 ? Math.floor(Math.random() * 5) + 3
      : rand < 0.95 ? Math.floor(Math.random() * 8) + 6
      : Math.floor(Math.random() * 10) + 12;

    // Map count → intensity level 0-4
    const level =
      count === 0 ? 0
      : count <= 2 ? 1
      : count <= 5 ? 2
      : count <= 10 ? 3
      : 4;

    cells.push({ date, count, level });
  }

  return cells; // length = 364, ordered oldest → newest
}

/** Tailwind-safe colour classes per intensity level */
const LEVEL_COLORS = [
  "bg-[#161b22]",           // 0 – empty
  "bg-[#0e4429]",           // 1 – dim
  "bg-[#006d32]",           // 2 – mid
  "bg-[#26a641]",           // 3 – bright
  "bg-[#39d353] shadow-[0_0_6px_#39d35388]", // 4 – neon
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ContributionGrid({ cells }) {
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="relative overflow-x-auto">
      {/* Day labels */}
      <div className="flex flex-col gap-[3px] absolute left-0 top-0 pr-1">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-[9px] text-gray-500 h-[11px] leading-[11px]">
            {d}
          </span>
        ))}
      </div>

      {/* Grid — column-major: 52 cols × 7 rows */}
      <div
        className="ml-7 grid gap-[3px]"
        style={{
          gridTemplateRows: "repeat(7, 11px)",
          gridAutoFlow: "column",
          gridAutoColumns: "11px",
        }}
      >
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`rounded-[2px] cursor-pointer transition-transform hover:scale-125 ${
              LEVEL_COLORS[cell.level]
            }`}
            style={{ width: 11, height: 11 }}
            onMouseEnter={(e) => {
              setTooltip({
                text: `${
                  cell.date.toDateString()
                } — ${cell.count} contribution${cell.count !== 1 ? "s" : ""}`,
                x: e.clientX,
                y: e.clientY,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-[11px] text-white bg-gray-900 rounded shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  // Generate once on mount — swap with real API data later
  const [contributionCells] = useState(() => generateContributionData());

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


  const [usernames, setUsernames] = useState(() => {
    const saved = localStorage.getItem('leetcode_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [inputName, setInputName] = useState('');
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('leetcode_users', JSON.stringify(usernames));
    
    if (usernames.length === 0) {
      setUsersData([]);
      return;
    }
    async function fetchAllUsersData() {
      try {
        setLoading(true);
        setError(null);

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
        setError("Error while data loading");
      } finally {
        setLoading(false);
      }
    }

    fetchAllUsersData();
  }, [usernames]);
  
  return (
    <div>
      <div className="flex flex-row justify-between my-5 mx-20">
        <div>
          <h1 className="text-4xl font-semibold">Developer Overview</h1>
          {/* <p><span></span></p> */}
        </div>
        <div className="flex flex-row gap-5">
          <button className="bg-gray-600 rounded-lg px-2 py-1 font-medium text-white">
            Export Report
          </button>
          <button className="bg-green-600 rounded-lg px-2 py-1 font-medium text-white">
            New Project
          </button>
        </div>
      </div>
      <div className="flex flex-row my-5 mx-20">
        <div className="w-1/3 flex grid">
          <div className='flex flex-col bg-gray-300 gap-2 w-fit h-fit p-4 rounded-xl'>
            <div className="flex flex-row justify-between gap-10">
              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-medium bg-[#201F1D] text-[#BBA47D] border border-[#BBA47D] rounded-xl px-2 py-1 w-fit">
                  Algorithm of the day
                </p>
                <h2 className="text-[40px] font-semibold">{usersData[0]?.username ?? "Username empty"}</h2>
                <p className="text-[20px] font-medium text-gray-400">{usersData[0]?.easySolved} Easy</p>
                <p className="text-[20px] font-medium text-gray-400">{usersData[0]?.totalSolved} Total Solved</p>
              </div>
              <div>
                <Sparkles
                  className="bg-[#101717] border border-white/20 rounded-xl h-15 w-15 p-3 text-green-200"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg w-fit py-2 px-5 flex flex-row items-center justify-center m-auto gap-2 font-medium">
                <button>Solve Challange</button>
                <ArrowRight size={20} className="text-black"/>
            </div>
          </div>
        </div>
        {/* ── Contribution Radar Card ─────────────────────────────── */}
        <div className="w-2/3 bg-[#0d1117] rounded-2xl p-5 flex flex-col gap-4 border border-white/10">
          {/* Header */}
          <div className="flex flex-row items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Contribution Radar</h2>
              <p className="text-gray-400 text-xs">Real-time sync with&nbsp;
                <span className="text-green-400">github.com/user</span>
              </p>
            </div>
            <div className="flex flex-row gap-3">
              <div className="border border-white/20 rounded-lg px-3 py-2 text-center">
                <p className="text-white font-bold text-xl leading-none">{yearlyTotal.toLocaleString()}</p>
                <p className="text-gray-500 text-[10px] uppercase mt-1">Yearly</p>
              </div>
              <div className="border border-white/20 rounded-lg px-3 py-2 text-center">
                <p className="text-green-400 font-bold text-xl leading-none">{streak}</p>
                <p className="text-gray-500 text-[10px] uppercase mt-1">Streak</p>
              </div>
            </div>
          </div>

          {/* Grid */}
          <ContributionGrid cells={contributionCells} />

          {/* AI Insight Panel */}
          <div className="bg-[#161b22] border border-white/10 rounded-xl p-3 flex flex-row items-start gap-3">
            <div className="bg-green-900/40 rounded-full p-2 mt-0.5">
              <Sparkles size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-1">Productivity AI Agent</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                Optimization found: You are{" "}
                <span className="text-green-400 font-semibold">42% more productive</span>{" "}
                on Tuesdays between 7–9 AM. System suggests scheduling high-complexity tasks for this window.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
