import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, ArrowRight, Tag, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PipelineResult } from "@/lib/sentinel/types";

const VERDICT_CONFIG = {
  ALLOW: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10", border: "border-success/30", glow: "glow-green", label: "ALLOWED" },
  WARN: { icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", glow: "glow-yellow", label: "WARNING" },
  BLOCK: { icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", glow: "glow-red", label: "BLOCKED" },
};

const RISK_COLORS = {
  LOW: "bg-success/20 text-success border-success/30",
  MEDIUM: "bg-warning/20 text-warning border-warning/30",
  HIGH: "bg-destructive/20 text-destructive border-destructive/30",
};

export function DecisionCard({ result }: { result: PipelineResult }) {
  const config = VERDICT_CONFIG[result.decision.verdict];
  const Icon = config.icon;

  return (
    <Card className={`border ${config.border} ${config.bg} ${config.glow}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Icon className={`h-8 w-8 ${config.color}`} />
            </motion.div>
            <div>
              <CardTitle className={`text-xl font-display ${config.color}`}>{config.label}</CardTitle>
              <p className="text-sm text-muted-foreground font-mono">{result.execution.status}</p>
            </div>
          </div>
          <Badge variant="outline" className={RISK_COLORS[result.risk.risk_level]}>
            {result.risk.risk_level} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Intent parsed */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Action</span>
            </div>
            <p className="font-mono text-sm text-foreground">{result.intent.action?.toUpperCase() ?? "—"}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Ticker</span>
            </div>
            <p className="font-mono text-sm text-foreground">{result.intent.ticker ?? "—"}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Amount</span>
            </div>
            <p className="font-mono text-sm text-foreground">
              {result.intent.amount ? `$${result.intent.amount.toLocaleString()}` : "—"}
            </p>
          </div>
        </div>

        {/* Reasons */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Decision Reasons</span>
          </div>
          <div className="space-y-1">
            {result.decision.reasons.map((r, i) => (
              <p key={i} className="text-sm font-mono text-secondary-foreground pl-2 border-l-2 border-border">
                {r}
              </p>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {result.alerts.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">⚠ Alerts</p>
            {result.alerts.map((a, i) => (
              <p key={i} className={`text-xs font-mono ${a.severity === "critical" ? "text-destructive" : "text-warning"}`}>
                [{a.type}] {a.message}
              </p>
            ))}
          </div>
        )}

        {result.execution.trade_id && (
          <p className="text-xs text-muted-foreground font-mono">Trade ID: {result.execution.trade_id}</p>
        )}
      </CardContent>
    </Card>
  );
}
