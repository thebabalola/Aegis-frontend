"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { QuizQuestion } from "@/lib/learn/modules";
import { cn } from "@/lib/utils";

interface QuizProps {
  questions: QuizQuestion[];
  /** Called with the score each time the learner submits an attempt. */
  onSubmit?: (score: number, total: number) => void;
}

/**
 * Interactive knowledge check for a learn module (#101).
 *
 * The learner picks one answer per question, submits once, and sees
 * per-question feedback with explanations plus an overall score. Retry
 * clears the attempt so they can try again.
 */
export function Quiz({ questions, onSubmit }: QuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredAll = Object.keys(answers).length === questions.length;

  const score = useMemo(
    () =>
      questions.reduce(
        (total, q, i) => total + (answers[i] === q.correctIndex ? 1 : 0),
        0,
      ),
    [questions, answers],
  );

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!answeredAll) return;
    setSubmitted(true);
    onSubmit?.(score, questions.length);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const allCorrect = submitted && score === questions.length;

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => {
        const selected = answers[qi];
        return (
          <fieldset key={qi} className="space-y-3">
            <legend className="text-sm font-semibold">
              {qi + 1}. {q.question}
            </legend>
            <div className="space-y-2">
              {q.options.map((option, oi) => {
                const isSelected = selected === oi;
                const isCorrect = oi === q.correctIndex;
                const showCorrect = submitted && isCorrect;
                const showWrong = submitted && isSelected && !isCorrect;

                return (
                  <label
                    key={oi}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
                      submitted
                        ? "cursor-default"
                        : "cursor-pointer hover:border-primary/50",
                      showCorrect &&
                        "border-green-500/50 bg-green-500/10 text-foreground",
                      showWrong &&
                        "border-destructive/50 bg-destructive/10 text-foreground",
                      !showCorrect &&
                        !showWrong &&
                        isSelected &&
                        "border-primary bg-primary/5",
                      !showCorrect && !showWrong && !isSelected && "border-border",
                    )}
                  >
                    <input
                      type="radio"
                      name={`quiz-q-${qi}`}
                      value={oi}
                      checked={isSelected}
                      onChange={() => handleSelect(qi, oi)}
                      disabled={submitted}
                      className="mt-0.5 accent-primary"
                    />
                    <span className="flex-1">{option}</span>
                    {showCorrect && (
                      <Check
                        className="h-4 w-4 shrink-0 text-green-500"
                        aria-label="Correct answer"
                      />
                    )}
                    {showWrong && (
                      <X
                        className="h-4 w-4 shrink-0 text-destructive"
                        aria-label="Your answer, incorrect"
                      />
                    )}
                  </label>
                );
              })}
            </div>
            {submitted && (
              <p className="text-xs text-muted-foreground">{q.explanation}</p>
            )}
          </fieldset>
        );
      })}

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!answeredAll}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check answers
        </button>
      ) : (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4",
            allCorrect
              ? "border-green-500/40 bg-green-500/10"
              : "border-border bg-muted/40",
          )}
          role="status"
        >
          <p className="text-sm font-semibold">
            You scored {score} / {questions.length}
            {allCorrect ? " — module complete." : ". Review the explanations and try again."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
