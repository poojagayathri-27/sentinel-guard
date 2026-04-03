import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Terminal, Skull, Settings, FileText, BarChart3, Wallet, Bell, ToggleLeft, ToggleRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TradeTerminal } from "@/components/sentinel/TradeTerminal";
import { AttackSimulator } from "@/components/sentinel/AttackSimulator";
import { PolicyEditor } from "@/components/sentinel/PolicyEditor";
import { AuditLogs } from "@/components/sentinel/AuditLogs";
import { AnalyticsDashboard } from "@/components/sentinel/AnalyticsDashboard";
import { PortfolioDashboard } from "@/components/sentinel/PortfolioDashboard";
import { AlertsPanel } from "@/components/sentinel/AlertsPanel";
import { getMode, setMode } from "@/lib/sentinel/config";
import type { ExecutionMode } from "@/lib/sentinel/config";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentMode, setCurrentMode] = useState<ExecutionMode>(getMode());
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const toggleMode = () => {
    const newMode = currentMode === "SIMULATION" ? "LIVE" : "SIMULATION";
    setMode(newMode);
    setCurrentMode(newMode);
  };

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      <div className="absolute inset-0 scanline pointer-events-none" />
      <div className="relative z-10">
        <header className="border-b border-border/50 backdrop-blur bg-background/80 sticky top-0 z-20">
          <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Shield className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gradient-sentinel">SENTINEL</h1>
                <p className="text-xs text-muted-foreground font-mono tracking-wider">AI FINANCIAL ENFORCEMENT SYSTEM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {currentMode === "SIMULATION" ? (
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ToggleRight className="h-4 w-4 text-primary" />
                )}
                <span className="text-xs font-mono">{currentMode}</span>
                <Badge variant={currentMode === "LIVE" ? "default" : "outline"} className="text-xs">
                  {currentMode === "LIVE" ? "ALPACA" : "PAPER"}
                </Badge>
              </button>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">SYSTEM ACTIVE</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container max-w-7xl mx-auto px-4 py-6">
          <Tabs defaultValue="terminal" className="space-y-6">
            <TabsList className="bg-secondary/50 border border-border/50 p-1 h-auto flex-wrap">
              {[
                { value: "terminal", icon: Terminal, label: "Trade Terminal" },
                { value: "portfolio", icon: Wallet, label: "Portfolio" },
                { value: "attack", icon: Skull, label: "Attack Simulator" },
                { value: "alerts", icon: Bell, label: "Alerts" },
                { value: "policy", icon: Settings, label: "Policy Editor" },
                { value: "logs", icon: FileText, label: "Audit Logs" },
                { value: "analytics", icon: BarChart3, label: "Analytics" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2 font-display text-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="terminal">
              <TradeTerminal onResult={refresh} />
            </TabsContent>
            <TabsContent value="portfolio">
              <PortfolioDashboard refreshKey={refreshKey} />
            </TabsContent>
            <TabsContent value="attack">
              <AttackSimulator onResult={refresh} />
            </TabsContent>
            <TabsContent value="alerts">
              <AlertsPanel refreshKey={refreshKey} />
            </TabsContent>
            <TabsContent value="policy">
              <PolicyEditor />
            </TabsContent>
            <TabsContent value="logs">
              <AuditLogs refreshKey={refreshKey} />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsDashboard refreshKey={refreshKey} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
