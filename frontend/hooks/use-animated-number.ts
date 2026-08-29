"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

interface AnimState {
  from: number;
  to: number;
  rafId: number;
  startTime: number;
  elapsed: number;
}

export function useAnimatedNumber(target: number, duration = 600): number {
  const [displayed, setDisplayed] = useState(target);

  const currentRef = useRef(target);

  const anim = useRef<AnimState>({
    from: target,
    to: target,
    rafId: 0,
    startTime: -1,
    elapsed: 0,
  });

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const runAnimation = useCallback((): void => {
    const a = anim.current;

    const tick = (timestamp: number): void => {
      if (a.startTime < 0) a.startTime = timestamp;

      const t = Math.min(
        (timestamp - a.startTime + a.elapsed) / durationRef.current,
        1,
      );

      const next = a.from + (a.to - a.from) * easeOutCubic(t);
      currentRef.current = next;
      setDisplayed(next);

      if (t < 1) {
        a.rafId = requestAnimationFrame(tick);
      } else {
        a.from = a.to;
        a.rafId = 0;
      }
    };

    a.startTime = -1;
    a.rafId = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const a = anim.current;
    if (target === a.to) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancelAnimationFrame(a.rafId);
      a.from = a.to = target;
      a.elapsed = 0;
      a.rafId = 0;
      currentRef.current = target;
      setDisplayed(target);
      return;
    }

    cancelAnimationFrame(a.rafId);
    a.from = currentRef.current;
    a.to = target;
    a.elapsed = 0;
    runAnimation();

    return (): void => {
      cancelAnimationFrame(a.rafId);
    };
  }, [target, runAnimation]);

  useEffect(() => {
    const a = anim.current;
    let hiddenAt = -1;

    const onVisibilityChange = (): void => {
      if (document.hidden) {
        if (a.rafId) {
          cancelAnimationFrame(a.rafId);
          a.rafId = 0;
          if (a.startTime >= 0) {
            a.elapsed += performance.now() - a.startTime;
            a.startTime = -1;
          }
          hiddenAt = performance.now();
        }
      } else if (hiddenAt >= 0 && a.rafId === 0 && a.to !== a.from) {
        hiddenAt = -1;
        runAnimation();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return (): void => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimationFrame(a.rafId);
    };
  }, [runAnimation]);

  return displayed;
}
