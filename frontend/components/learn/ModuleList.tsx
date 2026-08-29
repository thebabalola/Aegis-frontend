"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock } from "lucide-react";
import { LEARN_MODULES } from "@/lib/learn/modules";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { cn } from "@/lib/utils";

/**
 * Progress-aware grid of learn modules for the `/learn` portal index (#101).
 */
export function ModuleList() {
  const { isCompleted, completedCount, hydrated } = useLearnProgress();
  const total = LEARN_MODULES.length;
  const done = hydrated ? completedCount : 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Your progress</span>
          <span className="text-muted-foreground" aria-live="polite">
            {done} / {total} modules
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Module cards */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LEARN_MODULES.map((module) => {
          const complete = hydrated && isCompleted(module.slug);
          return (
            <li key={module.slug}>
              <Link
                href={`/learn/${module.slug}`}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border bg-card p-5 transition-colors",
                  complete
                    ? "border-green-500/40"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {module.level}
                  </span>
                  {complete ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500">
                      <Check className="h-3.5 w-3.5" />
                      Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {module.durationMinutes} min
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold">{module.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {module.summary}
                </p>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {complete ? "Review module" : "Start module"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
