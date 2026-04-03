export type Action = "buy" | "sell";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type Decision = "ALLOW" | "WARN" | "BLOCK";

export interface Intent {
  action: Action | null;
  ticker: string | null;
  amount: number | null;
  raw: string;
  parsed: boolean;
  error?: string; // ✅ ADD THIS LINE
}

export interface RiskResult {
  risk_level: RiskLevel;
  flags: string[];
  score: number;
}

export interface PolicyConfig {
  max_trade_amount: number;
  min_trade_amount: number;
  allowed_tickers: string[];
  allowed_actions: Action[];
  max_daily_trades: number;
}

export interface PolicyResult {
  compliant: boolean;
  violations: string[];
}

export interface DecisionResult {
  verdict: Decision;
  reasons: string[];
  risk: RiskResult;
  policy: PolicyResult;
}

export interface ExecutionResult {
  executed: boolean;
  status: string;
  trade_id: string | null;
  timestamp: string;
  details: string;
}

export interface Alert {
  type: "HIGH_RISK" | "REPEATED_BLOCK" | "LARGE_TRADE";
  message: string;
  severity: "warning" | "critical";
  timestamp: string;
}

export interface PipelineResult {
  input: string;
  intent: Intent;
  risk: RiskResult;
  policy: PolicyResult;
  decision: DecisionResult;
  execution: ExecutionResult;
  alerts: Alert[];
  timestamp: string;
}

export interface LogEntry extends PipelineResult {
  id: string;
}
