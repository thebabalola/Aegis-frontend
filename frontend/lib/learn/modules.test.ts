import {
  LEARN_MODULES,
  getModule,
  moduleSlugs,
  totalQuizQuestions,
} from "./modules";

describe("learn module content", () => {
  it("exposes at least one module", () => {
    expect(LEARN_MODULES.length).toBeGreaterThan(0);
  });

  it("has a unique, url-safe slug for every module", () => {
    const seen = new Set<string>();
    for (const m of LEARN_MODULES) {
      expect(m.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(seen.has(m.slug)).toBe(false);
      seen.add(m.slug);
    }
    expect(moduleSlugs).toEqual(LEARN_MODULES.map((m) => m.slug));
  });

  it("has non-empty copy for every module", () => {
    for (const m of LEARN_MODULES) {
      expect(m.title.trim()).not.toBe("");
      expect(m.summary.trim()).not.toBe("");
      expect(m.durationMinutes).toBeGreaterThan(0);
      expect(m.sections.length).toBeGreaterThan(0);
      expect(m.keyTakeaways.length).toBeGreaterThan(0);

      for (const section of m.sections) {
        expect(section.heading.trim()).not.toBe("");
        expect(section.body.length).toBeGreaterThan(0);
        for (const paragraph of section.body) {
          expect(paragraph.trim()).not.toBe("");
        }
      }
    }
  });

  it("has a well-formed quiz for every module", () => {
    for (const m of LEARN_MODULES) {
      expect(m.quiz.length).toBeGreaterThan(0);
      for (const q of m.quiz) {
        expect(q.question.trim()).not.toBe("");
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
        expect(Number.isInteger(q.correctIndex)).toBe(true);
        expect(q.explanation.trim()).not.toBe("");
      }
    }
  });

  it("looks modules up by slug and returns undefined for unknown slugs", () => {
    expect(getModule(LEARN_MODULES[0].slug)).toBe(LEARN_MODULES[0]);
    expect(getModule("does-not-exist")).toBeUndefined();
  });

  it("counts every quiz question across modules", () => {
    const expected = LEARN_MODULES.reduce((sum, m) => sum + m.quiz.length, 0);
    expect(totalQuizQuestions()).toBe(expected);
  });
});
