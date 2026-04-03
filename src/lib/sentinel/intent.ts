import { Intent, Action } from "./types";

const ACTION_PATTERNS: Record<Action, RegExp[]> = {
  buy: [/\bbuy\b/i, /\bpurchase\b/i, /\bacquire\b/i, /\blong\b/i, /\bget\b/i],
  sell: [/\bsell\b/i, /\bdump\b/i, /\bshort\b/i, /\bdispose\b/i, /\bexit\b/i],
};

const TICKER_MAP: Record<string, string> = {
  tesla: "TSLA",
  apple: "AAPL",
  google: "GOOGL",
  microsoft: "MSFT",
  amazon: "AMZN",
  meta: "META",
  nvidia: "NVDA",
  netflix: "NFLX",
  amd: "AMD",
  intel: "INTC",
};

const VALID_TICKERS = [
  "AAPL", "TSLA", "MSFT", "GOOGL", "AMZN",
  "META", "NVDA", "NFLX", "AMD", "INTC"
];

const AMOUNT_PATTERNS = [
  /\$?([\d,]+(?:\.\d{2})?)\b/,
  /\b([\d,]+(?:\.\d{2})?)\s*(?:dollars?|usd)/i,
  /\bfor\s+\$?([\d,]+(?:\.\d{2})?)/i,
  /\b([\d,]+)\s*(?:shares?|units?|stocks?)/i,
];

export function parseIntent(input: string): Intent {
  const result: Intent = {
    action: null,
    ticker: null,
    amount: null,
    raw: input,
    parsed: false,
  };

  const text = input.trim();
  const lowerInput = text.toLowerCase();
  const upperInput = text.toUpperCase();

  // 🔹 Parse action
  for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) {
      result.action = action as Action;
      break;
    }
  }

  // 🔹 Parse ticker from known names
  for (const [name, symbol] of Object.entries(TICKER_MAP)) {
    if (lowerInput.includes(name)) {
      result.ticker = symbol;
      break;
    }
  }

  // 🔹 Parse ticker from uppercase symbols (STRICT VALIDATION)
  // 🔹 Parse ticker from uppercase symbols (IMPROVED)
if (!result.ticker) {
  const matches = upperInput.match(/\b[A-Z]{2,5}\b/g);

  if (matches) {
    for (const candidate of matches) {
      if (VALID_TICKERS.includes(candidate)) {
        result.ticker = candidate;
        break;
      }
    }

    // If no valid ticker found → invalid
    if (!result.ticker) {
      return {
        ...result,
        parsed: false,
        error: "INVALID_TICKER",
      };
    }
  }
}

  // 🔹 Parse amount
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      result.amount = parseFloat(match[1].replace(/,/g, ""));
      break;
    }
  }

  // 🔹 Final validation
  if (!result.action || !result.ticker) {
    return {
      ...result,
      parsed: false,
      error: "INVALID_INPUT",
    };
  }

  result.parsed = true;
  return result;
}