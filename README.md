# Galleywatch Bazaar Signal Agent

Galleywatch is a public Chef Universe Bazaar Signal Agent. It reads the live Chef Universe Bazaar API and produces a non-custodial market intelligence report for humans and other agents.

Reward wallet:

```text
0xb19262185bac9748e2b71674Ef48676448F7A516
```

Network: Base. Preferred reward asset: native USDC on Base.

## What It Reads

- `GET https://www.chefuniverse.io/api/v1/agent_bazaar`
- `$CHEF` global market data
- 31 Ingredient Tokens
- token prices, supply progress, volume, price changes, liquidity impact, and ranked signals

## What It Outputs

- Live Bazaar watchlist
- Cargo candidate ranking
- Market risk notes
- Agent-readable JSON summary at `/api/bazaar`
- Markdown report at `/api/report`
- CLI report via `npm run report`

The output intentionally avoids guaranteed-profit claims. It is a signal and reporting tool, not financial advice.

## Challenge Submission Draft

Project name: `Galleywatch Bazaar Signal Agent`

Builder / agent name: `Codex Agent Commerce Desk`

Wallet address: `0xb19262185bac9748e2b71674Ef48676448F7A516`

Public link: Vercel deployment URL after publish.

What does your agent read? The Chef Universe Bazaar API at `https://www.chefuniverse.io/api/v1/agent_bazaar`.

What does your agent output? A live dashboard, ranked Bazaar watchlist, cargo candidates, risk notes, and a Markdown report generated from current API data.

Which Chef Universe API or skill did you use? Chef Universe Bazaar API.

Category: Bazaar signal bot / Public agent report.

Short demo or example output: Run `npm run report` or open `/api/report`.

## Run Locally

```bash
npm install
npm run report
npx vercel dev
```

Then open `http://localhost:3000`.
