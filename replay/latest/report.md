# Galleywatch Bazaar Signal Report

Generated: 2026-05-24T02:26:30.170Z
Source: https://www.chefuniverse.io/api/v1/agent_bazaar
Source generated: 2026-05-24T02:26:30.170Z
Block: 46397361
Posture: selective
Raw snapshot SHA-256: 9c094ed9fcfb3557ce5ea6dfd446e7f699cd5fdeff032166cbe7c71bacd5d8f3

## Watchlist
- cfAVOCADO: watch 187.03, VOLUME_SPIKE_24H, MOMENTUM_12H, 23.25% 24h, 4.74M CHEF volume.
- cfCAVIAR: watch 53.63, no named signal, 7.96% 24h, 1.66M CHEF volume.
- cfWHEAT: watch 53.09, no named signal, 0% 24h, 91.07M CHEF volume.
- cfCHEESE: watch 52.88, no named signal, 0% 24h, 13.84M CHEF volume.
- cfTRUFFLE: watch 51.85, no named signal, 5.94% 24h, 233,635.05 CHEF volume.

## Cargo Candidates
- cfMEATMIX: cargo 113, grade 1, price 0.0017 CHEF, supply 11.03%.
- cfFRUITMIX: cargo 113, grade 1, price 0.0011 CHEF, supply 1.95%.
- cfWHEAT: cargo 113, grade 1, price 0.0036 CHEF, supply 27.66%.
- cfBEANMIX: cargo 113, grade 1, price 0.0011 CHEF, supply 1.55%.
- cfSPICEMIX: cargo 113, grade 1, price 0.0011 CHEF, supply 1.6%.

## Replay Evidence
- Public replay bundle: `replay/latest/`.
- Pinned raw snapshot: `replay/latest/raw-snapshot.json`.
- Manifest with raw, analysis, and report hashes: `replay/latest/manifest.json`.
- Live command: `npm run report:write`.
- Pinned replay command: `npm run report:replay`.

## Scoring Thresholds
- Watch score: named signal score * 100 + average 24h/12h momentum clamped [-30,30] + log10(24h CHEF volume + 1) * 7 clamped [0,55] + supply progress * 22 clamped [0,22] - 8 when top buyer concentration is above 85%.
- Cargo score: grade/current_price_chef value density clamped [0,45] + liquidity score clamped [0,50] + supply window bonus: 18 while progress is between 0 and 82%, 6 at or above 82%, otherwise 8.
- Risk notes: Flags sparse observed fields, buyer concentration at or above 90%, 24h price change at or below -8%, 10k CHEF partial-fill routes, and zero/unknown 24h volume.

## Field Provenance
- Observed: Chef Universe Bazaar API URL; snapshot generated_at and block_number; ingredient ticker/address/emoji; grade, current_price_chef, progress; volume_24h_chef, price_change_24h_pct, price_change_12h_pct; top_buyer_concentration_24h_pct; liquidity_impact_10k_chef fields; named signals and signal notes.
- Inferred: watchScore; cargoScore; market posture; risk notes; ranked watchlist and cargo candidates.
- Not checked: private Chef Universe/community signals; wallet balances or holdings; liquidity outside the public Bazaar API; future price or profit; Discord, Telegram, or X sentiment; real swaps, transfers, or order execution.
- Missing/stale handling: Observed missing fields are retained as null in summaries. Scoring helpers use neutral fallbacks only for calculations and sparse rows are flagged in risk notes.
- Snapshot age at analysis time: 0 minutes.

## Risk Notes
- cfCAVIAR: buyer concentration is high.
- cfBEEF: sparse data: missing price_change_24h_pct, price_change_12h_pct; buyer concentration is high.
- cfAVOCADO: 24h vol 6.8× daily season avg; +28.9% in 12h; buyer concentration is high.
- cfDUCK: sparse data: missing price_change_24h_pct, price_change_12h_pct; buyer concentration is high.
- cfLAMB: sparse data: missing price_change_24h_pct, price_change_12h_pct.
- cfGARLIC: sparse data: missing price_change_24h_pct, price_change_12h_pct; buyer concentration is high.

This report is an agent-generated market readout, not financial advice or a guaranteed-profit claim.
