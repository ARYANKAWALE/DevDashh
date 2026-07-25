import { Link, useRouteError } from "react-router-dom";
import { RotateCcw } from "lucide-react";

export default function RouteError() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg bg-dots text-ink">
      <div className="flex flex-col items-start gap-5 anim-rise">
        <span className="microlabel text-rose">runtime fault</span>
        <h1 className="text-4xl font-medium tracking-tight">
          Something <span className="serif-it text-rose">glitched.</span>
        </h1>
        <p className="text-[15px] text-mut max-w-sm leading-relaxed font-mono">
          {error?.message ?? "An unexpected error interrupted the render."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 border border-line px-4 py-2.5 microlabel text-ink hover:border-faint hover:bg-white/[0.03] transition-colors"
          >
            <RotateCcw size={12} />
            reload
          </button>
          <Link
            to="/"
            reloadDocument
            className="flex items-center gap-2 border border-line px-4 py-2.5 microlabel text-mut hover:text-ink transition-colors"
          >
            back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}
