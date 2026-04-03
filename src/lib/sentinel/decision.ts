import { RiskResult, PolicyResult, DecisionResult, Decision } from "./types";

export function makeDecision(risk: RiskResult, policy: PolicyResult): DecisionResult {
  const reasons: string[] = [];
  let verdict: Decision;

  if (risk.risk_level === "HIGH") {
    verdict = "BLOCK";
    reasons.push(`High risk detected (score: ${risk.score})`);
    reasons.push(...risk.flags.map(f => `Risk flag: ${f}`));
  } else if (!policy.compliant) {
    verdict = "BLOCK";
    reasons.push("Policy violation(s) detected");
    reasons.push(...policy.violations);
  } else if (risk.risk_level === "MEDIUM") {
    verdict = "WARN";
    reasons.push(`Medium risk detected (score: ${risk.score})`);
    reasons.push(...risk.flags.map(f => `Risk flag: ${f}`));
  } else {
    verdict = "ALLOW";
    reasons.push("All checks passed");
  }

  return { verdict, reasons, risk, policy };
}
