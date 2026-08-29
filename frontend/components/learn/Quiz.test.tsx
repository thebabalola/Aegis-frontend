import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Quiz } from "./Quiz";
import type { QuizQuestion } from "@/lib/learn/modules";

const QUESTIONS: QuizQuestion[] = [
  {
    question: "Volatility measures…",
    options: ["Direction of price", "Size of price swings", "Trading volume"],
    correctIndex: 1,
    explanation: "It captures the magnitude of moves in either direction.",
  },
  {
    question: "A hedge exists to…",
    options: ["Maximise returns", "Increase certainty"],
    correctIndex: 1,
    explanation: "Predictability, not profit.",
  },
];

describe("Quiz", () => {
  it("keeps the submit button disabled until every question is answered", async () => {
    const user = userEvent.setup();
    render(<Quiz questions={QUESTIONS} />);

    const submit = screen.getByRole("button", { name: /check answers/i });
    expect(submit).toBeDisabled();

    await user.click(screen.getByLabelText("Size of price swings"));
    expect(submit).toBeDisabled();

    await user.click(screen.getByLabelText("Increase certainty"));
    expect(submit).toBeEnabled();
  });

  it("scores the attempt and reports it through onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<Quiz questions={QUESTIONS} onSubmit={onSubmit} />);

    await user.click(screen.getByLabelText("Size of price swings"));
    await user.click(screen.getByLabelText("Maximise returns")); // wrong
    await user.click(screen.getByRole("button", { name: /check answers/i }));

    expect(onSubmit).toHaveBeenCalledWith(1, 2);
    expect(screen.getByRole("status")).toHaveTextContent("You scored 1 / 2");
    expect(screen.getByText(/Predictability, not profit\./)).toBeInTheDocument();
  });

  it("resets the attempt on retry", async () => {
    const user = userEvent.setup();
    render(<Quiz questions={QUESTIONS} />);

    await user.click(screen.getByLabelText("Size of price swings"));
    await user.click(screen.getByLabelText("Increase certainty"));
    await user.click(screen.getByRole("button", { name: /check answers/i }));

    expect(screen.getByRole("status")).toHaveTextContent("module complete");

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(
      screen.getByRole("button", { name: /check answers/i }),
    ).toBeDisabled();
  });
});
