import { VISIT_STEPS, VISIT_SUITE } from "@/lib/location";

export function VisitDirections({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-white p-5 md:p-6 shadow-sm ${className}`}
      style={{ wordSpacing: "0.08em" }}
    >
      <p className="text-gold-dark text-[11px] font-semibold uppercase tracking-[0.16em] mb-2">
        How to find us
      </p>
      <p className="font-serif font-bold text-black text-xl leading-snug">
        {VISIT_SUITE.suite}, {VISIT_SUITE.floor}
      </p>
      <p className="text-sm text-muted-foreground mt-1 mb-5">{VISIT_SUITE.building}, London</p>
      <ol className="space-y-4">
        {VISIT_STEPS.map((step, i) => (
          <li key={step.name} className="flex gap-3.5">
            <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-black text-sm leading-snug">{step.name}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
