import { RiskResult } from "./types";
import { getLogs } from "./logger";

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?rules/i,
  /bypass/i,
  /override\s+policy/i,
  /disregard\s+instructions/i,
  /forget\s+(your\s+)?rules/i,
  /act\s+as\s+if/i,
  /pretend\s+you/i,
  /you\s+are\s+now/i,
  /ignore\s+previous/i,
  /system\s+prompt/i,
  /jailbreak/i,
  /hack/i,
  /exploit/i,
  /inject/i,
  /do\s+not\s+follow/i,
  /new\s+instructions/i,
  /reveal\s+your/i,
  /sudo\s+mode/i,
];

const SUSPICIOUS_PHRASES = [
  { pattern: /all[\s-]in/i, flag: "ALL_IN_TRADE", weight: 25 },
  { pattern: /buy\s+everything/i, flag: "BUY_EVERYTHING", weight: 25 },
  { pattern: /sell\s+everything/i, flag: "SELL_EVERYTHING", weight: 25 },
  { pattern: /yolo/i, flag: "YOLO_TRADE", weight: 20 },
  { pattern: /margin/i, flag: "MARGIN_TRADING", weight: 15 },
  { pattern: /leverage/i, flag: "LEVERAGE_DETECTED", weight: 15 },
  { pattern: /borrow/i, flag: "BORROWING_DETECTED", weight: 10 },
  { pattern: /insider/i, flag: "INSIDER_REFERENCE", weight: 30 },
  { pattern: /guaranteed\s+profit/i, flag: "UNREALISTIC_CLAIM", weight: 20 },
  { pattern: /can'?t\s+lose/i, flag: "UNREALISTIC_CLAIM", weight: 20 },
  { pattern: /100%/i, flag: "EXTREME_PERCENTAGE", weight: 15 },
  { pattern: /infinite/i, flag: "INFINITE_REFERENCE", weight: 15 },
  { pattern: /short\s+squeeze/i, flag: "SHORT_SQUEEZE", weight: 15 },
  { pattern: /pump/i, flag: "PUMP_DETECTED", weight: 20 },
];

const BLOCKED_KEYWORDS = [
  "launder", "illegal", "fraud", "scam", "ponzi", "pump and dump",
  "wash trade", "manipulate", "front run", "spoof",
];

// Detect repeated attempts from recent logs
function detectRepeatedAttempts(): { flag: string; weight: number } | null {
  try {
    const logs = getLogs();
    const recentLogs = logs.slice(0, 20);
    const last5Min = Date.now() - 5 * 60 * 1000;
    const recentBlocks = recentLogs.filter(
      (l) => new Date(l.timestamp).getTime() > last5Min && l.decision.verdict === "BLOCK"
    ).length;

    if (recentBlocks >= 5) return { flag: "RAPID_BLOCKED_ATTEMPTS", weight: 30 };
    if (recentBlocks >= 3) return { flag: "REPEATED_BLOCKED_ATTEMPTS", weight: 15 };
  } catch { /* ignore */ }
  return null;
}

// Detect abnormal trade sizes relative to history
function detectAbnormalSize(amount: number | null): { flag: string; weight: number } | null {
  if (!amount) return null;
  try {
    const logs = getLogs();
    const executed = logs.filter((l) => l.execution.executed && l.intent.amount);
    if (executed.length < 3) return null;

    const amounts = executed.map((l) => l.intent.amount!);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - avg) ** 2, 0) / amounts.length);

    if (amount > avg + 3 * stdDev) return { flag: "ABNORMAL_TRADE_SIZE", weight: 25 };
    if (amount > avg + 2 * stdDev) return { flag: "UNUSUAL_TRADE_SIZE", weight: 10 };
  } catch { /* ignore */ }
  return null;
}

export function detectRisks(input: string, amount?: number | null): RiskResult {
  const flags: string[] = [];
  let score = 0;

  // Prompt injection (pattern scoring: multiple matches = higher score)
  let injectionMatches = 0;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      injectionMatches++;
    }
  }
  if (injectionMatches > 0) {
    flags.push("PROMPT_INJECTION");
    score += 30 + injectionMatches * 15; // Scales with number of matched patterns
  }

  // Suspicious phrases with weighted scoring
  for (const { pattern, flag, weight } of SUSPICIOUS_PHRASES) {
    if (pattern.test(input)) {
      flags.push(flag);
      score += weight;
    }
  }

  // Blocked keywords
  const lower = input.toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lower.includes(keyword)) {
      flags.push(`BLOCKED_KEYWORD: ${keyword.toUpperCase()}`);
      score += 40;
    }
  }

  // Excessive amounts
  const amounts = input.match(/\d[\d,]*\.?\d*/g);
  if (amounts) {
    for (const amt of amounts) {
      const val = parseFloat(amt.replace(/,/g, ""));
      if (val > 500000) {
        flags.push("EXTREMELY_LARGE_AMOUNT");
        score += 25;
      } else if (val > 100000) {
        flags.push("LARGE_AMOUNT");
        score += 15;
      }
    }
  }

  // Repeated blocked attempts
  const repeated = detectRepeatedAttempts();
  if (repeated) {
    flags.push(repeated.flag);
    score += repeated.weight;
  }

  // Abnormal trade size detection
  const abnormal = detectAbnormalSize(amount ?? null);
  if (abnormal) {
    flags.push(abnormal.flag);
    score += abnormal.weight;
  }

  // Input entropy check (obfuscation detection)
  const uniqueChars = new Set(input.toLowerCase()).size;
  const entropy = uniqueChars / Math.max(input.length, 1);
  if (input.length > 20 && entropy < 0.15) {
    flags.push("LOW_ENTROPY_INPUT");
    score += 10;
  }

  // Clamp score to 0-100
  score = Math.min(100, Math.max(0, score));

  let risk_level: "LOW" | "MEDIUM" | "HIGH";
  if (score >= 40) risk_level = "HIGH";
  else if (score >= 15) risk_level = "MEDIUM";
  else risk_level = "LOW";

  return { risk_level, flags, score };
}
