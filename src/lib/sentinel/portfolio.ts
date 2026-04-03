import { getAccount, getPositions } from "./alpaca";

export interface PortfolioSummary {
  cash: number;
  portfolioValue: number;
  equity: number;
  buyingPower: number;
  dailyPL: number;
  positions: PositionInfo[];
  lastUpdated: string;
}

export interface PositionInfo {
  ticker: string;
  qty: number;
  marketValue: number;
  unrealizedPL: number;
  currentPrice: number;
  avgEntryPrice: number;
}

// Local trade history (supplements Alpaca data)
const HISTORY_KEY = "sentinel_trade_history";

export interface TradeRecord {
  id: string;
  ticker: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  amount: number;
  orderId: string;
  timestamp: string;
  mode: "LIVE" | "SIMULATION";
}

export function saveTradeRecord(record: TradeRecord): void {
  const records = getTradeHistory();
  records.unshift(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, 500)));
}

export function getTradeHistory(): TradeRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const [account, positions] = await Promise.all([getAccount(), getPositions()]);

  const equity = parseFloat(account.equity) || 0;
  const lastEquity = parseFloat(account.last_equity) || 0;

  return {
    cash: parseFloat(account.cash) || 0,
    portfolioValue: parseFloat(account.portfolio_value) || 0,
    equity,
    buyingPower: parseFloat(account.buying_power) || 0,
    dailyPL: equity - lastEquity,
    positions: positions.map((p) => ({
      ticker: p.symbol,
      qty: parseFloat(p.qty),
      marketValue: parseFloat(p.market_value),
      unrealizedPL: parseFloat(p.unrealized_pl),
      currentPrice: parseFloat(p.current_price),
      avgEntryPrice: parseFloat(p.avg_entry_price),
    })),
    lastUpdated: new Date().toISOString(),
  };
}

// Simulation portfolio for SIMULATION mode
const SIM_PORTFOLIO_KEY = "sentinel_sim_portfolio";

interface SimPortfolio {
  cash: number;
  holdings: Record<string, { qty: number; avgPrice: number }>;
}

function getSimPortfolio(): SimPortfolio {
  try {
    const raw = localStorage.getItem(SIM_PORTFOLIO_KEY);
    return raw ? JSON.parse(raw) : { cash: 100000, holdings: {} };
  } catch {
    return { cash: 100000, holdings: {} };
  }
}

function saveSimPortfolio(p: SimPortfolio): void {
  localStorage.setItem(SIM_PORTFOLIO_KEY, JSON.stringify(p));
}

export function updateSimPortfolio(ticker: string, side: "buy" | "sell", qty: number, price: number): void {
  const p = getSimPortfolio();
  const cost = qty * price;

  if (side === "buy") {
    if (cost > p.cash) return;
    p.cash -= cost;
    const h = p.holdings[ticker] || { qty: 0, avgPrice: 0 };
    const totalQty = h.qty + qty;
    h.avgPrice = totalQty > 0 ? (h.avgPrice * h.qty + cost) / totalQty : price;
    h.qty = totalQty;
    p.holdings[ticker] = h;
  } else {
    const h = p.holdings[ticker];
    if (!h || h.qty < qty) return;
    p.cash += cost;
    h.qty -= qty;
    if (h.qty <= 0) delete p.holdings[ticker];
  }

  saveSimPortfolio(p);
}

export function getSimPortfolioSummary(): PortfolioSummary {
  const p = getSimPortfolio();
  const positions: PositionInfo[] = Object.entries(p.holdings).map(([ticker, h]) => ({
    ticker,
    qty: h.qty,
    marketValue: h.qty * h.avgPrice,
    unrealizedPL: 0,
    currentPrice: h.avgPrice,
    avgEntryPrice: h.avgPrice,
  }));

  const holdingsValue = positions.reduce((s, pos) => s + pos.marketValue, 0);

  return {
    cash: p.cash,
    portfolioValue: p.cash + holdingsValue,
    equity: p.cash + holdingsValue,
    buyingPower: p.cash,
    dailyPL: 0,
    positions,
    lastUpdated: new Date().toISOString(),
  };
}
