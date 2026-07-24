import { useEffect, useRef, useState } from "react";

/* ── brand + platform marks ─────────────────────────────── */

export function BrandMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="21" height="21" rx="4" stroke="var(--color-accent)" strokeWidth="1.6" />
      <path d="M8.2 16.5 15.8 7.5" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="8.2" r="1.7" fill="var(--color-accent)" />
      <circle cx="16" cy="15.8" r="1.7" fill="var(--color-ink)" />
    </svg>
  );
}

export function GitHubMark({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function LeetCodeMark({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14.5 3.5 7.8 10.2a4.2 4.2 0 0 0 0 5.9l3.1 3.1a4.2 4.2 0 0 0 5.9 0l1.2-1.1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path d="M10.5 13.4h9" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

/* ── layout & typographic primitives ────────────────────── */

/** Engineering-drawing corner ticks for a section container. */
export function Ticks() {
  const tick = "absolute w-2.5 h-2.5 border-faint/60 pointer-events-none";
  return (
    <>
      <span className={`${tick} top-0 left-0 border-t border-l`} />
      <span className={`${tick} top-0 right-0 border-t border-r`} />
      <span className={`${tick} bottom-0 left-0 border-b border-l`} />
      <span className={`${tick} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

/** Standard content section: ticked frame, mono index + title header. */
export function Section({ index, title, aside, children, className = "", delay = 0 }) {
  return (
    <section
      className={`relative border border-line bg-panel/70 anim-rise ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Ticks />
      {(title || aside) && (
        <header className="flex items-center justify-between gap-4 px-5 pt-4 pb-3 border-b border-linesoft">
          <div className="flex items-baseline gap-3 min-w-0">
            {index && <span className="microlabel text-faint">{index}</span>}
            <h2 className="microlabel text-mut truncate">{title}</h2>
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Big mono numeral with a microlabel — the ledger stat. */
export function StatBlock({ label, value, sub, accent, animate = true }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="microlabel text-faint">{label}</span>
      <span
        className="font-mono text-[26px] leading-none font-medium tracking-tight truncate"
        style={accent ? { color: accent } : undefined}
      >
        {animate && typeof value === "number" ? <CountUp value={value} /> : value ?? "—"}
      </span>
      {sub && <span className="text-[11px] text-mut truncate">{sub}</span>}
    </div>
  );
}

export function Chip({ color, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-line px-2 py-0.5 microlabel text-mut">
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
}

export function Spinner({ size = 16, className = "" }) {
  return (
    <span
      className={`inline-block border-2 border-line border-t-accent rounded-full ${className}`}
      style={{ width: size, height: size, animation: "spin 0.8s linear infinite" }}
      aria-label="loading"
    />
  );
}

export function LoadingPane({ label = "fetching data" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-mut anim-fade">
      <Spinner />
      <span className="microlabel">{label}…</span>
    </div>
  );
}

export function ErrorPane({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 anim-fade">
      <span className="microlabel text-rose">signal lost</span>
      <p className="text-sm text-mut max-w-sm text-center">{message}</p>
    </div>
  );
}

/* ── count-up numeral ───────────────────────────────────── */

export function CountUp({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = (t) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min((t - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    startRef.current = null;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display.toLocaleString("en-US")}</>;
}
