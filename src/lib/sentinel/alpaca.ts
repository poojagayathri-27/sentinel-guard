const API_KEY = import.meta.env.VITE_ALPACA_KEY;
const SECRET_KEY = import.meta.env.VITE_ALPACA_SECRET;
const BASE_URL = import.meta.env.VITE_ALPACA_BASE_URL;

async function alpacaFetch(endpoint: string, method = "GET", body?: any) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "APCA-API-KEY-ID": API_KEY!,
      "APCA-API-SECRET-KEY": SECRET_KEY!,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}

// ✅ GET ACCOUNT
export async function getAccount() {
  return alpacaFetch("/v2/account");
}

// ✅ GET POSITIONS
export async function getPositions() {
  return alpacaFetch("/v2/positions");
}

// ✅ GET QUOTE (simplified)
export async function getQuote(ticker: string) {
  const data = await alpacaFetch(`/v2/stocks/${ticker}/quotes/latest`);
  return {
    price: data.quote?.ap || 0,
    raw: data,
  };
}

// ✅ PLACE ORDER
export async function placeOrder(
  ticker: string,
  side: "buy" | "sell",
  amount: number
) {
  return alpacaFetch("/v2/orders", "POST", {
    symbol: ticker,
    notional: amount,
    side,
    type: "market",
    time_in_force: "day",
  });
}