import { useState, useEffect } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLogs, clearLogs } from "@/lib/sentinel/logger";
import { LogEntry } from "@/lib/sentinel/types";
import { toast } from "sonner";

const VERDICT_STYLE = {
  ALLOW: "bg-success/20 text-success border-success/30",
  WARN: "bg-warning/20 text-warning border-warning/30",
  BLOCK: "bg-destructive/20 text-destructive border-destructive/30",
};

export function AuditLogs({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => { setLogs(getLogs()); }, [refreshKey]);

  const handleClear = () => {
    clearLogs();
    setLogs([]);
    toast.info("Logs cleared");
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-accent" />
            <CardTitle className="font-display">Audit Logs</CardTitle>
            <span className="text-sm text-muted-foreground">({logs.length} entries)</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 font-mono text-sm">No logs yet. Run a trade to see results.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-2">Time</th>
                  <th className="text-left py-3 px-2">Input</th>
                  <th className="text-left py-3 px-2">Intent</th>
                  <th className="text-left py-3 px-2">Risk</th>
                  <th className="text-left py-3 px-2">Verdict</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-2.5 px-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-2 font-mono text-xs max-w-[200px] truncate">{log.input}</td>
                    <td className="py-2.5 px-2 font-mono text-xs">
                      {log.intent.action?.toUpperCase()} {log.intent.ticker} {log.intent.amount ? `$${log.intent.amount}` : ""}
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge variant="outline" className={`text-xs ${VERDICT_STYLE[log.risk.risk_level === "LOW" ? "ALLOW" : log.risk.risk_level === "MEDIUM" ? "WARN" : "BLOCK"]}`}>
                        {log.risk.risk_level}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge variant="outline" className={`text-xs ${VERDICT_STYLE[log.decision.verdict]}`}>
                        {log.decision.verdict}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-xs text-muted-foreground">
                      {log.execution.executed ? "✓ Executed" : "✗ Not executed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
