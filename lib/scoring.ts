import type { PoolOpportunity, RiskLevel } from "@/lib/types";

const riskMultiplier: Record<RiskLevel, number> = { low: 1, medium: 1.55, high: 3.5 };

/**
 * Ranking heuristic, not a forecast. It rewards usable liquidity and fee generation,
 * caps unstable APR input, and penalizes risk, youth and partial data.
 */
export function calculateOpportunityScore(
  pool: Omit<PoolOpportunity, "score" | "revertUrl">,
): number {
  const liquidity = Math.log10(Math.max(pool.tvl, 1)) * 6;
  const feeEfficiency = Math.min((pool.fees24h / Math.max(pool.tvl, 1)) * 365 * 100, 250) / 15;
  const aprSignal = Math.min(pool.apr30d, 250) / 18;
  const ageFactor = Math.min(pool.ageDays / 30, 1);
  const qualityFactor = pool.dataQuality === "verified" ? 1 : pool.dataQuality === "partial-history" ? 0.82 : 0.55;
  const raw = (liquidity + feeEfficiency + aprSignal) * ageFactor * qualityFactor;
  return Math.round(Math.min(99, raw * 1.6 / riskMultiplier[pool.risk]) * 10) / 10;
}
