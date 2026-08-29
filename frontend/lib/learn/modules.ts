/**
 * Static course content for the Community Education Portal (`/learn`, #101).
 *
 * The portal is a self-contained hub for learning about currency volatility
 * and hedging — the two concepts X-Aegis is built around. Content lives here
 * as plain data so the route stays a static render and the interactive shell
 * (collapsible lessons, knowledge-check quizzes, progress tracking) can be
 * unit-tested against a stable source of truth.
 */

export type ModuleLevel = "Beginner" | "Intermediate" | "Advanced";

export interface QuizQuestion {
  /** The prompt shown to the learner. */
  question: string;
  /** Answer choices, rendered in order. Must contain at least two entries. */
  options: string[];
  /** Zero-based index into `options` of the correct choice. */
  correctIndex: number;
  /** Shown after the learner submits, explaining why the answer is correct. */
  explanation: string;
}

export interface LessonSection {
  heading: string;
  /** One or more paragraphs of body copy. */
  body: string[];
}

export interface LearnModule {
  /** URL-safe identifier; the `/learn/[slug]` route segment. */
  slug: string;
  title: string;
  /** One-line description shown on the portal index card. */
  summary: string;
  level: ModuleLevel;
  /** Rough reading time in minutes, shown as a hint on the card. */
  durationMinutes: number;
  sections: LessonSection[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
}

export const LEARN_MODULES: LearnModule[] = [
  {
    slug: "understanding-volatility",
    title: "Understanding Volatility",
    summary:
      "What currency volatility is, why it hurts savers, and how to read it.",
    level: "Beginner",
    durationMinutes: 6,
    sections: [
      {
        heading: "What volatility actually measures",
        body: [
          "Volatility is the degree to which a price moves around over time. A currency that trades at 1,000 to the dollar one week and 1,150 the next is more volatile than one that drifts between 1,000 and 1,010.",
          "It is usually expressed as an annualised percentage — the standard deviation of returns. A 5% annual volatility is calm; 40% means the value routinely swings by large amounts within a year.",
          "Volatility is direction-agnostic. A sharp move up counts just as much as a sharp move down. What matters for planning is the size of the swings, not the sign.",
        ],
      },
      {
        heading: "Why it matters for everyday savings",
        body: [
          "If you are paid and spend in the same stable currency, day-to-day volatility barely touches you. The problem appears when your savings are denominated in a currency that loses value or lurches unpredictably against the goods and services you actually buy.",
          "High volatility makes it impossible to plan. You cannot budget for a purchase six months out if the purchasing power of your savings might fall 20% in the meantime.",
          "Inflation is the slow, compounding version of the same problem: a persistent downward drift in what your money can buy.",
        ],
      },
      {
        heading: "Reading a volatility figure",
        body: [
          "A single number never tells the whole story. Look at the time window — 30-day realised volatility reacts fast to a crisis; 1-year volatility smooths it out.",
          "Compare against a baseline. Emerging-market currencies often sit at 10–15% annualised in calm periods and spike far higher during a shock. The jump from baseline is the signal.",
          "Realised volatility looks backward at what already happened. Implied volatility, derived from options prices, is the market's forward-looking estimate.",
        ],
      },
    ],
    keyTakeaways: [
      "Volatility measures the size of price swings, not their direction.",
      "It is typically quoted as an annualised percentage.",
      "It only threatens your savings when they are held in an unstable currency.",
      "Always check the time window and the baseline before reacting to a number.",
    ],
    quiz: [
      {
        question: "Volatility is best described as a measure of…",
        options: [
          "How much a price is expected to rise",
          "The size of a price's movements over time",
          "The total trading volume of an asset",
          "The interest rate paid on a currency",
        ],
        correctIndex: 1,
        explanation:
          "Volatility captures the magnitude of price swings in either direction — up moves and down moves both add to it.",
      },
      {
        question:
          "A currency shows 12% annualised volatility in calm months and 45% during a crisis. The meaningful signal is…",
        options: [
          "The 45% figure on its own",
          "The 12% figure on its own",
          "The jump from the 12% baseline to 45%",
          "The average of the two numbers",
        ],
        correctIndex: 2,
        explanation:
          "Deviation from the normal baseline is what indicates stress. An absolute number means little without context.",
      },
      {
        question: "Implied volatility differs from realised volatility because it…",
        options: [
          "Is always lower",
          "Looks forward, derived from options prices",
          "Ignores the time window",
          "Only applies to stablecoins",
        ],
        correctIndex: 1,
        explanation:
          "Realised volatility is backward-looking; implied volatility is the market's forward estimate priced into options.",
      },
    ],
  },
  {
    slug: "what-is-hedging",
    title: "What Is Hedging?",
    summary:
      "The core idea behind offsetting risk, and the trade-offs every hedge carries.",
    level: "Beginner",
    durationMinutes: 7,
    sections: [
      {
        heading: "A hedge is an offsetting position",
        body: [
          "To hedge is to take a second position that gains value when your main position loses value. The two are negatively correlated, so a loss on one side is cushioned by a gain on the other.",
          "A farmer who will harvest wheat in three months can sell wheat futures today. If the wheat price falls, the crop is worth less but the futures position profits — the farmer has locked in a price.",
          "The goal is not to make money on the hedge. It is to make the combined outcome more predictable.",
        ],
      },
      {
        heading: "Hedging always has a cost",
        body: [
          "A hedge trades upside for certainty. If you hedge your currency exposure and that currency then strengthens, you forgo the gain you would otherwise have made.",
          "There are direct costs too: option premiums, funding rates on perpetual positions, spreads, and transaction fees. A hedge that is too expensive can cost more than the risk it removes.",
          "Good hedging is about proportion — covering enough of the downside to sleep at night without paying so much that the protection isn't worth it.",
        ],
      },
      {
        heading: "Common hedging instruments",
        body: [
          "Forwards and futures lock in a future exchange rate. Simple, but they remove upside as well as downside.",
          "Options give the right, not the obligation, to trade at a set price. They preserve upside but cost a premium.",
          "Holding a reserve in a more stable asset — for X-Aegis, USD-pegged stablecoins — is the simplest hedge of all: it reduces exposure to the volatile currency by simply holding less of it.",
        ],
      },
    ],
    keyTakeaways: [
      "A hedge is a position that moves opposite to the risk you want to cover.",
      "The point of a hedge is predictability, not profit.",
      "Every hedge costs something — in forgone upside, premiums, or fees.",
      "Instruments range from forwards and options to simply holding a stable reserve.",
    ],
    quiz: [
      {
        question: "The primary purpose of a hedge is to…",
        options: [
          "Maximise returns",
          "Make the combined outcome more predictable",
          "Avoid all transaction fees",
          "Increase leverage",
        ],
        correctIndex: 1,
        explanation:
          "A hedge is designed to reduce the range of outcomes, trading potential upside for greater certainty.",
      },
      {
        question: "If you fully hedge a currency and it then strengthens, you…",
        options: [
          "Profit from the hedge and the currency",
          "Forgo the gain you would have made unhedged",
          "Pay no cost at all",
          "Automatically double your position",
        ],
        correctIndex: 1,
        explanation:
          "Removing downside risk also removes upside. That forgone gain is a real cost of hedging.",
      },
      {
        question:
          "Which instrument preserves upside while still protecting the downside?",
        options: [
          "A forward contract",
          "A futures contract",
          "An option",
          "A fixed-rate loan",
        ],
        correctIndex: 2,
        explanation:
          "An option is a right rather than an obligation, so you keep the upside and pay a premium for the protection.",
      },
    ],
  },
  {
    slug: "how-aegis-hedges",
    title: "How X-Aegis Hedges",
    summary:
      "How the vault turns a volatility forecast into an on-chain allocation.",
    level: "Intermediate",
    durationMinutes: 8,
    sections: [
      {
        heading: "Forecast, then allocate",
        body: [
          "The AI risk engine produces a rolling forecast of FX volatility for the days ahead. That forecast is the input to the vault's allocation logic, not the output shown to users.",
          "When the forecast is calm, the strategy leans toward yield-bearing positions. When volatility is projected to rise, it shifts capital toward stable USD-pegged reserves and protective positions.",
          "The shift is gradual and bounded. The strategy never moves the entire portfolio at once, and the maximum defensive allocation is capped so the vault always retains some growth exposure.",
        ],
      },
      {
        heading: "Delta-neutral positioning",
        body: [
          "A delta-neutral position is constructed so its value barely moves when the underlying price moves. It is built by combining a spot holding with an offsetting derivative position of equal and opposite sensitivity.",
          "This is how the vault holds exposure to an asset for yield purposes while neutralising the price risk that would otherwise come with it.",
          "Maintaining delta-neutrality requires periodic rebalancing as prices drift — a cost the strategy weighs against the protection it provides.",
        ],
      },
      {
        heading: "What the vault does not do",
        body: [
          "It does not attempt to time the market for profit. The objective is preservation of purchasing power, not speculative return.",
          "It does not use unbounded leverage. Position sizes are constrained relative to vault equity.",
          "It does not act on a single data point. Allocation changes respond to a sustained shift in the forecast, not a one-off spike.",
        ],
      },
    ],
    keyTakeaways: [
      "The volatility forecast drives allocation; it is an input, not a promise.",
      "Calm forecast → more yield exposure; stormy forecast → more stable reserves.",
      "Delta-neutral positions hold an asset for yield while cancelling its price risk.",
      "The strategy is bounded: no full-portfolio moves, no unbounded leverage, no reacting to single spikes.",
    ],
    quiz: [
      {
        question:
          "When the risk engine forecasts rising volatility, the vault generally…",
        options: [
          "Moves the entire portfolio into one asset",
          "Shifts capital toward stable reserves and protective positions",
          "Increases leverage to chase yield",
          "Does nothing until volatility actually arrives",
        ],
        correctIndex: 1,
        explanation:
          "A stormy forecast pushes the allocation toward USD-pegged reserves and hedges, gradually and within caps.",
      },
      {
        question: "A delta-neutral position is one whose value…",
        options: [
          "Doubles when the underlying rises",
          "Barely changes when the underlying price moves",
          "Can only be held in stablecoins",
          "Requires no rebalancing",
        ],
        correctIndex: 1,
        explanation:
          "Delta-neutral means the offsetting positions cancel out price sensitivity, so the combined value stays roughly flat as the price moves.",
      },
      {
        question: "Which of these is explicitly NOT a goal of the vault?",
        options: [
          "Preserving purchasing power",
          "Bounded position sizing",
          "Timing the market for speculative profit",
          "Responding to sustained forecast shifts",
        ],
        correctIndex: 2,
        explanation:
          "The vault targets preservation, not speculation. It does not try to time the market for gain.",
      },
    ],
  },
  {
    slug: "reading-risk-signals",
    title: "Reading Risk Signals",
    summary:
      "How to interpret the dashboard's risk score, forecast chart, and market signals.",
    level: "Intermediate",
    durationMinutes: 6,
    sections: [
      {
        heading: "The risk score and badge",
        body: [
          "The dashboard condenses the current outlook into a single Low / Medium / High badge. It is a summary of the volatility forecast over the near term, not a live market price.",
          "A Medium badge does not mean something is wrong. It means the model sees more uncertainty than its calm baseline and the strategy is positioned slightly more defensively than usual.",
          "The badge changes state on sustained moves in the forecast, so it will lag a sudden headline by design — that lag filters out noise.",
        ],
      },
      {
        heading: "The 7-day forecast chart",
        body: [
          "The forecast chart plots the projected volatility index day by day. An upward slope means the model expects conditions to deteriorate; a downward slope means it expects them to ease.",
          "The absolute level matters as much as the slope. A flat line at a high level is a sustained stress environment; a flat line at a low level is calm.",
          "Treat the far end of the forecast with more caution than the near end. Uncertainty compounds the further out you project.",
        ],
      },
      {
        heading: "Market signals",
        body: [
          "The market-signals panel lists a few external indicators — currency-pair volatility, liquidity-pool yields, an inflation read — each tagged with a qualitative trend.",
          "These are context, not instructions. They help explain why the forecast looks the way it does.",
          "When several signals point the same way, the forecast is on firmer ground. When they conflict, expect the model to be more tentative.",
        ],
      },
    ],
    keyTakeaways: [
      "The risk badge summarises the near-term forecast; it is not a live price.",
      "Medium risk is a normal state, not an alarm.",
      "On the forecast chart, read both the slope and the absolute level.",
      "Market signals are context that explains the forecast, not trade instructions.",
    ],
    quiz: [
      {
        question: "A 'Medium' risk badge on the dashboard indicates…",
        options: [
          "An error in the model",
          "More uncertainty than the calm baseline, with slightly more defensive positioning",
          "That a loss has already occurred",
          "The vault has paused all activity",
        ],
        correctIndex: 1,
        explanation:
          "Medium simply means elevated uncertainty relative to baseline. It is an expected, common state.",
      },
      {
        question: "On the 7-day forecast chart, a flat line at a high level means…",
        options: [
          "Conditions are calm",
          "A sustained stress environment",
          "The chart has failed to load",
          "Volatility is about to fall sharply",
        ],
        correctIndex: 1,
        explanation:
          "The absolute level carries information. A high, flat forecast is persistent stress, even though the slope is zero.",
      },
      {
        question: "The market-signals panel is best used as…",
        options: [
          "A list of trades to execute",
          "Context that explains why the forecast looks as it does",
          "A real-time price ticker",
          "A guarantee of future returns",
        ],
        correctIndex: 1,
        explanation:
          "Signals are supporting context. Agreement between them strengthens confidence in the forecast; conflict weakens it.",
      },
    ],
  },
];

/** All module slugs, in display order. */
export const moduleSlugs: string[] = LEARN_MODULES.map((m) => m.slug);

/** Look up a single module by its slug. Returns `undefined` if none matches. */
export function getModule(slug: string): LearnModule | undefined {
  return LEARN_MODULES.find((m) => m.slug === slug);
}

/** Total number of quiz questions across every module. */
export function totalQuizQuestions(): number {
  return LEARN_MODULES.reduce((sum, m) => sum + m.quiz.length, 0);
}
