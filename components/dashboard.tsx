"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle, ArrowUpRight, BarChart3, Database, ExternalLink, Filter,
  RefreshCw, Search, ShieldCheck, TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StrategyChart } from "@/components/strategy-chart";
import { compactUsd, formatDateTime, integer, percent } from "@/lib/format";
import type { DashboardData, PairToken, PoolOpportunity, RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortKey = "score" | "tvl" | "volume24h" | "fees24h" | "apr30d";
type RiskFilter = "all" | RiskLevel;
type PairFilter = "all" | PairToken;

const riskStyles: Record<RiskLevel, string> = {
  low: "border-[#39ff68]/40 bg-[#39ff68]/5 text-[#39ff68]",
  medium: "border-warning/40 bg-warning/5 text-warning",
  high: "border-danger/40 bg-danger/5 text-danger",
};
const riskLabels: Record<RiskLevel, string> = { low: "Low", medium: "Medium", high: "High" };

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-4 border-l-2 border-primary pl-3">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">[{eyebrow}]</p>
        <h2 className="text-lg font-bold uppercase tracking-[-0.02em] text-foreground sm:text-xl">{title}</h2>
      </div>
      <p className="mt-1 max-w-4xl text-xs leading-5 text-muted">{copy}</p>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border-l border-primary/40 px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.12em] text-primary">{label}</p>
      <p className="market-positive tabular mt-1 text-lg font-bold tracking-tight sm:text-xl">{value}</p>
      <p className="mt-0.5 text-[9px] uppercase text-muted">{detail}</p>
    </div>
  );
}

function PoolLink({ pool }: { pool: PoolOpportunity }) {
  return (
    <a href={pool.revertUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold uppercase text-primary hover:bg-primary hover:text-black">
      RVRT <ExternalLink className="size-3" />
    </a>
  );
}

export function Dashboard({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState("");
  const [pair, setPair] = useState<PairFilter>("all");
  const [risk, setRisk] = useState<RiskFilter>("all");
  const [sort, setSort] = useState<SortKey>("score");
  const [isPending, startTransition] = useTransition();

  const pools = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.pools
      .filter((pool) => !term || `${pool.stock} ${pool.pair}`.toLowerCase().includes(term))
      .filter((pool) => pair === "all" || pool.pair === pair)
      .filter((pool) => risk === "all" || pool.risk === risk)
      .sort((a, b) => b[sort] - a[sort]);
  }, [data.pools, pair, query, risk, sort]);

  const topPools = useMemo(
    () => [...data.pools].filter((pool) => pool.risk !== "high").sort((a, b) => b.score - a.score).slice(0, 4),
    [data.pools],
  );

  function refresh() {
    startTransition(() => {
      // GitHub Pages serves a static research snapshot. This confirms the client
      // session refreshed without pretending the measured market data changed.
      setData((current) => ({ ...current, generatedAt: new Date().toISOString() }));
    });
  }

  return (
    <main className="terminal-scanline min-h-screen">
      <header className="sticky top-0 z-30 border-b border-primary/50 bg-black/95 backdrop-blur">
        <div className="flex h-5 items-center justify-between bg-primary px-2 text-[9px] font-black uppercase tracking-[0.08em] text-black sm:px-4">
          <span>RWA Liquidity Workstation</span>
          <span className="hidden sm:inline">Chain 4663 // Session: Research</span>
          <span>{formatDateTime(data.generatedAt).slice(11)}</span>
        </div>
        <div className="flex items-stretch justify-between border-b border-border">
          <a href="#top" className="flex items-center border-r border-border px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-warning sm:px-5">
            <span className="mr-2 bg-warning px-1.5 py-0.5 text-black">LP</span> Stock Radar
          </a>
          <nav className="hidden flex-1 items-stretch md:flex">
            <a href="#stocks" className="border-r border-border px-4 py-2 text-[10px] font-bold uppercase text-muted hover:bg-primary hover:text-black"><span className="text-primary">F1</span> Meme bases</a>
            <a href="#pools" className="border-r border-border px-4 py-2 text-[10px] font-bold uppercase text-muted hover:bg-primary hover:text-black"><span className="text-primary">F2</span> Pool monitor</a>
            <a href="#risk" className="border-r border-border px-4 py-2 text-[10px] font-bold uppercase text-muted hover:bg-primary hover:text-black"><span className="text-primary">F3</span> Risk book</a>
          </nav>
          <div className="flex items-center px-3 sm:px-5"><Badge className="border-[#39ff68]/50 bg-[#39ff68]/5 text-[#39ff68]"><span className="mr-1.5 size-1.5 bg-[#39ff68]" /> Snapshot</Badge></div>
        </div>
        <div className="flex h-6 items-center gap-5 overflow-hidden whitespace-nowrap px-3 text-[9px] uppercase text-muted sm:px-5">
          <span><b className="text-primary">RWA.POOLS</b> {data.market.rwaPoolCount}</span>
          <span><b className="text-[#39ff68]">CAND.TVL</b> {compactUsd.format(data.market.candidateTvl)}</span>
          <span><b className="text-[#42d7ff]">VOL.24H</b> {compactUsd.format(data.market.candidateVolume24h)}</span>
          <span><b className="text-warning">USDG/WETH</b> {data.market.usdGPools}/{data.market.wethPools}</span>
          <span className="hidden lg:inline">SOURCE REVERT + RIALTO + STONKSONCHAIN</span>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-[1600px] px-2 pb-12 pt-3 sm:px-4 lg:px-6">
        <section className="terminal-panel border border-primary/40 bg-black">
          <div className="terminal-bar flex items-center justify-between px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
            <span>SYS:STRATEGY_OVERVIEW</span><span className="text-muted">RHCHAIN // RWA=TRUE</span>
          </div>
          <div className="grid lg:grid-cols-[1.15fr_.85fr]">
            <div className="p-4 sm:p-6 lg:border-r lg:border-border">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#42d7ff]">&gt; Stock Token liquidity intelligence</p>
              <h1 className="mt-3 max-w-4xl text-3xl font-black uppercase leading-[1.02] tracking-[-0.05em] text-foreground sm:text-5xl">
                Earn from the hype.<br /><span className="text-primary">Not from the rug pull.</span>
              </h1>
              <p className="mt-4 max-w-3xl border-l border-warning pl-3 text-xs leading-5 text-muted">
                Scan Stock Token pools paired with USDG or WETH. Rank by fee efficiency, liquidity and risk quality. Gross APR is a signal — not a promise.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild><a href="#pools">F2 / Open scanner <ArrowUpRight className="size-3.5" /></a></Button>
                <Button asChild variant="outline"><a href="https://revert.finance/#/initiator" target="_blank" rel="noreferrer">EXT / Revert <ExternalLink className="size-3.5" /></a></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 content-stretch bg-card/40">
              <Metric label="Candidate pools" value={integer.format(data.market.candidatePoolCount)} detail={`${data.market.usdGPools} USDG · ${data.market.wethPools} WETH`} />
              <Metric label="Candidate TVL" value={compactUsd.format(data.market.candidateTvl)} detail="RWA filter, Revert" />
              <Metric label="24h volume" value={compactUsd.format(data.market.candidateVolume24h)} detail="Candidate universe" />
              <Metric label="Rialto assets" value={integer.format(data.market.rialtoAssets)} detail={compactUsd.format(data.market.rialtoTokenizedValue)} />
            </div>
          </div>
        </section>

        <div className="mt-2 flex flex-col justify-between gap-2 border border-border bg-card px-3 py-2 text-[9px] uppercase text-muted sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2"><Database className="size-3 text-primary" /> As-of {formatDateTime(data.measuredAt)} · Research snapshot v{data.methodologyVersion}</span>
          <div className="flex items-center gap-2">
            <span>Refresh {formatDateTime(data.generatedAt)}</span>
            <Button size="sm" variant="ghost" onClick={refresh} disabled={isPending} aria-label="Refresh data">
              <RefreshCw className={cn("size-3", isPending && "animate-spin")} /> Refresh
            </Button>
          </div>
        </div>

        <section id="stocks" className="scroll-mt-24 pt-10">
          <SectionTitle eyebrow="01 · Meme base demand" title="Stocks attracting the most coins" copy="Ranked by meme-pair count on StonksOnChain. Popularity is a demand indicator, not a quality seal." />
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {data.stocks.map((stock) => (
              <Card key={stock.symbol} className="group border-0 bg-black p-3 transition-colors hover:bg-primary/[0.05]">
                <div className="flex items-start justify-between">
                  <span className="tabular text-[9px] text-primary">RANK {stock.rank.toString().padStart(2, "0")}</span>
                  <Badge className="border-border px-1.5 py-0 text-[8px] text-muted">{stock.category}</Badge>
                </div>
                <p className="market-yellow mt-3 text-xl font-black tracking-tight group-hover:text-primary">{stock.symbol}</p>
                <p className="mt-0.5 truncate text-[9px] uppercase text-muted">{stock.name}</p>
                <div className="mt-3 h-1 bg-border"><div className="h-full bg-primary" style={{ width: `${Math.max(8, stock.memePairs / data.stocks[0].memePairs * 100)}%` }} /></div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-2">
                  <div><p className="market-positive tabular text-sm font-bold">{stock.memePairs}</p><p className="text-[8px] uppercase text-muted">Meme pairs</p></div>
                  <div className="text-right"><p className="market-cyan tabular text-xs font-bold">{compactUsd.format(stock.memeVolume24h)}</p><p className="text-[8px] uppercase text-muted">Vol 24h</p></div>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-2 text-[9px] uppercase text-muted">Sources // <a className="text-primary hover:bg-primary hover:text-black" href="https://stonksonchain.lol/" target="_blank" rel="noreferrer">StonksOnChain</a> pair count + volume // <a className="text-primary hover:bg-primary hover:text-black" href="https://analytics.rialto.xyz/assets" target="_blank" rel="noreferrer">Rialto</a> asset verification</p>
        </section>

        <section className="pt-10">
          <SectionTitle eyebrow="02 · Best setups" title="Top opportunities on the defensive route" copy="The score weighs liquidity, fees, history, data quality and risk. It ranks; it does not predict." />
          <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {topPools.map((pool, index) => (
              <Card key={pool.id} className="relative overflow-hidden border-0 bg-black">
                <div className="terminal-bar px-3 py-1 text-[9px] font-bold uppercase text-primary">REC_0{index + 1} · SCORE {pool.score}</div>
                <CardHeader>
                  <div className="flex items-center justify-between"><Badge className={riskStyles[pool.risk]}>{riskLabels[pool.risk]}</Badge><span className="text-[9px] uppercase text-muted">{pool.protocol}</span></div>
                  <h3 className="market-yellow mt-3 text-xl font-black">{pool.stock}<span className="text-muted">/{pool.pair}</span></h3>
                  <p className="mt-2 min-h-14 text-[10px] leading-4 text-muted">{pool.opportunityReason}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 border-t border-border pt-3"><div><p className="text-[8px] uppercase text-muted">TVL</p><p className="market-cyan tabular mt-1 text-xs font-bold">{compactUsd.format(pool.tvl)}</p></div><div><p className="text-[8px] uppercase text-muted">30d gross APR</p><p className="market-positive tabular mt-1 text-xs font-bold">{percent(pool.apr30d)}</p></div></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pools" className="scroll-mt-24 pt-10">
          <SectionTitle eyebrow="03 · Opportunity scanner" title="Stock Token LP opportunities" copy="All APR figures are gross fee APR. IL estimates are 30-day scenario bands, not realized losses or guarantees." />
          <Card className="overflow-hidden">
            <div className="terminal-bar flex flex-col gap-2 border-b border-primary/30 p-2 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search NVDA, SPY, USDG…" className="pl-9" /></div>
              <div className="grid grid-cols-3 gap-1">
                <label className="relative"><span className="sr-only">Pair</span><select value={pair} onChange={(e) => setPair(e.target.value as PairFilter)} className="h-9 w-full appearance-none border border-border bg-black px-2 pr-7 text-[10px] font-bold uppercase outline-none focus:border-primary"><option value="all">All pairs</option><option value="USDG">USDG</option><option value="WETH">WETH</option></select><Filter className="pointer-events-none absolute right-2 top-3 size-3 text-primary" /></label>
                <label><span className="sr-only">Risk</span><select value={risk} onChange={(e) => setRisk(e.target.value as RiskFilter)} className="h-9 w-full border border-border bg-black px-2 text-[10px] font-bold uppercase outline-none focus:border-primary"><option value="all">All risks</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
                <label><span className="sr-only">Sort</span><select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-9 w-full border border-border bg-black px-2 text-[10px] font-bold uppercase outline-none focus:border-primary"><option value="score">Smart score</option><option value="tvl">TVL</option><option value="volume24h">Volume</option><option value="fees24h">Fees</option><option value="apr30d">30d APR</option></select></label>
              </div>
            </div>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left text-[11px]">
                <thead><tr className="border-b border-primary/40 bg-primary/10 text-[9px] uppercase tracking-[0.1em] text-primary"><th className="px-3 py-2 font-bold">Ticker / Pair</th><th className="px-3 py-2 font-bold">TVL</th><th className="px-3 py-2 font-bold">Volume 24h</th><th className="px-3 py-2 font-bold">Fees 24h</th><th className="px-3 py-2 font-bold">APR 30d</th><th className="px-3 py-2 font-bold">IL scenario</th><th className="px-3 py-2 font-bold">Risk flag</th><th className="px-3 py-2 font-bold">Score</th><th className="px-3 py-2 font-bold">Action</th></tr></thead>
                <tbody>{pools.map((pool) => (
                  <tr key={pool.id} className="border-b border-border transition-colors last:border-0 odd:bg-black even:bg-white/[0.012] hover:bg-primary/[0.08]">
                    <td className="px-3 py-2.5"><div className="market-yellow font-black">{pool.stock}<span className="text-muted">/{pool.pair}</span></div><div className="mt-0.5 text-[8px] uppercase text-muted">{pool.protocol} · {pool.feeTier}% · {pool.ageDays.toFixed(0)}d</div></td>
                    <td className="market-cyan tabular px-3 py-2.5 font-bold">{compactUsd.format(pool.tvl)}{pool.activeTvl && <div className="mt-0.5 text-[8px] font-normal text-muted">ACTIVE {Math.round(pool.activeTvl / pool.tvl * 100)}%</div>}</td>
                    <td className="market-cyan tabular px-3 py-2.5">{compactUsd.format(pool.volume24h)}</td><td className="tabular px-3 py-2.5 text-foreground">{compactUsd.format(pool.fees24h)}</td>
                    <td className="market-positive tabular px-3 py-2.5 font-black">{percent(pool.apr30d)}{pool.dataQuality !== "verified" && <div className="mt-0.5 text-[8px] font-normal uppercase text-warning">Partial data</div>}</td>
                    <td className="tabular px-3 py-2.5">{pool.ilEstimate30d}<div className="mt-0.5 text-[8px] uppercase text-muted">30d est.</div></td>
                    <td className="px-3 py-2.5"><Badge className={riskStyles[pool.risk]}>{riskLabels[pool.risk]}</Badge><div className="mt-1 max-w-40 text-[8px] uppercase leading-3 text-muted">{pool.riskReasons[0]}</div></td>
                    <td className="market-yellow tabular px-3 py-2.5 font-black">{pool.score}</td><td className="px-3 py-2.5"><PoolLink pool={pool} /></td>
                  </tr>
                ))}</tbody>
              </table>
              {pools.length === 0 && <div className="p-10 text-center text-sm text-muted">No pools match these filters.</div>}
            </div>
          </Card>
        </section>

        <section id="risk" className="scroll-mt-24 pt-10">
          <SectionTitle eyebrow="04 · Risk before return" title="High APR is often a warning, not a gift" copy="Fee APR counts trading fees only. Divergence loss, range management, gas, slippage, issuer risk and contract risk still have to be deducted." />
          <div className="grid gap-2 lg:grid-cols-[.9fr_1.1fr]">
            <Card className="border-danger/20 bg-danger/[0.035]">
              <div className="flex items-center gap-2 border-b border-danger/30 bg-danger/10 px-3 py-1.5 text-[9px] font-bold uppercase text-danger"><AlertTriangle className="size-3.5" /> Alert: tail risk</div>
              <CardHeader><h3 className="text-lg font-black uppercase text-danger">Pure memecoin LP</h3><p className="mt-2 text-[11px] leading-5 text-muted">Samples show gross 30-day fee APRs from roughly 650% to 3,850%. A single rug pull, honeypot or liquidity flight can erase more than all accumulated fees.</p></CardHeader>
              <CardContent><ul className="space-y-2 text-[10px] uppercase text-muted">{["Unbounded token and rug risk", "APR collapses when volume moves", "Out-of-range positions stop earning", "Extremes may be data-quality errors"].map((item) => <li key={item} className="flex gap-2"><span className="mt-1.5 h-px w-2 shrink-0 bg-danger" />{item}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <div className="terminal-bar flex items-center justify-between px-3 py-1.5 text-[9px] font-bold uppercase text-primary"><span>Chart // Gross fee APR</span><BarChart3 className="size-3.5" /></div>
              <CardHeader><h3 className="text-lg font-black uppercase">Return versus tail risk</h3></CardHeader>
              <CardContent><StrategyChart /><p className="mt-2 border-t border-border pt-2 text-[9px] uppercase leading-4 text-muted">Representative snapshot observations // Pure-meme bar capped at 2,400% // Stock/USDG planning range: 40–180% gross, 20–120% net in favorable regimes.</p></CardContent>
            </Card>
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Legal structure", text: "Stock Tokens are debt instruments. They do not grant shareholder rights in the underlying equity." },
              { icon: TrendingUp, title: "IL & range", text: "Concentrated liquidity increases capital efficiency and the risk of ending up out of range." },
              { icon: Database, title: "Source quality", text: "Impossible volumes and missing active TVL are rejected or explicitly flagged." },
            ].map(({ icon: Icon, title, text }, index) => <Card key={title} className="p-3"><div className="flex items-center justify-between border-b border-border pb-2"><Icon className="size-3.5 text-primary" /><span className="text-[8px] text-muted">RISK_0{index + 1}</span></div><h3 className="market-yellow mt-3 text-xs font-black uppercase">{title}</h3><p className="mt-1.5 text-[10px] leading-4 text-muted">{text}</p></Card>)}
          </div>
        </section>

        <footer className="mt-10 border-t border-primary/40 bg-card px-3 py-3 text-[9px] uppercase leading-4 text-muted">
          <div className="flex flex-col justify-between gap-3 sm:flex-row"><p className="max-w-3xl"><span className="text-warning">Disclaimer //</span> Research tool, not financial advice. Verify contract addresses, pool status, applicable jurisdiction and current data before every transaction.</p><div className="flex flex-wrap gap-4"><a className="text-primary hover:bg-primary hover:text-black" href="https://docs.robinhood.com/chain/stock-tokens/" target="_blank" rel="noreferrer">Robinhood docs</a><a className="text-primary hover:bg-primary hover:text-black" href="https://docs.revert.finance/revert/resources/security" target="_blank" rel="noreferrer">Revert security</a><a className="text-primary hover:bg-primary hover:text-black" href="https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss" target="_blank" rel="noreferrer">IL guide</a></div></div>
        </footer>
      </div>
    </main>
  );
}
