import { Alert, RiskResult, DecisionResult, Intent } from "./types";
import { getLogs } from "./logger";

export function generateAlerts(risk: RiskResult, decision: DecisionResult, intent: Intent): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  if (risk.risk_level === "HIGH") {
    alerts.push({
      type: "HIGH_RISK",
      message: `High risk input detected with flags: ${risk.flags.join(", ")}`,
      severity: "critical",
      timestamp: now,
    });
  }

  if (intent.amount && intent.amount > 25000) {
    alerts.push({
      type: "LARGE_TRADE",
      message: `Large trade attempt: $${intent.amount.toLocaleString()} for ${intent.ticker}`,
      severity: "warning",
      timestamp: now,
    });
  }

  // Check repeated blocks
  const logs = getLogs();
  const recentBlocks = logs.slice(0, 10).filter(l => l.decision.verdict === "BLOCK").length;
  if (recentBlocks >= 3) {
    alerts.push({
      type: "REPEATED_BLOCK",
      message: `${recentBlocks} trades blocked in the last 10 attempts — possible attack pattern`,
      severity: "critical",
      timestamp: now,
    });
  }

  return alerts;
}
