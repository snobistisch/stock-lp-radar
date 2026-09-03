# Data and maintenance

## Current mode

The app uses `DATA_SOURCE=static` by default. The normalized snapshot lives in `lib/data/static.ts` and was measured at **2026-09-03T17:04:28Z**. `generatedAt` changes after a refresh; `measuredAt` does not. This distinction prevents historical market data from being presented as live data.

The market summary was calculated from the 100 RWA pool rows shown by Revert under the Robinhood filter:

| Universe | Pools | TVL | 24h volume |
|---|---:|---:|---:|
| All displayed RWA pools | 100 | $45,785,799 | $337,491,251 |
| Stock Token/USDG or Stock Token/WETH | 84 | $40,102,862 | $312,530,975 |

The opportunity table is a curated shortlist, not the full set of 84 candidates.

## Sources

- [StonksOnChain](https://stonksonchain.lol/) — meme-pair count and popularity volume
- [Rialto Assets](https://analytics.rialto.xyz/assets) — asset verification and tokenized value
- [Revert Finance](https://revert.finance/) — pool TVL, active TVL, volume, fees and gross fee APR
- [Robinhood Stock Token docs](https://docs.robinhood.com/chain/stock-tokens/) — legal and technical context
- [Robinhood contracts](https://docs.robinhood.com/chain/contracts/) — canonical contract addresses
- [Revert security](https://docs.revert.finance/revert/resources/security) — audits and risk context
- [Uniswap IL](https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss) — impermanent loss

## Canonical chain data

- Robinhood Chain ID: `4663`
- WETH: `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73`
- USDG: `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`

Recheck these addresses against the official contract documentation before every release.

## Migrating to live data

Implement a new `DashboardDataProvider` in `lib/data`, for example `live.ts`, and let `lib/data/index.ts` select the provider based on `DATA_SOURCE`. Normalize every upstream field into `DashboardData`; UI components should never depend on source-specific response formats.

Recommended pipeline:

1. Fetch the StonksOnChain ranking and Rialto assets.
2. Fetch Revert pools for `network=Robinhood` and `RWA=true`.
3. Verify token addresses against Rialto and Robinhood; symbol matching is insufficient.
4. Keep only pools using the canonical USDG or WETH address.
5. Calculate 1d, 7d and 30d gross fee APR from fees and active TVL.
6. Run validation and anomaly detection.
7. Write a dated, immutable snapshot; never serve a partially completed ingest.

## Validation rules

- Reject non-finite, negative or absurdly large values.
- Flag volume/TVL ratios above a configurable threshold for review.
- Require `fees ≈ volume × feeTier`; large deviations block publication.
- Use active TVL as the APR denominator and flag records where only total TVL is available.
- Label pools younger than 30 days as `partial-history`.
- Cap APR input in the opportunity score while retaining the raw value for display.
- Store source URL, contract address, chain ID and extraction time.

An observed PACK/THROBBIN row with approximately `$1.50 × 10^41` in volume but only `$6,188` in fees was deliberately excluded. It demonstrates why numerical fields are not publishable without cross-validation.

## APR and IL

Revert fee APR is **gross** and excludes divergence loss. The IL column contains manual 30-day scenario bands based on each pair's volatility class. A live simulator should include historical or implied volatility, the selected price range, hedging, rebalance frequency and gas.

Snapshot planning ranges:

- established Stock/USDG pools: approximately 40–180% gross and 20–120% net in favorable regimes;
- Stock/WETH: higher fee potential with substantially higher relative volatility;
- pure memecoin LP: observed gross fee APR around 650–3,850%, with potential total loss.

These are not guarantees. Yield can disappear within hours when volume, price or active liquidity changes.

## Refresh and caching

The GitHub Pages version is fully static. The refresh button confirms a new client session and updates `generatedAt` only; `measuredAt` deliberately remains unchanged. A historical research snapshot is therefore never presented as a new market measurement.

For live production, run ingestion asynchronously and generate a validated JSON file during the Pages build, or serve the latest snapshot through a CORS-enabled API or object store. Do not call three fragile scrapers synchronously from the browser.

## Maintenance checklist

- Daily: verify the contract allowlist, pool status and data validation.
- Every ingest: run schema and anomaly checks.
- Weekly: recalibrate risk scores and IL assumptions.
- Monthly: review upstream terms, audits and chain governance.
