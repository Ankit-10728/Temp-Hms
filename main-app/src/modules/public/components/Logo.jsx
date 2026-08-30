import { PawPrint } from "lucide-react";

export default function Logo({ light = false, showSubtitle = true }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center shadow-sm">
          <PawPrint className="w-5 h-5" />
        </div>
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-white" />
      </div>
      <div className="leading-tight">
        <div
          className={`font-serif text-xl font-bold tracking-wide ${
            light ? "text-white" : "text-ink"
          }`}
        >
          PAHMS
        </div>
        {showSubtitle && !light && (
          <div className="text-[11px] text-ink-soft -mt-0.5">
            Pet &amp; Animal Healthcare
          </div>
        )}
      </div>
    </div>
  );
}
