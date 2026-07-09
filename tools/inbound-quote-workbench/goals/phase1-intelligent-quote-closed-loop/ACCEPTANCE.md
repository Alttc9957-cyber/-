# Acceptance

## Main Case

Majfuza Sultana / Bangladesh travel agency:

- 10 adults.
- 1 child, age 6.
- Travel date: 2026-07-12.
- Duration: Kunming 3 nights + Chongqing 3 nights + Chengdu 3 nights.
- Daily route: Day 1 Kunming arrival / rail to Chongqing; Day 2 Wulong/Fairy Mountain/Three Natural Bridges with English guide; Day 3 Chongqing city tour optional guide; Day 4 rail to Chengdu; Day 5/6 Chengdu suggested tours; Day 7 rail back to Kunming; Day 8 Stone Forest; Day 9 Kunming city tour; Day 10 airport drop-off.
- Needs transfer, sightseeing and entrance fee.
- Does not need hotel or train ticket.
- Needs both With guide and Without guide rates.

## Must Pass

### 2026-07-06 Main-Flow Recheck Required

- [ ] After browser refresh, Majfuza recognition still starts from the DeepSeek main path, with local rules only validating/filling hard fields.
- [ ] Recommended itinerary and OP editable itinerary rows display Chinese content, not raw English route text.
- [ ] Detailed itinerary fields do not show irrelevant English text unless the original customer text is intentionally preserved in a separate raw-demand area.
- [ ] Day 2 English-speaking-guide requirement remains English-speaking guide and is not overwritten as Spanish.
- [ ] Quote table matches product/resource data from the confirmed itinerary instead of using hardcoded Day 2/Day 3-only quote scope.
- [ ] OP-facing quote options display as `方案A：含导游` and `方案B：不含导游`.
- [ ] Customer-facing English proposal can still display `Option A` / `Option B` without exposing Chinese internal labels.
- [ ] Missing resource costs are shown as missing/review-needed, not silently normalized as valid zero.
- [ ] Customer-facing quote table does not show option numbers, quote scope, adult average or internal suggestion fields.
- [ ] Customer-facing quote table shows only guide service type and total price, e.g. `含导游 / 不含导游 + 总价`.
- [ ] Customer-facing itinerary text does not show `建议行程`, `建议游览`, `推荐行程`, `please suggest` or `Suggested itinerary`.
- [x] Missing-cost backfill from quote desk writes to server-side product resource memory.
- [x] When Supabase is configured, missing-cost backfill can write to `product_resources`.
- [x] When Supabase is unavailable, missing-cost backfill writes to local persistent JSON.
- [x] Backfilled product resources are returned by product-resource query APIs.
- [x] Backfilled product resources can be used by later product-resource match calls.
- [x] DeepSeek is not hardcoded as the only deployable provider; customer deployment can use masked OpenAI-compatible `AI_*` config.
- [x] Phase 1 app boundaries are recorded in `app.manifest.json`; later Xiaoyi assistant, boss OP, supplier field redesign, new UI and permission templates are deferred.

- [x] Paste the full customer demand text.
- [x] Record source as WeChat or multi-channel customer demand text.
- [x] Recognize customer/travel agency as Majfuza Sultana / Bangladesh agency.
- [x] Recognize 10 adults + 1 child, child age 6.
- [x] Recognize travel date as 2026-07-12.
- [x] Recognize Kunming, Chongqing and Chengdu multi-city route.
- [x] Recognize roughly 10 days.
- [x] Recognize no hotel.
- [x] Recognize no train ticket.
- [x] Recognize transfers, sightseeing and entrance fees are needed.
- [x] Recognize Day 2 needs English-speaking guide.
- [x] Recognize With guide / Without guide quote options.
- [x] Show structured demand confirmation section/page.
- [x] OP can modify recognized data before quote generation.
- [x] Vehicle recommendation works for with-guide and without-guide options.
- [x] OP can modify confirmed vehicle.
- [x] Generate 10-day itinerary.
- [x] Split daily service items.
- [x] Generate internal quote table.
- [x] Missing cost is not displayed as normal 0.
- [x] OP can manually fill missing costs.
- [x] Manual cost update recalculates totals.
- [x] Manual cost can be written to reusable product resource memory and marked `OP补录待复核`.
- [x] Boss role can review product review pool item.
- [x] Generate Option A / Option B under one quote.
- [x] Internal view shows each option's cost, sale, gross margin and margin rate.
- [x] Customer view shows guide service type and total price without staff-only quote scope fields.
- [x] Generate English customer quote.
- [x] Customer quote has no obvious Chinese residue, or residue check blocks/warns before export.
- [x] Customer quote hides cost, gross margin, margin rate, supplier, contacts, internal remarks and product source.
- [~] Export PDF or long image works in browser. Implementation and guard are wired; final automated download smoke timed out before completion and needs user acceptance click.
- [~] Convert accepted quote option to order. Implementation is wired; browser automation timed out around the alert and needs user acceptance click.
- [~] Order list shows the new order after conversion. Depends on the manual conversion smoke above.
- [~] Order persists after refresh in the current dev storage. Persistence is implemented via localStorage; needs manual conversion smoke above.
- [x] Order status supports only: pending confirmation, pending arrangement, in progress, completed.
- [x] Boss basic view shows submitter, deal status, deal amount, margin rate, order status and review-pool count.
- [x] Audit log records raw demand, recognition result, OP confirmation, quote result, missing cost, export and order conversion.

## Must Not Regress

- [x] Existing quote flow still opens.
- [x] Product costs are not invented by AI.
- [x] Missing costs do not appear as normal zero.
- [x] Customer proposal does not expose internal data.
- [x] Existing domain/product/agent tests still pass.
- [x] No secrets are changed or packaged.
- [x] No database migration is executed.
- [x] No production deployment is performed.

## Commands

```bash
node --check app.js
node --check server.js
find public/js -type f -name '*.js' -print | sort | xargs -n 1 node --check
node --test tests/*.test.js
curl -I --max-time 2 http://127.0.0.1:8787/
```

## Evidence Log

- 2026-07-06: `node --check app.js` passed.
- 2026-07-06: `node --check server.js` passed.
- 2026-07-06: `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check` passed.
- 2026-07-06: `node --test tests/*.test.js` passed, 39/39.
- 2026-07-06: `curl -I --max-time 2 http://127.0.0.1:8787/` returned `HTTP/1.1 200 OK`.
- 2026-07-06: Earlier browser smoke before user rejection recognized Majfuza demand correctly: `Majfuza Sultana`, `孟加拉旅行社`, `孟加拉国`, `2026-07-12`, `10+1`, age `6`, `昆明、重庆、成都`, no hotel, no train ticket. This is historical evidence only and must be repeated after the main-flow correction.
- 2026-07-06: Earlier browser smoke generated 10-day itinerary and verified row values for Day 1-4 plus corrected Day 7-8 city-order regression via unit test. This is historical evidence only and must be repeated after the main-flow correction.
- 2026-07-06: Earlier browser smoke generated old internal names `Option A：With Guide` total `¥4,575` and `Option B：Without Guide` total `¥2,500`; OP-facing names were later corrected to Chinese.
- 2026-07-06: Earlier browser smoke generated English proposal with no Chinese residue and no internal leakage terms. This is historical evidence only and must be repeated after the main-flow correction.
- 2026-07-06: Earlier browser smoke manually filled Day 2 ticket cost `¥120` and verified boss review pool item `武隆天生三桥门票 / 重庆 / 景点门票 / 待老板审核`. This is historical evidence only and must be repeated after the main-flow correction.
- 2026-07-06: Final user acceptance needs manual click for image/PDF download and order conversion because browser automation timed out around the final alert/download path.
- 2026-07-06: User review rejected the previous main-flow behavior because the good first-version customer recognition, DeepSeek recommendation and product-resource quotation path had been overridden.
- 2026-07-06: Code correction restored DeepSeek as main recognition/route path, removed quote-scope calls from quote build/refresh, changed OP option names to Chinese, locked guide-language merge, and bumped app cache version to `20260706-mainflow-restore`.
- 2026-07-06: Correction verification passed: `node --check app.js`, `node --test tests/*.test.js` with 37/37 passing, and `curl -I --max-time 2 http://127.0.0.1:8787/` returned `HTTP/1.1 200 OK`.
- 2026-07-06: Customer proposal rendering correction removed option numbers, quote scope and suggestion wording from customer output while keeping staff quote versions internal.
- 2026-07-06: Customer proposal correction verification passed: `node --check app.js`, `node --test tests/*.test.js` with 37/37 passing, and `curl -I --max-time 2 http://127.0.0.1:8787/` returned `HTTP/1.1 200 OK`.
- 2026-07-06: Product-resource memory correction added `POST /api/product-resources/upsert-from-quote`, Supabase/local JSON write-through, local+cloud query merge and local+cloud match merge.
- 2026-07-06: Product-resource memory verification passed: `node --check server.js`, `node --check app.js`, `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check`, and `node --test tests/*.test.js` with 39/39 passing.
- 2026-07-06: HTTP validation confirmed a quote-filled vehicle resource could be written, queried and matched through product-resource APIs; the temporary validation row was then unpublished and confirmed absent from later query results.
- 2026-07-06: Restarted `http://127.0.0.1:8787/` on the current code and confirmed `HTTP/1.1 200 OK`.
