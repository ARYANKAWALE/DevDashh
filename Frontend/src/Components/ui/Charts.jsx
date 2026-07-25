import { useEffect, useState } from "react";
import { langColor } from "../../lib/api";

/**
 * SVG donut with animated segments.
 * segments: [{ label, value, color }]
 */
export function Donut({ segments, size = 168, stroke = 14, centerTop, centerBottom }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const frac = seg.value / total;
    const arc = { ...seg, dash: frac * c, offset };
    offset += frac * c;
    return arc;
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={`${mounted ? a.dash : 0} ${c}`}
            strokeDashoffset={-a.offset}
            style={{ transition: "stroke-dasharray 1s cubic-bezier(.22,1,.36,1)" }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-mono text-2xl font-medium">{centerTop}</span>
        {centerBottom && <span className="microlabel text-faint">{centerBottom}</span>}
      </div>
    </div>
  );
}

/** Labelled horizontal progress row with mono value. */
export function BarRow({ label, value, max, color, valueText, delay = 0 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] text-mut">{label}</span>
        <span className="font-mono text-[14px] text-ink">{valueText ?? value}</span>
      </div>
      <div className="h-[5px] bg-white/[0.05] overflow-hidden">
        <div
          className="h-full anim-grow-x"
          style={{ width: `${pct}%`, background: color, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

/** Single segmented language bar + legend list. */
export function LanguageBar({ languages, limit = 6 }) {
  const top = languages.slice(0, limit);
  const restPct = languages.slice(limit).reduce((s, l) => s + l.pct, 0);
  const rows = restPct > 0.5 ? [...top, { name: "Other", pct: restPct }] : top;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-2.5 w-full overflow-hidden bg-white/[0.05]">
        {rows.map((l, i) => (
          <div
            key={l.name}
            className="h-full anim-grow-x"
            style={{
              width: `${l.pct}%`,
              background: l.name === "Other" ? "#4b4d57" : langColor(l.name),
              animationDelay: `${i * 70}ms`,
            }}
            title={`${l.name} ${l.pct.toFixed(1)}%`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
        {rows.map((l) => (
          <li key={l.name} className="flex items-center justify-between gap-2 min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: l.name === "Other" ? "#4b4d57" : langColor(l.name) }}
              />
              <span className="text-[14px] text-mut truncate">{l.name}</span>
            </span>
            <span className="font-mono text-[13px] text-faint">{l.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Compact vertical bar chart for daily counts, e.g. last 14 days. */
export function DayBars({ days, color, height = 72 }) {
  const max = Math.max(...days.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {days.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
          <span className="absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[14px] text-ink">
            {d.count}
          </span>
          <div
            className="w-full transition-all duration-300"
            style={{
              height: d.count > 0 ? `${Math.max((d.count / max) * 100, 8)}%` : 2,
              background: d.count > 0 ? color : "rgba(255,255,255,0.07)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
