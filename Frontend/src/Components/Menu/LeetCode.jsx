import { ArrowUpRight } from "lucide-react";
import { useConnections } from "../../lib/connections";
import { useLeetCodeData } from "../../hooks/useLeetCodeData";
import { fmt, kfmt, timeAgo, lcAcceptance } from "../../lib/api";
import { PageGate } from "../ConnectGate";
import Heatmap, { LC_PALETTE, HeatmapLegend, paletteColor } from "../ui/Heatmap";
import { Donut, BarRow } from "../ui/Charts";
import {
  Section,
  StatBlock,
  LoadingPane,
  ErrorPane,
  LeetCodeMark,
} from "../ui/Primitives";

const DIFF = [
  { key: "easy", label: "Easy", solved: "easySolved", total: "totalEasy", color: "#2cbb5d" },
  { key: "medium", label: "Medium", solved: "mediumSolved", total: "totalMedium", color: "#ffb800" },
  { key: "hard", label: "Hard", solved: "hardSolved", total: "totalHard", color: "#f63737" },
];

export default function LeetCodePage() {
  const { leetcode } = useConnections();
  const lc = useLeetCodeData();

  if (!leetcode) return <PageGate platform="leetcode" />;
  if (lc.status === "error") return <ErrorPane message={lc.error} />;
  if (!lc.user) return <LoadingPane label="fetching leetcode" />;

  const u = lc.user;
  const subs = u.recentSubmissions ?? [];
  const acceptedRecent = subs.filter((s) => s.statusDisplay === "Accepted").length;
  const acceptance = lcAcceptance(u);

  return (
    <div className="px-5 sm:px-8 py-8 max-w-[1200px] mx-auto flex flex-col gap-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 anim-rise">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-14 h-14 border border-line text-lc">
            <LeetCodeMark size={24} />
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-2xl font-medium tracking-tight">@{u.username}</h1>
              <a
                href={`https://leetcode.com/${u.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-[12px] text-lc hover:underline underline-offset-4"
              >
                leetcode.com <ArrowUpRight size={11} />
              </a>
            </div>
            <span className="microlabel text-faint">
              rank #{fmt(u.ranking)} · {fmt(u.reputation)} reputation
            </span>
          </div>
        </div>

      </div>

      {/* stat ledger */}
      <div
        className="relative border border-line bg-panel/70 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 anim-rise"
        style={{ animationDelay: "60ms" }}
      >
        {[
          { label: "problems solved", value: u.totalSolved, accent: "var(--color-lc)" },
          {
            label: "acceptance rate",
            value: acceptance != null ? `${acceptance.toFixed(1)}%` : "—",
            animate: false,
          },
          { label: "global rank", value: u.ranking ? `#${kfmt(u.ranking)}` : "—", animate: false },
          { label: "current streak", value: lc.streaks.current, sub: "days" },
          { label: "submissions / yr", value: lc.yearTotal },
          { label: "contribution pts", value: u.contributionPoint ?? u.contributionPoints ?? "—" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`p-4 ${i > 0 ? "sm:border-l border-linesoft" : ""} ${
              i % 2 === 1 ? "max-sm:border-l max-sm:border-linesoft" : ""
            } ${i >= 2 ? "max-lg:border-t max-lg:border-linesoft" : ""}`}
          >
            <StatBlock
              label={s.label}
              value={s.value ?? "—"}
              sub={s.sub}
              accent={s.accent}
              animate={s.animate !== false && typeof s.value === "number"}
            />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 items-start">
        {/* difficulty split */}
        <Section index="A" title="problems by difficulty" delay={120}>
          <div className="flex flex-col items-center gap-6">
            <Donut
              segments={DIFF.map((d) => ({
                label: d.label,
                value: u[d.solved] ?? 0,
                color: d.color,
              }))}
              centerTop={fmt(u.totalSolved)}
              centerBottom={`of ${fmt(u.totalQuestions)}`}
            />
            <div className="w-full flex flex-col gap-3">
              {DIFF.map((d, i) => (
                <BarRow
                  key={d.key}
                  label={d.label}
                  value={u[d.solved] ?? 0}
                  max={u[d.total] ?? u[d.solved] ?? 1}
                  color={d.color}
                  delay={i * 120}
                  valueText={`${fmt(u[d.solved])} / ${fmt(u[d.total])}`}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* heatmap + submissions */}
        <div className="flex flex-col gap-6">
          <Section
            index="B"
            title="submission calendar — last 52 weeks"
            delay={160}
            aside={<HeatmapLegend palette={LC_PALETTE} />}
          >
            {lc.cells ? (
              <Heatmap
                cells={lc.cells}
                colorFor={paletteColor(LC_PALETTE)}
                tooltipFor={(c) =>
                  `${c.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })} · ${c.count} submission${c.count === 1 ? "" : "s"}`
                }
              />
            ) : (
              <p className="text-[13px] text-mut font-mono py-4">Calendar unavailable.</p>
            )}
          </Section>

          <Section
            index="C"
            title="recent submissions"
            delay={200}
            aside={
              subs.length > 0 && (
                <span className="font-mono text-[11px] text-faint">
                  {acceptedRecent}/{subs.length} accepted
                </span>
              )
            }
          >
            {subs.length > 0 ? (
              <ul className="flex flex-col divide-y divide-linesoft">
                {subs.slice(0, 8).map((s, i) => (
                  <li key={i} className="py-2.5">
                    <a
                      href={`https://leetcode.com/problems/${s.titleSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 min-w-0"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          background:
                            s.statusDisplay === "Accepted" ? "#2cbb5d" : "var(--color-rose)",
                        }}
                        title={s.statusDisplay}
                      />
                      <span className="font-mono text-[12px] text-ink group-hover:text-lc transition-colors truncate">
                        {s.title}
                      </span>
                      <span className="microlabel text-faint shrink-0">{s.lang}</span>
                      <span className="ml-auto font-mono text-[11px] text-faint shrink-0">
                        {timeAgo(Number(s.timestamp) * 1000)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-mut font-mono py-4">No recent submissions.</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
