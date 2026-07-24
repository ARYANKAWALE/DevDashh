import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Star } from "lucide-react";
import { useConnections } from "../../lib/connections";
import { useGitHubData } from "../../hooks/useGitHubData";
import { useLeetCodeData } from "../../hooks/useLeetCodeData";
import { fmt, kfmt, timeAgo, langColor } from "../../lib/api";
import ConnectGate, { PlatformCard } from "../ConnectGate";
import Heatmap, { GH_PALETTE, LC_PALETTE, HeatmapLegend } from "../ui/Heatmap";
import { BarRow, LanguageBar } from "../ui/Charts";
import { Section, StatBlock, Chip, LoadingPane, GitHubMark, LeetCodeMark } from "../ui/Primitives";

function mergeCells(ghCells, lcCells) {
  const len = ghCells?.length ?? lcCells?.length ?? 0;
  const merged = [];
  for (let i = 0; i < len; i++) {
    const g = ghCells?.[i];
    const l = lcCells?.[i];
    merged.push({
      date: (g ?? l).date,
      gh: g?.count ?? 0,
      ghLevel: g?.level ?? 0,
      lc: l?.count ?? 0,
      lcLevel: l?.level ?? 0,
      count: (g?.count ?? 0) + (l?.count ?? 0),
    });
  }
  return merged;
}

function dualColor(cell) {
  const g = GH_PALETTE[Math.min(cell.ghLevel, 4)];
  const l = LC_PALETTE[Math.min(cell.lcLevel, 4)];
  if (cell.gh > 0 && cell.lc > 0) return `linear-gradient(135deg, ${g} 50%, ${l} 50%)`;
  if (cell.gh > 0) return g;
  if (cell.lc > 0) return l;
  return GH_PALETTE[0];
}

function BriefingHeader({ icon, title, to, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="microlabel" style={{ color }}>
          {title}
        </span>
      </span>
      <Link
        to={to}
        className="flex items-center gap-1 microlabel text-faint hover:text-ink transition-colors"
      >
        full view <ArrowUpRight size={11} />
      </Link>
    </div>
  );
}

export default function Overview() {
  const { github, leetcode } = useConnections();
  const gh = useGitHubData();
  const lc = useLeetCodeData();

  const nothingConnected = !github && !leetcode;

  const merged = useMemo(
    () => (gh.cells || lc.cells ? mergeCells(gh.cells, lc.cells) : null),
    [gh.cells, lc.cells]
  );

  if (nothingConnected) return <ConnectGate />;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const bestStreak = Math.max(gh.streaks?.current ?? 0, lc.streaks?.current ?? 0);
  const lcUser = lc.user;

  const stats = [];
  if (github) {
    stats.push(
      { label: "contributions / yr", value: gh.yearTotal, accent: "var(--color-ghb)" },
      { label: "stars earned", value: gh.status === "ready" ? gh.totalStars : null },
      { label: "public repos", value: gh.profile?.public_repos ?? null }
    );
  }
  if (leetcode) {
    stats.push(
      { label: "problems solved", value: lcUser?.totalSolved ?? null, accent: "var(--color-lc)" },
      {
        label: "global rank",
        value: lcUser?.ranking ? `#${kfmt(lcUser.ranking)}` : null,
        animate: false,
      },
      { label: "submissions / yr", value: lc.yearTotal }
    );
  }

  return (
    <div className="px-5 sm:px-8 py-8 max-w-[1200px] mx-auto flex flex-col gap-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 anim-rise">
        <div className="flex flex-col gap-1.5">
          <span className="microlabel text-faint">{today}</span>
          <h1 className="text-3xl sm:text-[34px] font-medium tracking-tight leading-tight">
            All signals <span className="serif-it text-accent">nominal.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {github && <Chip color="var(--color-ghb)">gh @{github}</Chip>}
          {lcUser && <Chip color="var(--color-lc)">lc @{lcUser.username}</Chip>}
          {bestStreak > 0 && <Chip color="var(--color-accent)">{bestStreak}d streak</Chip>}
        </div>
      </div>

      {/* stat ledger */}
      <div
        className="relative border border-line bg-panel/70 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 anim-rise"
        style={{ animationDelay: "60ms" }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`p-4 ${i > 0 ? "border-l border-linesoft" : ""} ${
              i >= 2 ? "max-lg:border-t max-lg:border-linesoft" : ""
            } ${i % 2 === 0 ? "max-sm:border-l-0" : ""}`}
          >
            <StatBlock
              label={s.label}
              value={s.value ?? "—"}
              accent={s.accent}
              animate={s.animate !== false && typeof s.value === "number"}
            />
          </div>
        ))}
      </div>

      {/* combined activity */}
      <Section
        index="A"
        title="activity — last 52 weeks, both platforms"
        delay={120}
        aside={
          <div className="hidden sm:flex items-center gap-4">
            <HeatmapLegend palette={GH_PALETTE} from="gh" to="" />
            <HeatmapLegend palette={LC_PALETTE} from="lc" to="" />
          </div>
        }
      >
        {merged ? (
          <Heatmap
            cells={merged}
            colorFor={dualColor}
            tooltipFor={(c) =>
              `${c.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${
                c.gh
              } commits · ${c.lc} submissions`
            }
          />
        ) : (
          <LoadingPane label="syncing activity" />
        )}
      </Section>

      {/* platform briefings */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {github ? (
          <Section index="B" title="github briefing" delay={180}>
            <div className="flex flex-col gap-5">
              <BriefingHeader
                icon={<GitHubMark size={14} />}
                title={`@${github}`}
                to="/github"
                color="var(--color-ghb)"
              />
              {gh.status === "loading" && <LoadingPane label="fetching github" />}
              {gh.status === "error" && (
                <p className="text-[13px] text-rose font-mono py-6">{gh.error}</p>
              )}
              {gh.status === "ready" && (
                <>
                  {gh.languages.length > 0 && <LanguageBar languages={gh.languages} limit={4} />}
                  <div className="flex flex-col divide-y divide-linesoft border-t border-linesoft">
                    {gh.topRepos.slice(0, 3).map((r) => (
                      <a
                        key={r.id}
                        href={r.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-2.5 group"
                      >
                        <span className="font-mono text-[12px] text-ink group-hover:text-ghb transition-colors truncate">
                          {r.name}
                        </span>
                        {r.language && (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: langColor(r.language) }}
                          />
                        )}
                        <span className="ml-auto flex items-center gap-1 font-mono text-[11px] text-faint">
                          <Star size={10} /> {kfmt(r.stargazers_count)}
                        </span>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Section>
        ) : (
          <PlatformCard platform="github" delay={180} />
        )}

        {leetcode ? (
          <Section index="C" title="leetcode briefing" delay={240}>
            <div className="flex flex-col gap-5">
              <BriefingHeader
                icon={<LeetCodeMark size={14} />}
                title={lcUser ? `@${lcUser.username}` : "…"}
                to="/leetcode"
                color="var(--color-lc)"
              />
              {lc.loading && <LoadingPane label="fetching leetcode" />}
              {!lc.loading && lcUser && (
                <>
                  <div className="flex flex-col gap-3">
                    <BarRow
                      label="Easy"
                      value={lcUser.easySolved ?? 0}
                      max={lcUser.totalEasy ?? lcUser.easySolved ?? 1}
                      color="#2cbb5d"
                      valueText={`${fmt(lcUser.easySolved)} / ${fmt(lcUser.totalEasy)}`}
                    />
                    <BarRow
                      label="Medium"
                      value={lcUser.mediumSolved ?? 0}
                      max={lcUser.totalMedium ?? lcUser.mediumSolved ?? 1}
                      color="#ffb800"
                      delay={120}
                      valueText={`${fmt(lcUser.mediumSolved)} / ${fmt(lcUser.totalMedium)}`}
                    />
                    <BarRow
                      label="Hard"
                      value={lcUser.hardSolved ?? 0}
                      max={lcUser.totalHard ?? lcUser.hardSolved ?? 1}
                      color="#f63737"
                      delay={240}
                      valueText={`${fmt(lcUser.hardSolved)} / ${fmt(lcUser.totalHard)}`}
                    />
                  </div>
                  {(lcUser.recentSubmissions ?? []).length > 0 && (
                    <div className="flex flex-col divide-y divide-linesoft border-t border-linesoft">
                      {lcUser.recentSubmissions.slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-center gap-3 py-2.5 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background:
                                s.statusDisplay === "Accepted" ? "#2cbb5d" : "var(--color-rose)",
                            }}
                          />
                          <span className="font-mono text-[12px] text-ink truncate">{s.title}</span>
                          <span className="ml-auto font-mono text-[11px] text-faint shrink-0">
                            {timeAgo(Number(s.timestamp) * 1000)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {lc.status === "error" && (
                <p className="text-[13px] text-rose font-mono py-6">{lc.error}</p>
              )}
            </div>
          </Section>
        ) : (
          <PlatformCard platform="leetcode" delay={240} />
        )}
      </div>
    </div>
  );
}
