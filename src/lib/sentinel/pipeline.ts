import { PipelineResult, PolicyConfig } from "./types";
import { parseIntent } from "./intent";
import { detectRisks } from "./detection";
import { checkPolicy, DEFAULT_POLICY } from "./policy";
import { makeDecision } from "./decision";
import { executeTrade } from "./execution";
import { saveLogs, getLogs } from "./logger";
import { generateAlerts } from "./alerts";

export function getPolicy(): PolicyConfig {
  try {
    const raw = localStorage.getItem("sentinel_policy");
    return raw ? JSON.parse(raw) : { ...DEFAULT_POLICY };
  } catch {
    return { ...DEFAULT_POLICY };
  }
}

export function savePolicy(policy: PolicyConfig): void {
  localStorage.setItem("sentinel_policy", JSON.stringify(policy));
}

export async function runPipeline(input: string): Promise<PipelineResult> {
  const intent = parseIntent(input);
  const risk = detectRisks(input, intent.amount);
  const policy = getPolicy();

  const today = new Date().toISOString().slice(0, 10);
  const dailyTradeCount = getLogs().filter(l => l.timestamp.startsWith(today) && l.execution.executed).length;

  const policyResult = checkPolicy(intent, policy, dailyTradeCount);
  const decision = makeDecision(risk, policyResult);
  const execution = await executeTrade(intent, decision);
  const alerts = generateAlerts(risk, decision, intent);

  const result: PipelineResult = {
    input,
    intent,
    risk,
    policy: policyResult,
    decision,
    execution,
    alerts,
    timestamp: new Date().toISOString(),
  };

  saveLogs(result);
  return result;
}
