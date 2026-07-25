import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { validateGitHub, validateLeetCode } from "../lib/api";
import { connectGitHub, connectLeetCode } from "../lib/connections";
import { BrandMark, GitHubMark, LeetCodeMark, Spinner, Ticks } from "./ui/Primitives";

/**
 * Inline username field that validates against the platform's API
 * before saving the connection.
 */
export function ConnectField({ platform, autoFocus = false, onConnected }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isGitHub = platform === "github";

  async function submit(e) {
    e.preventDefault();
    const username = value.trim().replace(/^@/, "");
    if (!username || busy) return;
    setBusy(true);
    setError("");
    try {
      if (isGitHub) {
        await validateGitHub(username);
        await connectGitHub(username);
      } else {
        await validateLeetCode(username);
        await connectLeetCode(username);
      }
      setValue("");
      onConnected?.(username);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const accent = isGitHub ? "var(--color-ghb)" : "var(--color-lc)";

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-stretch border border-line bg-bg/60 focus-within:border-faint transition-colors">
        <span className="flex items-center pl-3 pr-1 font-mono text-[15px] text-faint select-none">@</span>
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          placeholder={isGitHub ? "github username" : "leetcode username"}
          className="flex-1 min-w-0 bg-transparent py-2.5 pr-2 font-mono text-[15px] text-ink outline-none"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="flex items-center gap-1.5 px-4 microlabel text-bg font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ background: accent }}
        >
          {busy ? <Spinner size={12} className="!border-black/30 !border-t-black" /> : "link"}
          {!busy && <ArrowRight size={11} strokeWidth={2.5} />}
        </button>
      </div>
      {error && <p className="font-mono text-[13px] text-rose">{error}</p>}
    </form>
  );
}

export function PlatformCard({ platform, delay = 0 }) {
  const isGitHub = platform === "github";
  return (
    <div
      className="relative border border-line bg-panel p-6 flex flex-col gap-4 anim-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Ticks />
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center w-9 h-9 border border-line"
          style={{ color: isGitHub ? "var(--color-ghb)" : "var(--color-lc)" }}
        >
          {isGitHub ? <GitHubMark size={17} /> : <LeetCodeMark size={17} />}
        </span>
        <div>
          <h3 className="text-[17px] font-semibold leading-tight">
            {isGitHub ? "GitHub" : "LeetCode"}
          </h3>
          <p className="microlabel text-faint mt-0.5">
            {isGitHub ? "repos · commits · languages" : "problems · ranking · submissions"}
          </p>
        </div>
      </div>
      <p className="text-[15px] text-mut leading-relaxed">
        {isGitHub
          ? "Pull your contribution graph, repository stats and language mix straight from your public profile."
          : "Track solved problems, difficulty split, acceptance rate and your daily submission rhythm."}
      </p>
      <ConnectField platform={platform} />
    </div>
  );
}

/** Full-page prompt shown when no account is connected yet. */
export default function ConnectGate() {
  return (
    <div className="min-h-full flex items-center justify-center px-6 py-16 bg-dots">
      <div className="w-full max-w-3xl flex flex-col gap-10">
        <div className="flex flex-col gap-5 anim-rise">
          <div className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="microlabel text-faint">devdash / 00 — link an account</span>
          </div>
          <h1 className="text-4xl sm:text-5xl leading-[1.08] font-medium tracking-tight">
            Your developer life,
            <br />
            <span className="serif-it text-accent">on one canvas.</span>
          </h1>
          <p className="text-[17px] text-mut max-w-lg leading-relaxed">
            DevDash draws live signal from your public profiles. Link GitHub, LeetCode, or
            both — no passwords, no OAuth, just your username.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <PlatformCard platform="github" delay={100} />
          <PlatformCard platform="leetcode" delay={180} />
        </div>

        <p className="microlabel text-faint anim-fade" style={{ animationDelay: "300ms" }}>
          manage everything later in{" "}
          <Link to="/connections" className="text-mut underline underline-offset-4 hover:text-ink transition-colors">
            connections
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Compact gate used on a platform page when only that platform is missing. */
export function PageGate({ platform }) {
  const isGitHub = platform === "github";
  return (
    <div className="min-h-full flex items-center justify-center px-6 py-16 bg-dots">
      <div className="w-full max-w-md flex flex-col gap-6 anim-rise">
        <div className="flex flex-col gap-3">
          <span
            className="flex items-center justify-center w-11 h-11 border border-line"
            style={{ color: isGitHub ? "var(--color-ghb)" : "var(--color-lc)" }}
          >
            {isGitHub ? <GitHubMark size={20} /> : <LeetCodeMark size={20} />}
          </span>
          <h1 className="text-2xl font-medium tracking-tight">
            {isGitHub ? "GitHub" : "LeetCode"} isn't linked{" "}
            <span className="serif-it text-mut">yet.</span>
          </h1>
          <p className="text-[15px] text-mut leading-relaxed">
            Enter your {isGitHub ? "GitHub" : "LeetCode"} username and this page fills with
            live {isGitHub ? "repository and contribution data" : "problem-solving stats"}.
          </p>
        </div>
        <ConnectField platform={platform} autoFocus />
      </div>
    </div>
  );
}
