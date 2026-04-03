import { Intent, DecisionResult, ExecutionResult } from "./types";
import { getMode } from "./config";
import { placeOrder, getQuote } from "./alpaca";
import { saveTradeRecord, updateSimPortfolio } from "./portfolio";

let tradeCounter = 0;

export async function executeTrade(intent: Intent, decision: DecisionResult): Promise<ExecutionResult> {
  const timestamp = new Date().toISOString();

  if (decision.verdict === "BLOCK") {
    return {
      executed: false,
      status: "BLOCKED",
      trade_id: null,
      timestamp,
      details: `Trade blocked: ${decision.reasons[0]}`,
    };
  }

  if (!intent.action || !intent.ticker) {
    return {
      executed: false,
      status: "INVALID",
      trade_id: null,
      timestamp,
      details: "Cannot execute: missing action or ticker",
    };
  }

  const mode = getMode();

  if (mode === "LIVE") {
    try {
      if (!intent.amount || intent.amount <= 0) {
        return {
          executed: false,
          status: "INVALID",
          trade_id: null,
          timestamp,
          details: "Cannot execute: invalid amount",
        };
      }

      const order = await placeOrder(intent.ticker, intent.action, intent.amount);

      saveTradeRecord({
        id: order.order_id,
        ticker: intent.ticker,
        side: intent.action,
        qty: order.qty,
        price: order.price,
        amount: intent.amount,
        orderId: order.order_id,
        timestamp,
        mode: "LIVE",
      });

      return {
        executed: true,
        status: decision.verdict === "WARN" ? "EXECUTED_WITH_WARNING" : "EXECUTED",
        trade_id: order.order_id,
        timestamp,
        details: `Alpaca paper trade: ${intent.action} ${order.qty} shares of ${intent.ticker} @ $${order.price.toFixed(2)} (Order: ${order.order_id})`,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      return {
        executed: false,
        status: "API_ERROR",
        trade_id: null,
        timestamp,
        details: `Alpaca API error: ${msg}`,
      };
    }
  }

  // SIMULATION mode
  tradeCounter++;
  const trade_id = `SIM-${Date.now()}-${tradeCounter.toString().padStart(4, "0")}`;
  const simPrice = intent.amount && intent.amount > 0 ? 150 : 0; // Simulated price
  const qty = intent.amount && simPrice > 0 ? Math.floor(intent.amount / simPrice) : 0;

  if (qty > 0 && intent.ticker) {
    updateSimPortfolio(intent.ticker, intent.action, qty, simPrice);
    saveTradeRecord({
      id: trade_id,
      ticker: intent.ticker,
      side: intent.action,
      qty,
      price: simPrice,
      amount: intent.amount || 0,
      orderId: trade_id,
      timestamp,
      mode: "SIMULATION",
    });
  }

  return {
    executed: true,
    status: decision.verdict === "WARN" ? "EXECUTED_WITH_WARNING" : "EXECUTED",
    trade_id,
    timestamp,
    details: `Simulated ${intent.action} ${qty} shares of ${intent.ticker} @ $${simPrice.toFixed(2)} for $${intent.amount?.toLocaleString() ?? "N/A"} (paper trade)`,
  };
}
