export type RiskLevel = "low" | "medium" | "high";
export type PairToken = "USDG" | "WETH";
export type DataQuality = "verified" | "partial-history" | "missing-active-tvl";

export interface StockPopularity {
  rank: number;
  symbol: string;
  name: string;
  memePairs: number;
  memeVolume24h: number;
  rialtoValue: number | null;
  category: "stock" | "etf" | "commodity" | "private";
}

export interface PoolOpportunity {
  id: string;
  stock: string;
  pair: PairToken;
  protocol: "Uniswap v3" | "Uniswap v4";
  feeTier: number;
  tvl: number;
  activeTvl: number | null;
  volume24h: number;
  fees24h: number;
  apr1d: number;
  apr7d: number;
  apr30d: number;
  ageDays: number;
  ilEstimate30d: string;
  risk: RiskLevel;
  riskReasons: string[];
  opportunityReason: string;
  dataQuality: DataQuality;
  revertUrl: string;
  score: number;
}

export interface MarketSummary {
  rwaPoolCount: number;
  rwaTvl: number;
  rwaVolume24h: number;
  candidatePoolCount: number;
  candidateTvl: number;
  candidateVolume24h: number;
  usdGPools: number;
  wethPools: number;
  rialtoAssets: number;
  rialtoTokenizedValue: number;
}

export interface DashboardData {
  measuredAt: string;
  generatedAt: string;
  sourceMode: "research-snapshot" | "live";
  methodologyVersion: string;
  market: MarketSummary;
  stocks: StockPopularity[];
  pools: PoolOpportunity[];
}
