import { useMemo, useRef, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL = 11;
const GAP = 3;

export const GH_PALETTE = ["#161a20", "#0e4429", "#006d32", "#26a641", "#39d353"];
export const LC_PALETTE = ["#161a20", "#4d2e07", "#8a5410", "#cc7d12", "#ffa116"];

export function paletteColor(palette) {
  return (cell) => palette[Math.min(cell.level, 4)];
}

/**
 * 52-week contribution heatmap. Generic: pass `colorFor(cell)` to control
 * cell color and `tooltipFor(cell)` for the hover copy.
 */
export default function Heatmap({ cells, colorFor, tooltipFor }) {
  const [tip, setTip] = useState(null);
  const rootRef = useRef(null);

  // column-major: pad the first column so rows align to weekday (Sun..Sat)
  const { columns, monthLabels } = useMemo(() => {
    const padded = [
      ...Array(cells.length ? cells[0].date.getDay() : 0).fill(null),
      ...cells,
    ];
    const cols = [];
    for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));

    const labels = [];
    let lastMonth = -1;
    cols.forEach((col, ci) => {
      const first = col.find(Boolean);
      if (!first) return;
      const m = first.date.getMonth();
      if (m !== lastMonth) {
        // skip a label crammed into the very first column edge
        if (labels.length === 0 || ci - labels[labels.length - 1].ci >= 3) {
          labels.push({ ci, text: MONTHS[m] });
        }
        lastMonth = m;
      }
    });
    return { columns: cols, monthLabels: labels };
  }, [cells]);

  const defaultTooltip = (cell) =>
    `${cell.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${cell.count}`;

  function showTip(e, cell) {
    const root = rootRef.current;
    if (!root) return;
    const cellRect = e.currentTarget.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    setTip({
      text: (tooltipFor ?? defaultTooltip)(cell),
      x: cellRect.left - rootRect.left + cellRect.width / 2,
      y: cellRect.top - rootRect.top,
    });
  }

  return (
    <div ref={rootRef} className="relative">
      {/* month row */}
      <div className="relative h-4 mb-1 ml-0">
        {monthLabels.map(({ ci, text }) => (
          <span
            key={`${ci}-${text}`}
            className="absolute microlabel text-faint"
            style={{ left: ci * (CELL + GAP) }}
          >
            {text}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex" style={{ gap: GAP, width: "max-content" }}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col" style={{ gap: GAP }}>
              {Array.from({ length: 7 }).map((_, ri) => {
                const cell = col[ri];
                if (!cell)
                  return <span key={ri} style={{ width: CELL, height: CELL }} />;
                return (
                  <span
                    key={ri}
                    className="rounded-[2px] transition-transform duration-100 hover:scale-[1.35] hover:outline hover:outline-1 hover:outline-white/40"
                    style={{ width: CELL, height: CELL, background: colorFor(cell) }}
                    onMouseEnter={(e) => showTip(e, cell)}
                    onMouseLeave={() => setTip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {tip && (
        <div
          className="absolute z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] px-2.5 py-1.5 bg-panel3 border border-line text-[11px] font-mono text-ink whitespace-nowrap pointer-events-none shadow-xl"
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}

export function HeatmapLegend({ palette, from = "less", to = "more" }) {
  return (
    <div className="flex items-center gap-1.5 microlabel text-faint">
      <span>{from}</span>
      {palette.map((c, i) => (
        <span key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: c }} />
      ))}
      <span>{to}</span>
    </div>
  );
}
