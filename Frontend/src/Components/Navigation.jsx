import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { BrandMark } from "./ui/Primitives";
import { clearSession, getSessionUser } from "../lib/backend";

const PATH_NAMES = {
  "/": "overview",
  "/github": "github",
  "/leetcode": "leetcode",
  "/connections": "connections",
};

function useUtcClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toISOString().slice(11, 19);
}

function getUser() {
  return getSessionUser()?.username ?? null;
}

export default function Navigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const clock = useUtcClock();
  const [user, setUser] = useState(getUser);

  const section = PATH_NAMES[pathname] ?? "404";

  function signOut() {
    clearSession();
    setUser(null);
    navigate("/login");
  }

  return (
    <header className="shrink-0 border-b border-line bg-bg/85 backdrop-blur z-40">
      <div className="flex items-center justify-between h-14 px-5">
        {/* mobile brand + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="md:hidden flex items-center">
            <BrandMark size={18} />
          </Link>
          <span className="font-mono text-[13px] text-faint select-none truncate">
            ~<span className="text-line mx-1">/</span>
            <span className="text-ink">{section}</span>
            <span className="text-accent caret-blink ml-0.5">_</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline font-mono text-[11px] text-faint tabular-nums select-none">
            {clock} UTC
          </span>
          <span className="hidden sm:block w-px h-4 bg-line" />
          {user && (
            <div className="flex items-center gap-2.5">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full border border-line bg-panel2 font-mono text-[11px] uppercase text-accent select-none"
                title={user}
              >
                {user.slice(0, 1)}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 microlabel text-faint hover:text-ink transition-colors"
                title="Sign out"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">exit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* mobile nav strip */}
      <nav className="md:hidden flex border-t border-linesoft overflow-x-auto">
        {Object.entries(PATH_NAMES).map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `px-4 py-2 microlabel whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "text-ink border-accent"
                  : "text-faint border-transparent hover:text-mut"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
