import { act, renderHook, waitFor } from "@testing-library/react";
import {
  LEARN_PROGRESS_STORAGE_KEY,
  useLearnProgress,
} from "./useLearnProgress";

describe("useLearnProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty and hydrates from storage", async () => {
    window.localStorage.setItem(
      LEARN_PROGRESS_STORAGE_KEY,
      JSON.stringify({
        "understanding-volatility": {
          completed: true,
          bestScore: 3,
          totalQuestions: 3,
        },
      }),
    );

    const { result } = renderHook(() => useLearnProgress());

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.isCompleted("understanding-volatility")).toBe(true);
    expect(result.current.completedCount).toBe(1);
  });

  it("marks a module complete and persists it", async () => {
    const { result } = renderHook(() => useLearnProgress());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.markComplete("what-is-hedging"));

    expect(result.current.isCompleted("what-is-hedging")).toBe(true);
    const stored = JSON.parse(
      window.localStorage.getItem(LEARN_PROGRESS_STORAGE_KEY) ?? "{}",
    );
    expect(stored["what-is-hedging"].completed).toBe(true);
  });

  it("keeps the best quiz score and completes only on full marks", async () => {
    const { result } = renderHook(() => useLearnProgress());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.recordQuizScore("reading-risk-signals", 2, 3));
    expect(result.current.progress["reading-risk-signals"].bestScore).toBe(2);
    expect(result.current.isCompleted("reading-risk-signals")).toBe(false);

    // A worse later attempt does not lower the best score.
    act(() => result.current.recordQuizScore("reading-risk-signals", 1, 3));
    expect(result.current.progress["reading-risk-signals"].bestScore).toBe(2);

    act(() => result.current.recordQuizScore("reading-risk-signals", 3, 3));
    expect(result.current.progress["reading-risk-signals"].bestScore).toBe(3);
    expect(result.current.isCompleted("reading-risk-signals")).toBe(true);
  });

  it("resets all progress", async () => {
    const { result } = renderHook(() => useLearnProgress());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.markComplete("how-aegis-hedges"));
    expect(result.current.completedCount).toBe(1);

    act(() => result.current.reset());
    expect(result.current.completedCount).toBe(0);
    expect(window.localStorage.getItem(LEARN_PROGRESS_STORAGE_KEY)).toBe("{}");
  });

  it("tolerates malformed stored data", async () => {
    window.localStorage.setItem(LEARN_PROGRESS_STORAGE_KEY, "not json");
    const { result } = renderHook(() => useLearnProgress());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.progress).toEqual({});
  });
});
