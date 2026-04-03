import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAnalytics, AnalyticsData } from "@/lib/sentinel/analytics";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const PIE_COLORS = ["hsl(142, 72%, 50%)", "hsl(45, 100%, 55%)", "hsl(0, 72%, 55%)"];

export function AnalyticsDashboard({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => { setData(computeAnalytics()); }, [refreshKey]);

  if (!data) return null;

  const pieData = [
    { name: "Allow", value: data.allowCount },
    { name: "Warn", value: data.warnCount },
    { name: "Block", value: data.blockCount },
  ].filter(d => d.value > 0);

  const riskPie = [
    { name: "LOW", value: data.riskDistribution.LOW },
    { name: "MEDIUM", value: data.riskDistribution.MEDIUM },
    { name: "HIGH", value: data.riskDistribution.HIGH },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Trades", value: data.totalTrades, icon: BarChart3, color: "text-accent" },
          { label: "Executed", value: data.executedTrades, icon: TrendingUp, color: "text-success" },
          { label: "Blocked", value: data.blockCount, icon: Shield, color: "text-destructive" },
          { label: "High Risk", value: data.riskDistribution.HIGH, icon: AlertTriangle, color: "text-warning" },
        ].map((m) => (
          <Card key={m.label} className="border-border/50 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className={`h-4 w-4 ${m.color}`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</span>
              </div>
              <p className="text-3xl font-display font-bold text-foreground">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-sm font-display">Decision Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-16 font-mono text-sm">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-sm font-display">Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {riskPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={riskPie}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {riskPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-16 font-mono text-sm">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top flags */}
      {data.topFlags.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-sm font-display">Top Risk Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topFlags.map((f) => (
                <div key={f.flag} className="flex items-center justify-between py-1.5">
                  <span className="font-mono text-sm text-foreground">{f.flag}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-destructive/30" style={{ width: `${Math.min(f.count * 20, 200)}px` }}>
                      <div className="h-full rounded-full bg-destructive" style={{ width: `${(f.count / (data.topFlags[0]?.count || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">{f.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
