import { Link } from "react-router-dom";
import { ArrowUpRight, Unlink } from "lucide-react";
import {
  useConnections,
  disconnectGitHub,
  disconnectLeetCode,
} from "../../lib/connections";
import { useGitHubData } from "../../hooks/useGitHubData";
import { useLeetCodeData } from "../../hooks/useLeetCodeData";
import { fmt, kfmt, lcAcceptance } from "../../lib/api";
import { ConnectField } from "../ConnectGate";
import { Section, GitHubMark, LeetCodeMark } from "../ui/Primitives";

function ConnectedRow({ icon, color, title, meta, href, onRemove }) {
  return (
    <div className="flex items-center gap-4 border border-line bg-panel2 px-4 py-3.5 min-w-0">
      <span className="shrink-0" style={{ color }}>
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 font-mono text-[13px] text-ink hover:underline underline-offset-4 truncate"
        >
          {title}
          <ArrowUpRight size={11} className="text-faint group-hover:text-ink transition-colors" />
        </a>
        <span className="microlabel text-faint truncate">{meta}</span>
      </div>
      <button
        onClick={onRemove}
        className="ml-auto flex items-center gap-1.5 microlabel text-faint hover:text-rose transition-colors shrink-0"
        title="Disconnect"
      >
        <Unlink size={12} />
        unlink
      </button>
    </div>
  );
}

function StatusAside({ linked, color }) {
  return (
    <span className="microlabel" style={{ color: linked ? color : "var(--color-faint)" }}>
      {linked ? "linked" : "not linked"}
    </span>
  );
}

export default function Connections() {
  const { github, leetcode } = useConnections();
  const gh = useGitHubData();
  const lc = useLeetCodeData();

  return (
    <div className="px-5 sm:px-8 py-8 max-w-[820px] mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 anim-rise">
        <span className="microlabel text-faint">04 — connections</span>
        <h1 className="text-3xl font-medium tracking-tight leading-tight">
          Wire up your <span className="serif-it text-accent">signal sources.</span>
        </h1>
        <p className="text-[13px] text-mut max-w-lg leading-relaxed mt-1">
          One GitHub profile and one LeetCode profile — public data only, usernames, never
          passwords. When signed in, your linked profiles are stored on your account in
          MongoDB and follow you across devices.
        </p>
      </div>

      {/* GitHub */}
      <Section
        index="01"
        title="github — one account"
        delay={80}
        aside={<StatusAside linked={!!github} color="var(--color-ghb)" />}
      >
        <div className="flex flex-col gap-4">
          {github ? (
            <ConnectedRow
              icon={<GitHubMark size={18} />}
              color="var(--color-ghb)"
              title={`@${github}`}
              href={`https://github.com/${github}`}
              meta={
                gh.status === "loading"
                  ? "syncing…"
                  : gh.status === "ready"
                  ? `${fmt(gh.profile?.public_repos)} repos · ${kfmt(gh.totalStars)} stars · ${kfmt(
                      gh.profile?.followers
                    )} followers`
                  : gh.error ?? "sync failed"
              }
              onRemove={disconnectGitHub}
            />
          ) : (
            <>
              <p className="text-[13px] text-mut">
                Enter your GitHub username to pull contributions, repositories, languages and
                activity.
              </p>
              <ConnectField platform="github" />
            </>
          )}
        </div>
      </Section>

      {/* LeetCode */}
      <Section
        index="02"
        title="leetcode — one account"
        delay={140}
        aside={<StatusAside linked={!!leetcode} color="var(--color-lc)" />}
      >
        <div className="flex flex-col gap-4">
          {leetcode ? (
            <ConnectedRow
              icon={<LeetCodeMark size={18} />}
              color="var(--color-lc)"
              title={`@${leetcode}`}
              href={`https://leetcode.com/${leetcode}`}
              meta={
                lc.status === "loading"
                  ? "syncing…"
                  : lc.user
                  ? `${fmt(lc.user.totalSolved)} solved · rank #${kfmt(lc.user.ranking)}${
                      lcAcceptance(lc.user) != null
                        ? ` · ${lcAcceptance(lc.user).toFixed(1)}% acceptance`
                        : ""
                    }`
                  : lc.error ?? "sync failed"
              }
              onRemove={disconnectLeetCode}
            />
          ) : (
            <>
              <p className="text-[13px] text-mut">
                Enter your LeetCode username to track solved problems, ranking and submission
                rhythm.
              </p>
              <ConnectField platform="leetcode" />
            </>
          )}
        </div>
      </Section>

      <p className="microlabel text-faint anim-fade" style={{ animationDelay: "260ms" }}>
        data · api.github.com + public contribution &amp; leetcode stat mirrors · refreshed every ~10 min ·{" "}
        <Link to="/" className="text-mut underline underline-offset-4 hover:text-ink transition-colors">
          back to overview
        </Link>
      </p>
    </div>
  );
}
