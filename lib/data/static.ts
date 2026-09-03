import { calculateOpportunityScore } from "@/lib/scoring";
import type { DashboardData, PoolOpportunity, StockPopularity } from "@/lib/types";

const BASE_REVERT_URL = "https://revert.finance/#/pool/robinhood";

const rawPools: Omit<PoolOpportunity, "score" | "revertUrl">[] = [
  {
    id: "0xd4eb21209c4d6093f80b5b84f5c45cc093ea14a3", stock: "NVDA", pair: "USDG", protocol: "Uniswap v3", feeTier: 0.05,
    tvl: 6265675, activeTvl: 4548978, volume24h: 55740272, fees24h: 27877, apr1d: 162.4, apr7d: 123.8, apr30d: 124.03, ageDays: 44.2,
    ilEstimate30d: "1.5–4.0%", risk: "medium", riskReasons: ["Concentrated-liquidity range", "Equity price unavailable outside market hours"],
    opportunityReason: "Deepest USDG pool in the shortlist, backed by a full 30-day fee window.", dataQuality: "verified",
  },
  {
    id: "0xfe2a80bb5618fd14984b92ca6d45bf5ba67443ddb1435e28b2e48df2fc1526cd", stock: "SPY", pair: "USDG", protocol: "Uniswap v4", feeTier: 0.3,
    tvl: 4657638, activeTvl: 4603173, volume24h: 5338553, fees24h: 16150, apr1d: 126.56, apr7d: 169.71, apr30d: 148.9, ageDays: 51.4,
    ilEstimate30d: "0.5–2.5%", risk: "low", riskReasons: ["Concentrated-liquidity range", "Issuer and chain risk"],
    opportunityReason: "Broad index exposure, a high active-TVL ratio and consistent fee generation.", dataQuality: "verified",
  },
  {
    id: "0xc61284332117c3fb23a2a56cceffd07f7af60029", stock: "SPCX", pair: "USDG", protocol: "Uniswap v3", feeTier: 0.05,
    tvl: 1407731, activeTvl: 1348417, volume24h: 23064214, fees24h: 11535, apr1d: 299.08, apr7d: 223.32, apr30d: 223.83, ageDays: 42.2,
    ilEstimate30d: "4–10%+", risk: "high", riskReasons: ["Private-market proxy", "High meme beta"],
    opportunityReason: "Strong demand and fee efficiency, but suitable only for a large risk budget.", dataQuality: "verified",
  },
  {
    id: "0xd60a5d14db690b7afad71f76b108071d7175597d", stock: "QQQ", pair: "USDG", protocol: "Uniswap v3", feeTier: 0.05,
    tvl: 1340972, activeTvl: 1262718, volume24h: 10219223, fees24h: 5111, apr1d: 139.12, apr7d: 385.38, apr30d: 88.93, ageDays: 7.1,
    ilEstimate30d: "0.8–3.0%", risk: "medium", riskReasons: ["Short pool history", "Technology concentration"],
    opportunityReason: "Efficient liquidity use; the 30-day APR is still based on a partial window.", dataQuality: "partial-history",
  },
  {
    id: "0x6ba50150b17ffd0972915aaf04ffd5e8f4fa49b4", stock: "SGOV", pair: "USDG", protocol: "Uniswap v3", feeTier: 0.05,
    tvl: 227999, activeTvl: 227280, volume24h: 1136724, fees24h: 568, apr1d: 91.01, apr7d: 95.65, apr30d: 22.07, ageDays: 1.7,
    ilEstimate30d: "0.1–0.8%", risk: "medium", riskReasons: ["Very short pool history", "Thin exit liquidity"],
    opportunityReason: "Low expected price volatility, but not enough history for conviction yet.", dataQuality: "partial-history",
  },
  {
    id: "0xaae0d815ee56e4092a5e5c2911e676fea50b2d6d", stock: "AAPL", pair: "USDG", protocol: "Uniswap v3", feeTier: 0.05,
    tvl: 373565, activeTvl: null, volume24h: 5625962, fees24h: 2814, apr1d: 274.92, apr7d: 387.24, apr30d: 226.72, ageDays: 38,
    ilEstimate30d: "1–3.5%", risk: "medium", riskReasons: ["Active TVL unavailable", "Concentrated-liquidity range"],
    opportunityReason: "Strong meme-base demand; active liquidity must be checked before entry.", dataQuality: "missing-active-tvl",
  },
  {
    id: "0x7a6a053eccf1446a2633e05aa6d40d09381997ec", stock: "GLD", pair: "USDG", protocol: "Uniswap v3", feeTier: 0.3,
    tvl: 1742800, activeTvl: 1679065, volume24h: 8041376, fees24h: 24164, apr1d: 506.08, apr7d: 1220, apr30d: 461.46, ageDays: 13,
    ilEstimate30d: "0.5–2.0%", risk: "medium", riskReasons: ["Young APR regime", "High fee tier"],
    opportunityReason: "High active-TVL ratio and commodity diversification; do not extrapolate APR.", dataQuality: "partial-history",
  },
  {
    id: "0xddcbba3666f578e3f09516f21ff85bfee859ab5e", stock: "SPY", pair: "WETH", protocol: "Uniswap v3", feeTier: 0.05,
    tvl: 1333972, activeTvl: 1195765, volume24h: 21728721, fees24h: 10867, apr1d: 297.34, apr7d: 403.2, apr30d: 294.8, ageDays: 31.1,
    ilEstimate30d: "3–8%+", risk: "high", riskReasons: ["Two volatile assets", "Overnight and weekend gap risk"],
    opportunityReason: "High volume and fees, but WETH makes this an aggressive rather than defensive stock LP.", dataQuality: "verified",
  },
  {
    id: "0x0a2121a50a09ed0796ae81f9c53ff9398355a398", stock: "COST", pair: "USDG", protocol: "Uniswap v3", feeTier: 0.3,
    tvl: 611003, activeTvl: 567035, volume24h: 10553035, fees24h: 31706, apr1d: 1894, apr7d: 971.13, apr30d: 352.3, ageDays: 42.7,
    ilEstimate30d: "1–4%", risk: "high", riskReasons: ["Extreme fee APR", "Likely temporary volume regime"],
    opportunityReason: "Exceptional fee efficiency, flagged as a regime anomaly rather than a base case.", dataQuality: "verified",
  },
  {
    id: "0x34d0dc122cf9a8eb296fc5e0d3a233625d7d19b7", stock: "GOOGL", pair: "USDG", protocol: "Uniswap v3", feeTier: 0.05,
    tvl: 395631, activeTvl: 390527, volume24h: 8445795, fees24h: 4224, apr1d: 389.69, apr7d: 611.32, apr30d: 299.94, ageDays: 54.8,
    ilEstimate30d: "1–4%", risk: "medium", riskReasons: ["Relatively thin TVL", "Concentrated-liquidity range"],
    opportunityReason: "Mature pool with nearly all TVL active; position sizing remains important.", dataQuality: "verified",
  },
];

const pools: PoolOpportunity[] = rawPools.map((pool) => ({
  ...pool,
  score: calculateOpportunityScore(pool),
  revertUrl: `${BASE_REVERT_URL}/${pool.protocol === "Uniswap v4" ? "uniswapv4" : "uniswapv3"}/${pool.id}`,
}));

const stocks: StockPopularity[] = [
  { rank: 1, symbol: "NVDA", name: "NVIDIA", memePairs: 150, memeVolume24h: 29150000, rialtoValue: 12960000, category: "stock" },
  { rank: 2, symbol: "SPCX", name: "SpaceX", memePairs: 64, memeVolume24h: 11250000, rialtoValue: 6750000, category: "private" },
  { rank: 3, symbol: "AAPL", name: "Apple", memePairs: 52, memeVolume24h: 13980000, rialtoValue: 4570000, category: "stock" },
  { rank: 4, symbol: "SPY", name: "S&P 500 ETF", memePairs: 50, memeVolume24h: 13660000, rialtoValue: 13440000, category: "etf" },
  { rank: 5, symbol: "TSLA", name: "Tesla", memePairs: 49, memeVolume24h: 7180000, rialtoValue: 3030000, category: "stock" },
  { rank: 6, symbol: "GME", name: "GameStop", memePairs: 46, memeVolume24h: 6420000, rialtoValue: null, category: "stock" },
  { rank: 7, symbol: "GLD", name: "Gold ETF", memePairs: 44, memeVolume24h: 8040000, rialtoValue: 3470000, category: "commodity" },
  { rank: 8, symbol: "META", name: "Meta", memePairs: 43, memeVolume24h: 5590000, rialtoValue: null, category: "stock" },
  { rank: 9, symbol: "PLTR", name: "Palantir", memePairs: 41, memeVolume24h: 4910000, rialtoValue: null, category: "stock" },
  { rank: 10, symbol: "RDDT", name: "Reddit", memePairs: 40, memeVolume24h: 4650000, rialtoValue: null, category: "stock" },
];

export const staticDashboardData: DashboardData = {
  measuredAt: "2026-09-03T17:04:28.000Z",
  generatedAt: "2026-09-03T17:04:28.000Z",
  sourceMode: "research-snapshot",
  methodologyVersion: "1.0",
  market: {
    rwaPoolCount: 100, rwaTvl: 45785799, rwaVolume24h: 337491251,
    candidatePoolCount: 84, candidateTvl: 40102862, candidateVolume24h: 312530975,
    usdGPools: 76, wethPools: 8, rialtoAssets: 202, rialtoTokenizedValue: 96350000,
  },
  stocks,
  pools,
};
