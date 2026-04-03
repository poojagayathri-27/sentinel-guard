import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PipelineResult } from "@/lib/sentinel/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  { key: "input", label: "Input" },
  { key: "intent", label: "Intent" },
  { key: "risk", label: "Risk" },
  { key: "policy", label: "Policy" },
  { key: "decision", label: "Decision" },
  { key: "execution", label: "Execution" },
] as const;

function getStageStatus(result: PipelineResult, stage: string) {
  switch (stage) {
    case "input": return { status: "pass" as const, detail: result.input.slice(0, 40) };
    case "intent": return {
      status: result.intent.parsed ? "pass" as const : "warn" as const,
      detail: result.intent.parsed ? `${result.intent.action} ${result.intent.ticker} $${result.intent.amount?.toLocaleString()}` : "Could not parse",
    };
    case "risk": return {
      status: result.risk.risk_level === "LOW" ? "pass" as const : result.risk.risk_level === "MEDIUM" ? "warn" as const : "fail" as const,
      detail: `${result.risk.risk_level} (score: ${result.risk.score})`,
    };
    case "policy": return {
      status: result.policy.compliant ? "pass" as const : "fail" as const,
      detail: result.policy.compliant ? "Compliant" : result.policy.violations[0],
    };
    case "decision": return {
      status: result.decision.verdict === "ALLOW" ? "pass" as const : result.decision.verdict === "WARN" ? "warn" as const : "fail" as const,
      detail: result.decision.verdict,
    };
    case "execution": return {
      status: result.execution.executed ? "pass" as const : "fail" as const,
      detail: result.execution.status,
    };
    default: return { status: "pass" as const, detail: "" };
  }
}

const statusIcon = {
  pass: <CheckCircle className="h-4 w-4 text-success" />,
  warn: <AlertTriangle className="h-4 w-4 text-warning" />,
  fail: <XCircle className="h-4 w-4 text-destructive" />,
};

const statusBg = {
  pass: "border-success/30 bg-success/5",
  warn: "border-warning/30 bg-warning/5",
  fail: "border-destructive/30 bg-destructive/5",
};

export function PipelineTimeline({ result }: { result: PipelineResult }) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display">Pipeline Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {STAGES.map((stage, i) => {
            const { status, detail } = getStageStatus(result, stage.key);
            return (
              <div key={stage.key} className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusBg[status]}`}
                >
                  {statusIcon[status]}
                  <div>
                    <p className="text-xs font-mono font-bold text-foreground">{stage.label}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">{detail}</p>
                  </div>
                </motion.div>
                {i < STAGES.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
