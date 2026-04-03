# 🛡️ SENTINEL – AI Financial Enforcement System

## 🚀 Overview

Sentinel is an AI-powered financial enforcement system that converts natural language trading commands into secure, policy-compliant trade executions. It ensures every trade passes through risk analysis and rule validation before execution using Alpaca paper trading.

---

## 🔥 Features

* 🧠 Natural Language Trade Input (e.g., "Buy TSLA for 100")
* ⚖️ Risk Detection (LOW / MEDIUM / HIGH)
* 🛡️ Policy Enforcement (blocks invalid trades)
* 📊 Live Execution via Alpaca API
* 🧪 Simulation Mode for testing
* 🧾 Trade Logging & Audit System

## dasboard 
![Dashboard](assets/dashboard.png)

---

## ⚙️ How It Works

1. User enters trade command
2. Intent parser extracts action, ticker, amount
3. Risk engine evaluates trade
4. Policy engine validates rules
5. Decision engine: ALLOW / WARN / BLOCK
6. Trade executes via Alpaca

## output
![Allowed](assets/allowed.png)
![Blocked](assets/blocked.png)
![Analytics](assets/analytics.png)
---

## 🏗️ Tech Stack

* React + TypeScript + Tailwind CSS
* Supabase Edge Functions
* Alpaca Paper Trading API

---

## 📦 Setup Instructions

```bash
git clone https://github.com/YOUR_USERNAME/sentinel-guard.git
cd sentinel-guard
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create `.env` file:

```env
VITE_ALPACA_KEY=your_key
VITE_ALPACA_SECRET=your_secret
VITE_ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

⚠️ Do NOT upload `.env` to GitHub

---

## 🎯 Example Commands

* Buy TSLA for 100
* Sell AAPL 5 shares
* Buy NVDA for 5000

---

## 🌐 Live Demo

👉 https://sentinel-claw-shield.lovable.app/

---

## 👩‍💻 Author

Pooja Gayathri
Hari Mithra
Nikshitha Sri

---

## ⚠️ Disclaimer

This project uses Alpaca paper trading (no real money involved).
