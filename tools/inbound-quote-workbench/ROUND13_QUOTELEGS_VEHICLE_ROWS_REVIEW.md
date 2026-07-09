# ROUND13_QUOTELEGS_VEHICLE_ROWS_REVIEW

## Scope

This round only fixed cross-city vehicle quote row generation and the city carry-over bug. It did not refactor the quote flow, rebuild product matching, or touch image/PDF export.

## Problem Found

Before this patch, vehicle costs were effectively aggregated by itinerary day. When one itinerary day had multiple `quoteLegs`, such as Chengdu dropoff plus Chongqing pickup, the quote detail could collapse those legs into one row or use the wrong day city.

There was a second linked bug: after a cross-city day, later local itinerary days could inherit the previous city transition and generate duplicate transfer legs. Example: a normal Chongqing local tour day could become another Chengdu-to-Chongqing transfer, which then made vehicle matching use the wrong city.

## Code Changes

- `app.js:51496` `detectTransferSegment()` now requires an actual traffic keyword before creating a cross-city transfer segment.
- `app.js:51838` `inferTrafficNode()` no longer auto-generates cross-city traffic labels from city difference alone.
- `app.js:52961` added `buildVehicleRowFromLeg()` so each `quoteLeg` becomes its own vehicle quote row.
- `app.js:53015` added `buildVehicleRowsForDay()` for sendoff, pickup, station transfer, and local tour rows.
- `app.js:53023` added `hasVehicleLegRow()` so first-day pickup / last-day dropoff fallback rows do not duplicate existing quoteLeg rows.
- `app.js:53168` updated manual override matching for vehicle rows using `quoteLegId` and leg identity instead of only row index.
- `app.js:53282` updated vehicle table rendering to display the row's own city, label, cost source, and supplier.
- `app.js:53449` and `app.js:53499` updated row lookup and product binding to use vehicle row identity and row-level city/service data.

## Adversarial Case

Input:

- 4 people
- Day 1: Chengdu airport dropoff, fly to Chongqing, Chongqing airport pickup
- Day 2: Chongqing local one-day tour, 8 hours
- Vehicle model: 7 seats

Expected behavior:

- Chengdu dropoff is one vehicle row.
- Chongqing pickup is one vehicle row.
- Chongqing local tour is one vehicle row.
- Day 2 must not create another Chengdu dropoff / Chongqing pickup pair.

Observed after patch:

| Row | City | Service Type | Route / Label | Cost | Source | Supplier | Status |
|---|---|---|---|---:|---|---|---|
| 1 | 成都 | 接送机 | 成都送机 | 250 | 成都接送机 双流机场 7座 | 待绑定供应商 | matched |
| 2 | 重庆 | 接送机 | 重庆接机 | 250 | 重庆接送机 接送机 7座 | 待绑定供应商 | matched |
| 3 | 重庆 | 包车 | 重庆本地游 | 700 | 重庆包车 市内一日游8小时 7座 | 待绑定供应商 | matched |

Total vehicle cost: 1200.

Day 2 `transferSegment` is `null`, so the duplicated cross-city segment is gone.

## Verification

- `node --check app.js`
- `node --check server.js`
- `git diff --check -- app.js`
- `curl -I --max-time 2 http://127.0.0.1:8792/` returned `HTTP/1.1 200 OK`.
- Browser validation on `http://127.0.0.1:8792/` passed with the adversarial case above.

## Remaining Risks

- Image export and PDF download are still untouched.
- Big traffic cost still follows the existing missing-cost logic.
- The first cross-city day still uses the destination city as the stay city, which matches the current itinerary model. Vehicle rows themselves now carry the correct source and destination service cities.
