# Galleywatch Bazaar Signal Agent

Galleywatch is a public Chef Universe Bazaar Signal Agent. It reads the live Chef Universe Bazaar API and produces a non-custodial market intelligence report for humans and other agents.

Reward wallet and contact details are intentionally omitted from the public
repo. They should be provided only through the official submission path during
the June 1-15 review window.

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

## Replay Bundle

The challenge soft-launch reviewer asked for a replayable source snapshot and
clear evidence labels. This repo now writes a public replay bundle:

```bash
npm install
npm run report:write
npm run report:replay
```

Replay artifacts:

- `replay/latest/raw-snapshot.json`: pinned Chef Universe API response
- `replay/latest/analysis.json`: generated agent analysis
- `replay/latest/report.md`: generated Markdown report
- `replay/latest/manifest.json`: source URL, source timestamp, block number,
  Node version, exact commands, and SHA-256 hashes for the raw snapshot,
  analysis JSON, and report output

The pinned replay command reads `replay/latest/raw-snapshot.json`, so reviewers
can reproduce the scoring and report from the saved source data even if the live
Bazaar API has moved on.

## Scoring And Evidence Rules

Observed fields are read directly from
`https://www.chefuniverse.io/api/v1/agent_bazaar`: snapshot timestamp, block
number, ticker, address, grade, price, supply progress, 24h volume, 24h/12h
price changes, buyer concentration, liquidity impact, and named signals.

Inferred fields are the agent outputs: market posture, watch score, cargo score,
risk notes, and ranked lists.

Not checked: private/community signals, wallet balances or holdings, liquidity
outside the public Bazaar API, future price/profit, Discord/Telegram/X
sentiment, real swaps, transfers, or order execution.

Watch score is named signal score times `100`, plus average 24h/12h momentum
clamped to `[-30, 30]`, plus a log 24h-volume score clamped to `[0, 55]`, plus
supply progress clamped to `[0, 22]`, minus `8` when top buyer concentration is
above `85%`.

Cargo score is grade/price value density clamped to `[0, 45]`, plus liquidity
score clamped to `[0, 50]`, plus a supply-window bonus. Missing observed fields
are retained as `null` in summaries, scoring uses neutral fallbacks only for
calculation, and sparse rows are flagged in risk notes.

## Challenge Submission Draft

Project name: `Galleywatch Bazaar Signal Agent`

Builder / agent name: provide through the official submission form.

Wallet address: provide through the official submission form only.

Public link: `https://2026-05-23chef-bazaar-signal-agent.vercel.app/`

What does your agent read? The Chef Universe Bazaar API at `https://www.chefuniverse.io/api/v1/agent_bazaar`.

What does your agent output? A live dashboard, ranked Bazaar watchlist, cargo candidates, risk notes, and a Markdown report generated from current API data.

Which Chef Universe API or skill did you use? Chef Universe Bazaar API.

Category: Bazaar signal bot / Public agent report.

Short demo or example output: Run `npm run report`, `npm run report:replay`,
or open `/api/report`.

Soft-launch proof comment:

```text
https://github.com/awrsla/agent-bazaar-challenge/issues/4#issuecomment-4524137790
```

## Run Locally

```bash
npm install
npm run report
npm run report:write
npm run report:replay
npx vercel dev
```

Then open `http://localhost:3000`.
