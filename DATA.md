# Data en onderhoud

## Huidige modus

De app gebruikt standaard `DATA_SOURCE=static`. De genormaliseerde snapshot staat in `lib/data/static.ts` en is gemeten op **2026-09-03T17:04:28Z**. `generatedAt` verandert bij een refresh; `measuredAt` niet. Dit onderscheid voorkomt dat oude marktdata als live data wordt gepresenteerd.

De marktsamenvatting is berekend uit de 100 RWA-poolrijen die Revert in de Robinhood-filter toonde:

| Universum | Pools | TVL | 24u volume |
|---|---:|---:|---:|
| Alle getoonde RWA-pools | 100 | $45.785.799 | $337.491.251 |
| Stock Token/USDG of Stock Token/WETH | 84 | $40.102.862 | $312.530.975 |

De opportunitytabel is een gecureerde shortlist, niet alle 84 kandidaten.

## Bronnen

- [StonksOnChain](https://stonksonchain.lol/) — meme-pair count en populariteitsvolume
- [Rialto Assets](https://analytics.rialto.xyz/assets) — verificatie en tokenized value
- [Revert Finance](https://revert.finance/) — pool-TVL, actieve TVL, volume, fees en bruto fee-APR
- [Robinhood Stock Token docs](https://docs.robinhood.com/chain/stock-tokens/) — juridische en technische context
- [Robinhood contracts](https://docs.robinhood.com/chain/contracts/) — canonieke contractadressen
- [Revert security](https://docs.revert.finance/revert/resources/security) — audits en risicokader
- [Uniswap IL](https://support.uniswap.org/hc/en-us/articles/20904453751693-What-is-Impermanent-Loss) — impermanent loss

## Canonieke chaingegevens

- Robinhood Chain ID: `4663`
- WETH: `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73`
- USDG: `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`

Controleer adressen bij iedere release opnieuw tegen de officiële contractdocumentatie.

## Naar live data migreren

Implementeer een nieuwe `DashboardDataProvider` in `lib/data`, bijvoorbeeld `live.ts`, en laat `lib/data/index.ts` op basis van `DATA_SOURCE` de juiste provider kiezen. Normaliseer alle upstreamvelden naar `DashboardData`; UI-componenten mogen geen bronspecifieke responsevormen kennen.

Aanbevolen pipeline:

1. Haal StonksOnChain-ranking en Rialto-assets op.
2. Haal Revert-pools voor `network=Robinhood` en `RWA=true` op.
3. Controleer tokenadressen tegen Rialto/Robinhood; symbol matching alleen is onvoldoende.
4. Behoud uitsluitend pools met het canonieke USDG- of WETH-adres.
5. Bereken 1d/7d/30d bruto fee-APR uit fees en actieve TVL.
6. Voer validatie en anomaliedetectie uit.
7. Schrijf een gedateerde, immutable snapshot; serveer nooit een halfgevulde ingest.

## Validatieregels

- Verwerp niet-eindige, negatieve of absurd grote waarden.
- Markeer volume/TVL-ratio’s boven een configureerbare grens voor review.
- Vereis `fees ≈ volume × feeTier`; grote afwijkingen blokkeren publicatie.
- Gebruik actieve TVL als APR-noemer; markeer wanneer alleen totale TVL beschikbaar is.
- Label pools jonger dan 30 dagen als `partial-history`.
- Cap APR-input in de opportunityscore; bewaar de ruwe waarde voor weergave.
- Sla bron-URL, contractadres, chain ID en extractietijd op.

Een waargenomen PACK/THROBBIN-rij met circa `$1,50 × 10^41` volume maar slechts `$6.188` fees is bewust uitgesloten: dit is een voorbeeld van waarom een numeriek veld zonder kruisvalidatie niet publiceerbaar is.

## APR en IL

Revert fee-APR is **bruto** en sluit divergence loss uit. De IL-kolom bevat handmatige 30-daagse scenariobanden op basis van de volatiliteitsklasse van het pair. Voor live gebruik moet een simulator historische of geïmpliceerde volatiliteit, gekozen prijsrange, hedge, rebalancefrequentie en gas meenemen.

Richtwaarden uit de snapshot:

- gevestigde Stock/USDG-pools: planning circa 40–180% bruto, 20–120% netto in gunstige regimes;
- Stock/WETH: hogere fee-potentie, maar veel hogere relatieve volatiliteit;
- pure memecoin LP: waargenomen bruto fee-APR circa 650–3.850%, met potentieel totaalverlies.

Dit zijn geen garanties. Yield kan binnen uren verdwijnen wanneer volume, prijs of actieve liquiditeit verandert.

## Refresh en caching

`GET /api/dashboard` gebruikt `Cache-Control: no-store`. Voor productie is het verstandiger de ingest asynchroon te draaien en de laatste gevalideerde snapshot via een database of object store te serveren. Gebruik geen pagina-request om drie fragiele scrapers synchroon aan te roepen.

## Onderhoudschecklist

- Dagelijks: contractallowlist, poolstatus en datavalidatie.
- Per ingest: schema- en anomaliechecks.
- Wekelijks: risicoscore en IL-aannames herijken.
- Maandelijks: upstreamvoorwaarden, audits en chain-governance controleren.
