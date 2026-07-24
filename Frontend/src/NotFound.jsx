import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-full flex items-center justify-center px-6 bg-dots">
      <div className="flex flex-col items-start gap-5 anim-rise">
        <span className="microlabel text-faint">error — route unresolved</span>
        <h1 className="font-mono text-[88px] leading-none font-medium tracking-tighter">
          4<span className="text-accent">0</span>4
        </h1>
        <p className="text-[14px] text-mut max-w-xs leading-relaxed">
          This path doesn't exist on the canvas.{" "}
          <span className="serif-it text-ink">Nothing but static here.</span>
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 border border-line px-4 py-2.5 microlabel text-ink hover:border-faint hover:bg-white/[0.03] transition-colors"
        >
          <ArrowLeft size={12} />
          back to overview
        </Link>
      </div>
    </div>
  );
}
