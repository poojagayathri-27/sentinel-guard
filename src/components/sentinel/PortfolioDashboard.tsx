import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, RefreshCw, DollarSign, BarChart3, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMode } from "@/lib/sentinel/config";
import { getPortfolioSummary, getSimPortfolioSummary, getTradeHistory, PortfolioSummary, TradeRecord } from "@/lib/sentinel/portfolio";
import { toast } from "sonner";

export function PortfolioDashboard({ refreshKey }: { refreshKey: number }) {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const mode = getMode();
      if (mode === "LIVE") {
        setPortfolio(await getPortfolioSummary());
      } else {
        setPortfolio(getSimPortfolioSummary());
      }
      setTrades(getTradeHistory());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load portfolio";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, [refreshKey]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p>{error}</p>
          <Button onClick={loadPortfolio}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Portfolio</h2>
        <Badge>{getMode()}</Badge>
      </div>

      {portfolio && (
        <>
          {/* SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{
              label: "Cash",
              value: portfolio.cash
            },{
              label: "Value",
              value: portfolio.portfolioValue
            },{
              label: "Equity",
              value: portfolio.equity
            },{
              label: "P&L",
              value: portfolio.dailyPL
            }].map((s) => (
              <Card key={s.label}>
                <CardContent>
                  <p>{s.label}</p>
                  <p>${s.value.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* POSITIONS */}
          {portfolio.positions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <tbody>
                    {portfolio.positions.map((p) => (
                      <tr key={p.ticker}>
                        <td>{p.ticker}</td>
                        <td>{p.qty}</td>
                        <td>${p.marketValue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>No positions yet</CardContent>
            </Card>
          )}
        </>
      )}

      {/* TRADES */}
      {trades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trades</CardTitle>
          </CardHeader>
          <CardContent>
            {trades.map(t => (
              <div key={t.id}>
                {t.side} {t.ticker} ${t.amount}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  );
}