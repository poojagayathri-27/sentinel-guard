import { LogEntry } from "./types";
import { getLogs } from "./logger";

export interface AnalyticsData {
  totalTrades: number;
  allowCount: number;
  warnCount: number;
  blockCount: number;
  riskDistribution: { LOW: number; MEDIUM: number; HIGH: number };
  topFlags: { flag: string; count: number }[];
  executedTrades: number;
  recentTrend: { date: string; allow: number; warn: number; block: number }[];
}

export function computeAnalytics(): AnalyticsData {
  const logs = getLogs();
  const total = logs.length;

  const allowCount = logs.filter(l => l.decision.verdict === "ALLOW").length;
  const warnCount = logs.filter(l => l.decision.verdict === "WARN").length;
  const blockCount = logs.filter(l => l.decision.verdict === "BLOCK").length;

  const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  const flagMap = new Map<string, number>();

  for (const log of logs) {
    riskDistribution[log.risk.risk_level]++;
    for (const flag of log.risk.flags) {
      flagMap.set(flag, (flagMap.get(flag) || 0) + 1);
    }
  }

  const topFlags = Array.from(flagMap.entries())
    .map(([flag, count]) => ({ flag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const executedTrades = logs.filter(l => l.execution.executed).length;

  // Last 7 days trend
  const trendMap = new Map<string, { allow: number; warn: number; block: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trendMap.set(key, { allow: 0, warn: 0, block: 0 });
  }
  for (const log of logs) {
    const key = log.timestamp.slice(0, 10);
    const entry = trendMap.get(key);
    if (entry) {
      const v = log.decision.verdict.toLowerCase() as "allow" | "warn" | "block";
      entry[v]++;
    }
  }
  const recentTrend = Array.from(trendMap.entries()).map(([date, data]) => ({ date, ...data }));

  return { totalTrades: total, allowCount, warnCount, blockCount, riskDistribution, topFlags, executedTrades, recentTrend };
}
