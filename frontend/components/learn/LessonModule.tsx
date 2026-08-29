"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronDown,
  Clock,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import type { LearnModule } from "@/lib/learn/modules";
import { useLearnProgress } from "@/hooks/useLearnProgress";
import { cn } from "@/lib/utils";
import { Quiz } from "./Quiz";

/**
 * The interactive shell for a single `/learn/[slug]` module (#101):
 * collapsible lesson sections, key takeaways, a knowledge-check quiz, and a
 * "mark complete" control backed by local progress tracking.
 */
export function LessonModule({ module }: { module: LearnModule }) {
  const { isCompleted, markComplete, recordQuizScore, progress, hydrated } =
    useLearnProgress();
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    0: true,
  });

  const completed = hydrated && isCompleted(module.slug);
  const best = progress[module.slug];

  const toggleSection = (index: number) =>
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/learn"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          All modules
        </Link>

        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            {module.level}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {module.durationMinutes} min read
          </span>
          {completed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 font-semibold text-green-500">
              <Check className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {module.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{module.summary}</p>

        {/* Lesson sections */}
        <section className="mt-8 space-y-3" aria-label="Lesson">
          {module.sections.map((section, i) => {
            const open = openSections[i] ?? false;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {section.heading}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </button>
                {open && (
                  <div className="space-y-3 border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    {section.body.map((paragraph, pi) => (
                      <p key={pi}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Key takeaways */}
        <section className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-primary" />
            Key takeaways
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {module.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Quiz */}
        <section className="mt-8" aria-label="Knowledge check">
          <h2 className="text-lg font-bold">Knowledge check</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Answer all {module.quiz.length} questions, then check your work.
            {best?.bestScore ? (
              <span className="ml-1 font-medium text-foreground">
                Best so far: {best.bestScore} / {best.totalQuestions}.
              </span>
            ) : null}
          </p>
          <Quiz
            questions={module.quiz}
            onSubmit={(scoreValue, total) =>
              recordQuizScore(module.slug, scoreValue, total)
            }
          />
        </section>

        {/* Completion control */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => markComplete(module.slug)}
            disabled={completed}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {completed ? "Marked as complete" : "Mark as complete"}
          </button>
          <Link
            href="/learn"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to all modules
          </Link>
        </div>
      </div>
    </main>
  );
}
