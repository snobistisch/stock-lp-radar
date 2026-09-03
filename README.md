# Stock LP Radar

Productieklare Next.js-dashboardstarter voor het onderzoeken van Stock Token-liquiditeit op Robinhood Chain. Het dashboard combineert meme-basisvraag van StonksOnChain, assetverificatie via Rialto en RWA-poolmetrics van Revert Finance.

De interface gebruikt een eigen terminaldesign dat de ruwe datadichtheid van VFAT combineert met Bloomberg-achtige marktconventies: monospaced typografie, functietoetsnavigatie, zwarte panelen, oranje systeemstatus, groene rendementen, cyaan liquiditeit en compacte tabellen. Er zijn geen merkassets of exacte schermen gekopieerd.

> Researchtool, geen financieel advies. Stock Tokens zijn volgens de Robinhood-documentatie schuldinstrumenten en geven geen aandeelhoudersrechten in het onderliggende aandeel.

## Strategie

De scanner zoekt Stock Token-pools tegen **USDG** en **WETH**. Het doel is fee-inkomsten uit meme-activiteit te isoleren zonder rechtstreeks pure memecoins te bezitten. USDG is de defensievere quote; WETH introduceert extra volatiliteit en impermanent-lossrisico.

De slimme score combineert:

- bruikbare TVL en actieve liquiditeit;
- fees ten opzichte van TVL;
- 30-daagse APR, met een cap tegen uitschieters;
- poolleeftijd en datakwaliteit;
- een expliciete straf voor medium/hoog risico.

De score is een rangschikkingsheuristiek, geen rendementsvoorspelling.

## Stack

- Next.js 15 App Router + TypeScript
- Server Component voor initiële data
- Statische dataprovider + client refresh, compatibel met GitHub Pages
- Tailwind CSS + shadcn/ui-compatibele componenten
- Recharts
- Dark mode standaard, responsive en Vercel-ready

## Lokaal draaien

```bash
git clone <jouw-github-url>
cd stock-lp-radar
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Kwaliteitschecks:

```bash
npm run typecheck
npm run lint
npm run build
```

`npm run check` voert alle drie controles achter elkaar uit. Dezelfde controle draait automatisch in GitHub Actions bij iedere push en pull request.

## Deployen op Vercel

1. Push deze repository naar GitHub.
2. Importeer de repository in Vercel.
3. Kies het Next.js-frameworkpreset.
4. Neem de gewenste variabelen uit `.env.example` over.
5. Deploy; er is geen aangepaste buildconfiguratie nodig.

## GitHub Pages

De repository bevat een statische Next.js-export en een Pages-workflow. Iedere push naar `main` bouwt en publiceert automatisch naar:

[https://snobistisch.github.io/stock-lp-radar/](https://snobistisch.github.io/stock-lp-radar/)

De workflow stelt `NEXT_PUBLIC_BASE_PATH=/stock-lp-radar` in, voert typecheck en lint uit, bouwt `out/` en deployt dat artefact via GitHub Pages. Handmatig starten kan via **Actions → Deploy GitHub Pages → Run workflow**.

## Datasnapshot

De meegeleverde versie gebruikt een onderzoeksmeting van **3 september 2026, 19:04 CEST**. De refreshknop vernieuwt de lokale sessietimestamp, maar verandert bij `DATA_SOURCE=static` niet de onderliggende meetwaarden. Zie [DATA.md](./DATA.md) voor brondefinities, validatieregels en het live-migratiepad.

## Structuur

```text
app/                    Next.js-routes, layout en API
components/             Dashboard, chart en UI-primitives
lib/data/               Providercontract en research-snapshot
lib/scoring.ts          Transparante rankingheuristiek
lib/types.ts            Genormaliseerd datamodel
DATA.md                 Live-data- en onderhoudshandleiding
```

## Roadmap

- Geplande ingest van Revert, Rialto en StonksOnChain
- Historische APR/TVL-series in een database
- Walletspecifieke range- en IL-simulatie
- Alerts voor APR-verval, out-of-range en liquiditeitsuitstroom
- Contract allowlist en geautomatiseerde anomaliedetectie
- Vercel Cron of een externe indexer voor betrouwbare snapshots

## Licentie

MIT
