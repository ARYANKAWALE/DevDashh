import { useMemo } from "react";
import { MapPin, Users, Calendar, Star, GitFork, ArrowUpRight } from "lucide-react";
import { useConnections } from "../../lib/connections";
import { useGitHubData } from "../../hooks/useGitHubData";
import { fmt, kfmt, timeAgo, langColor } from "../../lib/api";
import { PageGate } from "../ConnectGate";
import Heatmap, { GH_PALETTE, HeatmapLegend, paletteColor } from "../ui/Heatmap";
import { LanguageBar, DayBars } from "../ui/Charts";
import {
  Section,
  StatBlock,
  LoadingPane,
  ErrorPane,
  GitHubMark,
} from "../ui/Primitives";

function pushesPerDay(events, days = 14) {
  const map = new Map();
  for (const ev of events ?? []) {
    if (ev.type !== "PushEvent") continue;
    const key = ev.created_at.slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + (ev.payload?.commits?.length ?? 0));
  }
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: d, count: map.get(key) ?? 0 });
  }
  return out;
}

export default function GitHubPage() {
  const { github } = useConnections();
  const gh = useGitHubData();
  const pushes = useMemo(() => pushesPerDay(gh.events), [gh.events]);

  if (!github) return <PageGate platform="github" />;
  if (gh.status === "error") return <ErrorPane message={gh.error} />;
  if (gh.status !== "ready" || !gh.profile) return <LoadingPane label="fetching github" />;

  const p = gh.profile;
  const joined = p?.created_at
    ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="px-5 sm:px-8 py-8 max-w-[1200px] mx-auto flex flex-col gap-6">
      {/* profile header */}
      <div className="flex flex-wrap items-center gap-5 anim-rise">
        <img
          src={p.avatar_url}
          alt={p.login}
          className="w-16 h-16 rounded-full border border-line"
        />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl font-medium tracking-tight">{p.name ?? p.login}</h1>
            <a
              href={p.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-[14px] text-ghb hover:underline underline-offset-4"
            >
              <GitHubMark size={12} /> @{p.login} <ArrowUpRight size={11} />
            </a>
          </div>
          {p.bio && <p className="text-[15px] text-mut max-w-xl">{p.bio}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-1 microlabel text-faint">
            {p.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {p.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={11} /> {kfmt(p.followers)} followers · {kfmt(p.following)} following
            </span>
            {joined && (
              <span className="flex items-center gap-1">
                <Calendar size={11} /> since {joined}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* stat ledger */}
      <div
        className="relative border border-line bg-panel/70 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 anim-rise"
        style={{ animationDelay: "60ms" }}
      >
        {[
          { label: "contributions / yr", value: gh.yearTotal, accent: "var(--color-ghb)" },
          { label: "public repos", value: p.public_repos },
          { label: "stars earned", value: gh.totalStars },
          { label: "forks of my work", value: gh.totalForks },
          { label: "current streak", value: gh.streaks.current, sub: "days" },
          { label: "longest streak", value: gh.streaks.longest, sub: "days" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`p-4 ${i > 0 ? "sm:border-l border-linesoft" : ""} ${
              i % 2 === 1 ? "max-sm:border-l max-sm:border-linesoft" : ""
            } ${i >= 2 ? "max-lg:border-t max-lg:border-linesoft" : ""}`}
          >
            <StatBlock label={s.label} value={s.value ?? "—"} sub={s.sub} accent={s.accent} />
          </div>
        ))}
      </div>

      {/* contribution heatmap */}
      <Section
        index="A"
        title="contribution graph — last 52 weeks"
        delay={120}
        aside={<HeatmapLegend palette={GH_PALETTE} />}
      >
        {gh.cells ? (
          <Heatmap
            cells={gh.cells}
            colorFor={paletteColor(GH_PALETTE)}
            tooltipFor={(c) =>
              `${c.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} · ${c.count} contribution${c.count === 1 ? "" : "s"}`
            }
          />
        ) : (
          <p className="text-[15px] text-mut font-mono py-4">
            Contribution calendar unavailable right now.
          </p>
        )}
      </Section>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* languages */}
        <Section index="B" title="language mix — weighted by repo size" delay={160}>
          {gh.languages.length > 0 ? (
            <LanguageBar languages={gh.languages} limit={7} />
          ) : (
            <p className="text-[15px] text-mut font-mono py-4">No language data yet.</p>
          )}
        </Section>

        {/* commit cadence */}
        <Section
          index="C"
          title="push cadence — last 14 days"
          delay={200}
          aside={
            <span className="font-mono text-[13px] text-faint">
              {pushes.reduce((s, d) => s + d.count, 0)} commits
            </span>
          }
        >
          <DayBars days={pushes} color="var(--color-gh)" height={88} />
          <div className="flex justify-between mt-2 microlabel text-faint">
            <span>{pushes[0]?.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <span>today</span>
          </div>
        </Section>
      </div>

      {/* top repositories */}
      <Section
        index="D"
        title="top repositories — by stars"
        delay={240}
        aside={
          <a
            href={`${p.html_url}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 microlabel text-faint hover:text-ink transition-colors"
          >
            all repos <ArrowUpRight size={11} />
          </a>
        }
      >
        {gh.topRepos.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-px bg-linesoft border border-linesoft">
            {gh.topRepos.map((r) => (
              <a
                key={r.id}
                href={r.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-panel hover:bg-panel2 transition-colors p-4 flex flex-col gap-2 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[15px] text-ink group-hover:text-ghb transition-colors truncate">
                    {r.name}
                  </span>
                  <ArrowUpRight
                    size={12}
                    className="text-faint opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </div>
                {r.description && (
                  <p className="text-[14px] text-mut leading-relaxed line-clamp-2">
                    {r.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-auto pt-1 microlabel text-faint">
                  {r.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: langColor(r.language) }}
                      />
                      {r.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={10} /> {kfmt(r.stargazers_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={10} /> {kfmt(r.forks_count)}
                  </span>
                  <span className="ml-auto">{timeAgo(r.pushed_at)}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-mut font-mono py-4">No public repositories.</p>
        )}
      </Section>

      {/* activity feed */}
      <Section index="E" title="recent public activity" delay={280}>
        {gh.feed.length > 0 ? (
          <ul className="flex flex-col divide-y divide-linesoft">
            {gh.feed.map((f, i) => (
              <li key={i} className="flex items-baseline gap-3 py-2.5 min-w-0">
                <span className="font-mono text-[13px] text-faint w-16 shrink-0">
                  {timeAgo(f.at)}
                </span>
                <p className="text-[15px] text-mut truncate">
                  <span className="text-ink">{f.verb}</span>
                  {f.detail && <span className="font-mono text-[14px]"> “{f.detail}”</span>}
                  {f.repo && (
                    <span className="text-faint">
                      {" "}
                      in <span className="font-mono text-[14px] text-mut">{f.repo}</span>
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[15px] text-mut font-mono py-4">No recent public activity.</p>
        )}
      </Section>
    </div>
  );
}
