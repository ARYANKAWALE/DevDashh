import { Link } from "react-router-dom";
import { BrandMark, GitHubMark, LeetCodeMark, Ticks } from "../ui/Primitives";

/** Split-panel shell shared by Login and Register. */
export default function AuthShell({ tagline, children }) {
  return (
    <div className="min-h-screen w-full bg-bg text-ink flex">
      {/* brand panel */}
      <aside className="hidden lg:flex w-[42%] flex-col justify-between border-r border-line bg-dots p-10 xl:p-14">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark size={22} />
          <span className="font-mono text-[17px] font-semibold tracking-tight">
            dev<span className="text-accent">dash</span>
          </span>
        </Link>

        <div className="flex flex-col gap-6 anim-rise">
          <h1 className="text-4xl xl:text-5xl font-medium tracking-tight leading-[1.1]">
            {tagline.head}
            <br />
            <span className="serif-it text-accent">{tagline.flourish}</span>
          </h1>
          <p className="text-[16px] text-mut max-w-sm leading-relaxed">{tagline.body}</p>

          <div className="relative border border-line bg-panel/70 p-4 mt-2 max-w-sm">
            <Ticks />
            <div className="flex flex-col gap-2.5 font-mono text-[13px]">
              <span className="microlabel text-faint">supported signal</span>
              <span className="flex items-center gap-2.5 text-mut">
                <span className="text-ghb">
                  <GitHubMark size={13} />
                </span>
                github — contributions · repos · languages
              </span>
              <span className="flex items-center gap-2.5 text-mut">
                <span className="text-lc">
                  <LeetCodeMark size={13} />
                </span>
                leetcode — problems · ranking · streaks
              </span>
              <span className="flex items-center gap-2.5 text-faint">
                <span className="w-[13px] text-center">+</span>
                more platforms soon
              </span>
            </div>
          </div>
        </div>

        <p className="microlabel text-faint">public data only · no oauth · no passwords shared</p>
      </aside>

      {/* form panel */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="lg:hidden flex items-center gap-2.5 px-6 h-14 border-b border-line">
          <BrandMark size={18} />
          <span className="font-mono text-[16px] font-semibold tracking-tight">
            dev<span className="text-accent">dash</span>
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}

/* shared form field */
export function Field({ label, error, right, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="microlabel text-mut">{label}</label>
        {right}
      </div>
      <div
        className={`flex items-center border bg-panel/60 focus-within:border-faint transition-colors ${
          error ? "border-rose/60" : "border-line"
        }`}
      >
        {children}
      </div>
      {error && <p className="font-mono text-[13px] text-rose">{error}</p>}
    </div>
  );
}

export const inputCls =
  "flex-1 min-w-0 bg-transparent px-3.5 py-3 font-mono text-[15px] text-ink outline-none";
