"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Per-learner progress for the Community Education Portal (#101).
 *
 * Progress is intentionally local-only: it lives in `localStorage` under a
 * single key and never leaves the browser. There is no account to attach it
 * to, and losing it (cleared storage, another device) is harmless — the
 * learner just re-takes a quiz. Every read/write is guarded so the hook is
 * safe to call during SSR and in privacy modes where storage throws.
 */

export const LEARN_PROGRESS_STORAGE_KEY = "aegis:learn-progress:v1";

export interface ModuleProgress {
  /** The learner marked the lesson read, or scored full marks on the quiz. */
  completed: boolean;
  /** Best number of correct quiz answers so far. */
  bestScore: number;
  /** Number of questions the best score was out of. */
  totalQuestions: number;
}

export type LearnProgressMap = Record<string, ModuleProgress>;

function readStorage(): LearnProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LEARN_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as LearnProgressMap;
  } catch {
    return {};
  }
}

function writeStorage(value: LearnProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LEARN_PROGRESS_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    // Storage unavailable (private mode, quota) — progress is best-effort.
  }
}

export interface UseLearnProgress {
  progress: LearnProgressMap;
  /** False until the first client-side hydration from storage has run. */
  hydrated: boolean;
  isCompleted: (slug: string) => boolean;
  markComplete: (slug: string) => void;
  /** Records a quiz result, keeping the best score and completing on full marks. */
  recordQuizScore: (slug: string, score: number, totalQuestions: number) => void;
  /** Number of modules with `completed === true`. */
  completedCount: number;
  reset: () => void;
}

export function useLearnProgress(): UseLearnProgress {
  const [progress, setProgress] = useState<LearnProgressMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(readStorage());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: LearnProgressMap) => {
    setProgress(next);
    writeStorage(next);
  }, []);

  const isCompleted = useCallback(
    (slug: string) => progress[slug]?.completed ?? false,
    [progress],
  );

  const markComplete = useCallback(
    (slug: string) => {
      const existing = progress[slug];
      persist({
        ...progress,
        [slug]: {
          completed: true,
          bestScore: existing?.bestScore ?? 0,
          totalQuestions: existing?.totalQuestions ?? 0,
        },
      });
    },
    [progress, persist],
  );

  const recordQuizScore = useCallback(
    (slug: string, score: number, totalQuestions: number) => {
      const existing = progress[slug];
      const bestScore = Math.max(existing?.bestScore ?? 0, score);
      persist({
        ...progress,
        [slug]: {
          completed:
            (existing?.completed ?? false) ||
            (totalQuestions > 0 && score === totalQuestions),
          bestScore,
          totalQuestions:
            bestScore === score
              ? totalQuestions
              : existing?.totalQuestions ?? totalQuestions,
        },
      });
    },
    [progress, persist],
  );

  const reset = useCallback(() => persist({}), [persist]);

  const completedCount = Object.values(progress).filter(
    (p) => p.completed,
  ).length;

  return {
    progress,
    hydrated,
    isCompleted,
    markComplete,
    recordQuizScore,
    completedCount,
    reset,
  };
}
