import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert as AlertType } from "@/lib/sentinel/types";
import { getLogs } from "@/lib/sentinel/logger";
import { toast } from "sonner";

export function AlertsPanel({ refreshKey }: { refreshKey: number }) {
  const prevCount = useRef(0);

  // Gather all alerts from recent logs
  const logs = getLogs();
  const allAlerts: (AlertType & { input?: string })[] = [];
  for (const log of logs.slice(0, 50)) {
    for (const alert of log.alerts) {
      allAlerts.push({ ...alert, input: log.input });
    }
  }

  // Toast new alerts
  useEffect(() => {
    if (allAlerts.length > prevCount.current) {
      const newAlerts = allAlerts.slice(0, allAlerts.length - prevCount.current);
      for (const alert of newAlerts.slice(0, 3)) {
        if (alert.severity === "critical") {
          toast.error(alert.message, { duration: 5000 });
        } else {
          toast.warning(alert.message, { duration: 4000 });
        }
      }
    }
    prevCount.current = allAlerts.length;
  }, [allAlerts.length]);

  const severityIcon = {
    critical: <ShieldAlert className="h-4 w-4 text-destructive" />,
    warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-display font-semibold text-foreground">Alerts</h2>
        {allAlerts.length > 0 && (
          <Badge variant="destructive" className="text-xs font-mono">{allAlerts.length}</Badge>
        )}
      </div>

      {allAlerts.length === 0 ? (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            No alerts yet. Alerts will appear here when high-risk trades or repeated blocks are detected.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {allAlerts.slice(0, 30).map((alert, i) => (
              <motion.div
                key={`${alert.timestamp}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`border-border/50 ${alert.severity === "critical" ? "border-l-2 border-l-destructive" : "border-l-2 border-l-warning"}`}>
                  <CardContent className="p-3 flex items-start gap-3">
                    {severityIcon[alert.severity]}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={alert.severity === "critical" ? "destructive" : "outline"} className="text-xs font-mono">
                          {alert.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
