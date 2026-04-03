import { useState, useEffect } from "react";
import { Settings, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPolicy, savePolicy } from "@/lib/sentinel/pipeline";
import { DEFAULT_POLICY } from "@/lib/sentinel/policy";
import { PolicyConfig } from "@/lib/sentinel/types";
import { toast } from "sonner";

export function PolicyEditor() {
  const [policy, setPolicy] = useState<PolicyConfig>(getPolicy());
  const [tickerInput, setTickerInput] = useState("");

  useEffect(() => { setPolicy(getPolicy()); }, []);

  const handleSave = () => {
    savePolicy(policy);
    toast.success("Policy saved successfully");
  };

  const handleReset = () => {
    setPolicy({ ...DEFAULT_POLICY });
    savePolicy({ ...DEFAULT_POLICY });
    toast.info("Policy reset to defaults");
  };

  const addTicker = () => {
    const t = tickerInput.trim().toUpperCase();
    if (t && !policy.allowed_tickers.includes(t)) {
      setPolicy({ ...policy, allowed_tickers: [...policy.allowed_tickers, t] });
      setTickerInput("");
    }
  };

  const removeTicker = (t: string) => {
    setPolicy({ ...policy, allowed_tickers: policy.allowed_tickers.filter((x) => x !== t) });
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-accent" />
            <CardTitle className="font-display">Policy Configuration</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/80">
              <Save className="h-3.5 w-3.5 mr-1" /> Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Max Trade Amount ($)</label>
            <input
              type="number"
              value={policy.max_trade_amount}
              onChange={(e) => setPolicy({ ...policy, max_trade_amount: Number(e.target.value) })}
              className="mt-1 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Min Trade Amount ($)</label>
            <input
              type="number"
              value={policy.min_trade_amount}
              onChange={(e) => setPolicy({ ...policy, min_trade_amount: Number(e.target.value) })}
              className="mt-1 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Max Daily Trades</label>
            <input
              type="number"
              value={policy.max_daily_trades}
              onChange={(e) => setPolicy({ ...policy, max_daily_trades: Number(e.target.value) })}
              className="mt-1 w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Allowed Tickers</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {policy.allowed_tickers.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
                onClick={() => removeTicker(t)}
              >
                {t} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTicker()}
              placeholder="Add ticker..."
              className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button variant="outline" size="sm" onClick={addTicker}>Add</Button>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Allowed Actions</label>
          <div className="flex gap-3 mt-2">
            {(["buy", "sell"] as const).map((action) => (
              <label key={action} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.allowed_actions.includes(action)}
                  onChange={(e) => {
                    const actions = e.target.checked
                      ? [...policy.allowed_actions, action]
                      : policy.allowed_actions.filter((a) => a !== action);
                    setPolicy({ ...policy, allowed_actions: actions });
                  }}
                  className="rounded border-border accent-primary"
                />
                <span className="text-sm text-foreground font-mono uppercase">{action}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
