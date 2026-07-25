import { NavLink, Link } from "react-router-dom";
import { useConnections } from "../lib/connections";
import { BrandMark, GitHubMark, LeetCodeMark } from "./ui/Primitives";

const NAV = [
  { to: "/", end: true, index: "01", label: "Overview" },
  { to: "/github", end: false, index: "02", label: "GitHub", dot: "var(--color-ghb)" },
  { to: "/leetcode", end: false, index: "03", label: "LeetCode", dot: "var(--color-lc)" },
  { to: "/connections", end: false, index: "04", label: "Connections" },
];

function StatusRow({ connected, icon, label, color }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${connected ? "pulse-dot" : ""}`}
        style={{ background: connected ? color : "rgba(255,255,255,0.15)" }}
      />
      <span className="text-faint">{icon}</span>
      <span className={`font-mono text-[13px] truncate ${connected ? "text-mut" : "text-faint"}`}>
        {label}
      </span>
    </div>
  );
}

export default function Sidebar() {
  const { github, leetcode } = useConnections();

  return (
    <aside className="hidden md:flex w-[228px] shrink-0 flex-col justify-between border-r border-line bg-bg">
      {/* brand */}
      <div>
        <Link to="/" className="flex items-center gap-2.5 px-5 h-14 border-b border-line">
          <BrandMark size={20} />
          <span className="font-mono text-[16px] font-semibold tracking-tight">
            dev<span className="text-accent">dash</span>
          </span>
        </Link>

        <nav className="py-4">
          <ul className="flex flex-col">
            {NAV.map(({ to, end, index, label, dot }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-5 py-2.5 transition-colors ${
                      isActive ? "text-ink bg-white/[0.03]" : "text-mut hover:text-ink hover:bg-white/[0.02]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 transition-opacity ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ background: "var(--color-accent)" }}
                      />
                      <span className="microlabel text-faint w-5">{index}</span>
                      <span className="text-[15px] font-medium tracking-wide">{label}</span>
                      {dot && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full opacity-70"
                          style={{ background: dot }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* signal panel */}
      <div className="px-5 py-4 border-t border-line flex flex-col gap-2.5">
        <span className="microlabel text-faint">signal</span>
        <StatusRow
          connected={!!github}
          icon={<GitHubMark size={12} />}
          label={github ? `@${github}` : "not linked"}
          color="var(--color-ghb)"
        />
        <StatusRow
          connected={!!leetcode}
          icon={<LeetCodeMark size={12} />}
          label={leetcode ? `@${leetcode}` : "not linked"}
          color="var(--color-lc)"
        />
      </div>
    </aside>
  );
}
