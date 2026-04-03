import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALPACA_BASE = 'https://paper-api.alpaca.markets'

const QuoteSchema = z.object({ action: z.literal('quote'), ticker: z.string().min(1).max(10) })
const OrderSchema = z.object({
  action: z.literal('order'),
  ticker: z.string().min(1).max(10),
  side: z.enum(['buy', 'sell']),
  amount: z.number().positive().max(1_000_000),
})
const PositionsSchema = z.object({ action: z.literal('positions') })
const AccountSchema = z.object({ action: z.literal('account') })

const RequestSchema = z.discriminatedUnion('action', [QuoteSchema, OrderSchema, PositionsSchema, AccountSchema])

function getAlpacaHeaders() {
  const key = Deno.env.get('ALPACA_API_KEY')
  const secret = Deno.env.get('ALPACA_API_SECRET')
  if (!key || !secret) throw new Error('Alpaca API credentials not configured')
  return {
    'APCA-API-KEY-ID': key,
    'APCA-API-SECRET-KEY': secret,
    'Content-Type': 'application/json',
  }
}

async function getQuote(ticker: string) {
  const res = await fetch(`${ALPACA_BASE}/v2/stocks/${ticker}/quotes/latest`, {
    headers: getAlpacaHeaders(),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Quote failed [${res.status}]: ${body}`)
  }
  const data = await res.json()
  return { price: data.quote?.ap || data.quote?.bp || 0, raw: data }
}

async function placeOrder(ticker: string, side: string, amount: number) {
  // Get current price first
  const quote = await getQuote(ticker)
  if (!quote.price || quote.price <= 0) throw new Error(`Could not get valid price for ${ticker}`)

  const qty = Math.floor(amount / quote.price)
  if (qty <= 0) throw new Error(`Amount $${amount} too small for ${ticker} at $${quote.price.toFixed(2)}`)

  const res = await fetch(`${ALPACA_BASE}/v2/orders`, {
    method: 'POST',
    headers: getAlpacaHeaders(),
    body: JSON.stringify({
      symbol: ticker,
      qty: qty.toString(),
      side,
      type: 'market',
      time_in_force: 'day',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Order failed [${res.status}]: ${body}`)
  }

  const order = await res.json()
  return { order_id: order.id, status: order.status, qty, price: quote.price, order }
}

async function getPositions() {
  const res = await fetch(`${ALPACA_BASE}/v2/positions`, { headers: getAlpacaHeaders() })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Positions failed [${res.status}]: ${body}`)
  }
  return await res.json()
}

async function getAccount() {
  const res = await fetch(`${ALPACA_BASE}/v2/account`, { headers: getAlpacaHeaders() })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Account failed [${res.status}]: ${body}`)
  }
  return await res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let result: unknown

    switch (parsed.data.action) {
      case 'quote':
        result = await getQuote(parsed.data.ticker)
        break
      case 'order':
        result = await placeOrder(parsed.data.ticker, parsed.data.side, parsed.data.amount)
        break
      case 'positions':
        result = await getPositions()
        break
      case 'account':
        result = await getAccount()
        break
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Alpaca function error:', message)
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
