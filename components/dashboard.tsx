"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle, ArrowUpRight, BarChart3, Database, ExternalLink, Filter,
  RefreshCw, Search, ShieldCheck, Sparkles, TrendingUp, Waves,
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
  low: "border-primary/30 bg-primary/10 text-primary",
  medium: "border-warning/30 bg-warning/10 text-warning",
  high: "border-danger/30 bg-danger/10 text-danger",
};
const riskLabels: Record<RiskLevel, string> = { low: "Laag", medium: "Medium", high: "Hoog" };

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted sm:text-base">{copy}</p>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border-l border-border pl-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="tabular mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}

function PoolLink({ pool }: { pool: PoolOpportunity }) {
  return (
    <a href={pool.revertUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
      Revert <ExternalLink className="size-3" />
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
  const [refreshError, setRefreshError] = useState<string | null>(null);

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

  async function refresh() {
    setRefreshError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) throw new Error("refresh failed");
        setData(await response.json() as DashboardData);
      } catch {
        setRefreshError("Vernieuwen mislukt. De laatste geldige snapshot blijft zichtbaar.");
      }
    });
  }

  return (
    <main>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary"><Waves className="size-4" /></span>
            Stock LP Radar
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#stocks" className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">Stocks</a>
            <a href="#pools" className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">Pools</a>
            <a href="#risk" className="rounded-lg px-3 py-2 text-sm text-muted hover:text-foreground">Risico</a>
          </nav>
          <Badge className="border-primary/25 bg-primary/5 text-primary"><span className="mr-1.5 size-1.5 rounded-full bg-primary" /> Snapshot</Badge>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-6 sm:p-10 lg:p-12">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_center,rgba(166,255,0,.09),transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <Badge className="mb-5 border-primary/25 bg-primary/10 text-primary"><Sparkles className="mr-1.5 size-3" /> Robinhood Chain · RWA filter</Badge>
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Verdien aan de hype.<br /><span className="text-primary">Niet aan de rugpull.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Een researchdashboard voor Stock Token-liquiditeit tegen USDG of WETH. Fees eerst, APR met context, risico zichtbaar vóór je klikt.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild><a href="#pools">Bekijk kansen <ArrowUpRight className="size-4" /></a></Button>
                <Button asChild variant="outline"><a href="https://revert.finance/#/initiator" target="_blank" rel="noreferrer">Open Revert <ExternalLink className="size-4" /></a></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 rounded-2xl border border-border bg-black/20 p-5">
              <Metric label="Kandidaatpools" value={integer.format(data.market.candidatePoolCount)} detail={`${data.market.usdGPools} USDG · ${data.market.wethPools} WETH`} />
              <Metric label="Kandidaat-TVL" value={compactUsd.format(data.market.candidateTvl)} detail="RWA-filter, Revert" />
              <Metric label="24u volume" value={compactUsd.format(data.market.candidateVolume24h)} detail="Kandidaatuniversum" />
              <Metric label="Rialto assets" value={integer.format(data.market.rialtoAssets)} detail={compactUsd.format(data.market.rialtoTokenizedValue)} />
            </div>
          </div>
        </section>

        <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-border bg-white/[0.02] px-4 py-3 text-xs text-muted sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2"><Database className="size-3.5 text-primary" /> Meting: {formatDateTime(data.measuredAt)} · research-snapshot v{data.methodologyVersion}</span>
          <div className="flex items-center gap-3">
            <span>API-refresh: {formatDateTime(data.generatedAt)}</span>
            <Button size="sm" variant="ghost" onClick={refresh} disabled={isPending} aria-label="Data vernieuwen">
              <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} /> Vernieuw
            </Button>
          </div>
        </div>
        {refreshError && <p role="alert" className="mt-2 text-xs text-danger">{refreshError}</p>}

        <section id="stocks" className="scroll-mt-24 pt-24">
          <SectionTitle eyebrow="01 · Meme-basisvraag" title="Stocks die de meeste coins aantrekken" copy="Gerangschikt op aantal meme-pairs op StonksOnChain. Populariteit is een vraagindicator, geen kwaliteitsstempel." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {data.stocks.map((stock) => (
              <Card key={stock.symbol} className="group p-5 transition-colors hover:border-primary/30">
                <div className="flex items-start justify-between">
                  <span className="tabular text-xs text-muted">#{stock.rank.toString().padStart(2, "0")}</span>
                  <Badge className="px-2 py-0.5 text-[9px] text-muted">{stock.category}</Badge>
                </div>
                <p className="mt-6 text-2xl font-semibold tracking-tight group-hover:text-primary">{stock.symbol}</p>
                <p className="mt-1 truncate text-xs text-muted">{stock.name}</p>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <div><p className="tabular text-lg font-semibold">{stock.memePairs}</p><p className="text-[10px] uppercase tracking-wider text-muted">meme-pairs</p></div>
                  <div className="text-right"><p className="tabular text-sm">{compactUsd.format(stock.memeVolume24h)}</p><p className="text-[10px] uppercase tracking-wider text-muted">24u volume</p></div>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Bronnen: <a className="text-foreground hover:text-primary" href="https://stonksonchain.lol/" target="_blank" rel="noreferrer">StonksOnChain</a> voor pair-count/volume; <a className="text-foreground hover:text-primary" href="https://analytics.rialto.xyz/assets" target="_blank" rel="noreferrer">Rialto</a> voor assetverificatie.</p>
        </section>

        <section className="pt-24">
          <SectionTitle eyebrow="02 · Beste setup" title="Top opportunities binnen de defensievere route" copy="De score weegt liquiditeit, fees, historie, datakwaliteit en risico. Hij rangschikt; hij voorspelt niet." />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {topPools.map((pool, index) => (
              <Card key={pool.id} className="relative overflow-hidden">
                <div className="absolute right-0 top-0 px-4 py-3 text-4xl font-semibold text-white/[0.035]">0{index + 1}</div>
                <CardHeader>
                  <div className="flex items-center justify-between"><Badge className={riskStyles[pool.risk]}>{riskLabels[pool.risk]}</Badge><span className="tabular text-xs text-muted">Score {pool.score}</span></div>
                  <h3 className="mt-5 text-2xl font-semibold">{pool.stock}<span className="text-muted">/{pool.pair}</span></h3>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-muted">{pool.opportunityReason}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm"><div><p className="text-xs text-muted">TVL</p><p className="tabular mt-1 font-semibold">{compactUsd.format(pool.tvl)}</p></div><div><p className="text-xs text-muted">30d bruto APR</p><p className="tabular mt-1 font-semibold text-primary">{percent(pool.apr30d)}</p></div></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pools" className="scroll-mt-24 pt-24">
          <SectionTitle eyebrow="03 · Opportunity scanner" title="Stock Token LP-kansen" copy="Alle APR-cijfers zijn bruto fee-APR. IL-schattingen zijn scenario-banden voor 30 dagen, niet gerealiseerde verliezen of garanties." />
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op NVDA, SPY, USDG…" className="pl-9" /></div>
              <div className="grid grid-cols-3 gap-2">
                <label className="relative"><span className="sr-only">Pair</span><select value={pair} onChange={(e) => setPair(e.target.value as PairFilter)} className="h-10 w-full appearance-none rounded-lg border border-border bg-black/20 px-3 pr-8 text-sm outline-none"><option value="all">Alle pairs</option><option value="USDG">USDG</option><option value="WETH">WETH</option></select><Filter className="pointer-events-none absolute right-2.5 top-3 size-3.5 text-muted" /></label>
                <label><span className="sr-only">Risico</span><select value={risk} onChange={(e) => setRisk(e.target.value as RiskFilter)} className="h-10 w-full rounded-lg border border-border bg-black/20 px-3 text-sm outline-none"><option value="all">Alle risico’s</option><option value="low">Laag</option><option value="medium">Medium</option><option value="high">Hoog</option></select></label>
                <label><span className="sr-only">Sortering</span><select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 w-full rounded-lg border border-border bg-black/20 px-3 text-sm outline-none"><option value="score">Slimme score</option><option value="tvl">TVL</option><option value="volume24h">Volume</option><option value="fees24h">Fees</option><option value="apr30d">30d APR</option></select></label>
              </div>
            </div>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
                <thead><tr className="border-b border-border bg-white/[0.015] text-[10px] uppercase tracking-[0.14em] text-muted"><th className="px-5 py-3 font-medium">Pool</th><th className="px-4 py-3 font-medium">TVL</th><th className="px-4 py-3 font-medium">24u volume</th><th className="px-4 py-3 font-medium">24u fees</th><th className="px-4 py-3 font-medium">30d APR</th><th className="px-4 py-3 font-medium">IL-scenario</th><th className="px-4 py-3 font-medium">Risico</th><th className="px-4 py-3 font-medium">Score</th><th className="px-5 py-3 font-medium">Pool</th></tr></thead>
                <tbody>{pools.map((pool) => (
                  <tr key={pool.id} className="border-b border-border/70 transition-colors last:border-0 hover:bg-white/[0.025]">
                    <td className="px-5 py-4"><div className="font-semibold">{pool.stock}<span className="text-muted">/{pool.pair}</span></div><div className="mt-1 text-xs text-muted">{pool.protocol} · {pool.feeTier}% · {pool.ageDays.toFixed(0)}d</div></td>
                    <td className="tabular px-4 py-4">{compactUsd.format(pool.tvl)}{pool.activeTvl && <div className="mt-1 text-[10px] text-muted">{Math.round(pool.activeTvl / pool.tvl * 100)}% actief</div>}</td>
                    <td className="tabular px-4 py-4">{compactUsd.format(pool.volume24h)}</td><td className="tabular px-4 py-4">{compactUsd.format(pool.fees24h)}</td>
                    <td className="tabular px-4 py-4 font-semibold text-primary">{percent(pool.apr30d)}{pool.dataQuality !== "verified" && <div className="mt-1 text-[10px] font-normal text-warning">partiële/ontbrekende data</div>}</td>
                    <td className="tabular px-4 py-4">{pool.ilEstimate30d}<div className="mt-1 text-[10px] text-muted">30d scenario</div></td>
                    <td className="px-4 py-4"><Badge className={riskStyles[pool.risk]}>{riskLabels[pool.risk]}</Badge><div className="mt-2 max-w-36 text-[10px] leading-4 text-muted">{pool.riskReasons[0]}</div></td>
                    <td className="tabular px-4 py-4 font-semibold">{pool.score}</td><td className="px-5 py-4"><PoolLink pool={pool} /></td>
                  </tr>
                ))}</tbody>
              </table>
              {pools.length === 0 && <div className="p-10 text-center text-sm text-muted">Geen pools voor deze filters.</div>}
            </div>
          </Card>
        </section>

        <section id="risk" className="scroll-mt-24 pt-24">
          <SectionTitle eyebrow="04 · Risico vóór rendement" title="Hoge APR is vaak een alarmsignaal, geen cadeautje" copy="Fee-APR telt alleen handelsfees. Divergence loss, range management, gas, slippage, issuer- en contractrisico komen daar nog vanaf." />
          <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
            <Card className="border-danger/20 bg-danger/[0.035]">
              <CardHeader><div className="flex size-10 items-center justify-center rounded-xl bg-danger/10 text-danger"><AlertTriangle className="size-5" /></div><h3 className="mt-5 text-xl font-semibold">Pure memecoin LP</h3><p className="mt-2 text-sm leading-6 text-muted">Voorbeelden tonen bruto 30d fee-APR’s van circa 650% tot 3.850%. Eén rugpull, honeypot of liquiditeitsvlucht kan meer dan alle fees uitwissen.</p></CardHeader>
              <CardContent><ul className="space-y-3 text-sm text-muted">{["Onbegrensd token- en rugrisico", "APR stort in wanneer volume verhuist", "Out-of-range posities stoppen met verdienen", "Extremen kunnen datakwaliteitsfouten zijn"].map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-danger" />{item}</li>)}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.15em] text-muted">Bruto fee-APR · indicatief</p><h3 className="mt-2 text-xl font-semibold">Rendement versus staart­risico</h3></div><BarChart3 className="size-5 text-primary" /></div></CardHeader>
              <CardContent><StrategyChart /><p className="mt-2 text-xs leading-5 text-muted">De grafiek gebruikt representatieve waarnemingen uit de snapshot; de pure-meme-balk is afgekapt bij 2.400%. Planningsrange voor gevestigde Stock/USDG-pools: circa 40–180% bruto en 20–120% netto in een gunstig regime.</p></CardContent>
            </Card>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Juridische vorm", text: "Stock Tokens zijn schuldinstrumenten. Ze geven geen aandeelhoudersrechten in het onderliggende aandeel." },
              { icon: TrendingUp, title: "IL & range", text: "Concentrated liquidity vergroot kapitaalefficiëntie én het risico dat je buiten range eindigt." },
              { icon: Database, title: "Bronkwaliteit", text: "Onmogelijke volumes en ontbrekende actieve TVL worden geweerd of expliciet gemarkeerd." },
            ].map(({ icon: Icon, title, text }) => <Card key={title} className="p-5"><Icon className="size-5 text-primary" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></Card>)}
          </div>
        </section>

        <footer className="mt-24 border-t border-border pt-8 text-xs leading-5 text-muted">
          <div className="flex flex-col justify-between gap-4 sm:flex-row"><p className="max-w-2xl">Researchtool, geen financieel advies. Controleer contractadres, poolstatus, toepasselijke jurisdictie en actuele data vóór iedere transactie.</p><div className="flex gap-4"><a className="hover:text-primary" href="https://docs.robinhood.com/chain/stock-tokens/" target="_blank" rel="noreferrer">Robinhood docs</a><a className="hover:text-primary" href="https://docs.revert.finance/revert/resources/security" target="_blank" rel="noreferrer">Revert security</a><a className="hover:text-primary" href="https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss" target="_blank" rel="noreferrer">IL uitleg</a></div></div>
        </footer>
      </div>
    </main>
  );
}
