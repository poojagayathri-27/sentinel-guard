import { Intent, PolicyConfig, PolicyResult } from "./types";

export const DEFAULT_POLICY: PolicyConfig = {
  max_trade_amount: 50000,
  min_trade_amount: 10,
  allowed_tickers: ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "TSLA", "NVDA", "NFLX", "AMD", "INTC"],
  allowed_actions: ["buy", "sell"],
  max_daily_trades: 20,
};

export function checkPolicy(intent: Intent, policy: PolicyConfig, dailyTradeCount: number): PolicyResult {
  const violations: string[] = [];

  if (!intent.parsed) {
    violations.push("Could not parse trade intent from input");
  }

  if (intent.action && !policy.allowed_actions.includes(intent.action)) {
    violations.push(`Action '${intent.action}' is not allowed. Allowed: ${policy.allowed_actions.join(", ")}`);
  }

  if (intent.ticker && !policy.allowed_tickers.includes(intent.ticker)) {
    violations.push(`Ticker '${intent.ticker}' is not in the allowed list`);
  }

  if (intent.amount !== null) {
    if (intent.amount > policy.max_trade_amount) {
      violations.push(`Amount $${intent.amount.toLocaleString()} exceeds max of $${policy.max_trade_amount.toLocaleString()}`);
    }
    if (intent.amount < policy.min_trade_amount) {
      violations.push(`Amount $${intent.amount} is below min of $${policy.min_trade_amount}`);
    }
  }

  if (dailyTradeCount >= policy.max_daily_trades) {
    violations.push(`Daily trade limit of ${policy.max_daily_trades} reached`);
  }

  return { compliant: violations.length === 0, violations };
}
