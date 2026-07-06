# Report

## Phase

友易行阶段 1：智能报价闭环上线版。

## Current Status

- Status: phase1_online_data_foundation_done_pending_user_acceptance
- Started: 2026-07-06
- Main acceptance case: Majfuza Sultana / Bangladesh agency / 10 adults + 1 child / Kunming + Chongqing + Chengdu / With guide and without guide.

## 2026-07-06 Correction After User Review

- User review found the previous implementation was not acceptable because it replaced too much of the good first-version main flow.
- Restored DeepSeek as the main route and demand-understanding path. Local phase 1 rules now only provide hard-field validation, fallback and adversarial checks.
- Removed the local route-priority behavior that caused English itinerary text to dominate the OP itinerary table.
- Removed the quote scoping behavior that narrowed quotation rows to Day 2 and Day 3 by zeroing unrelated services. The quote table should match product/resource data across the confirmed itinerary.
- Changed internal option names back to Chinese for OP-facing screens: `方案A：含导游` and `方案B：不含导游`; English labels are only mapped in the customer-facing English proposal.
- Locked deterministic guide-language fields so the Majfuza case does not turn an English-guide requirement into Spanish.
- Added the V1 release direction into system memory: data infrastructure must become the first-version release foundation before claiming production readiness.

## 2026-07-06 Customer Proposal Rendering Correction

- User review found the customer-facing quote sheet still exposed staff-facing structure: option numbers, quote scope, adult average and suggested-itinerary wording.
- Customer quote table now only shows guide service type and total price: `含导游 / 不含导游 + 总价`.
- Customer proposal itinerary text now removes internal draft wording such as `建议行程`、`建议游览`、`推荐行程`、`please suggest` and `Suggested itinerary`.
- Staff-facing quote versions and cost-review fields remain internal and are not removed from OP views.

## 2026-07-06 Product Resource Memory Correction

- User clarified the first customer online version must make quote calculation and product library usage fully usable before later modules.
- Deferred later large modules from this phase: Xiaoyi intelligent quote assistant expansion, boss OP management center, supplier-side full field redesign, new front-end UI system and permission-specific UI templates.
- Added `app.manifest.json` as the first application map, separating `ai-gateway`, `customer-demand`, `itinerary`, `product-catalog`, `quote-engine`, `cost-review` and `proposal` responsibilities.
- Generalized the model provider config: DeepSeek remains the default template, but customer deployment can use its own OpenAI-compatible endpoint through `AI_*` environment variables. Front-end status remains masked.
- Added server API `POST /api/product-resources/upsert-from-quote`.
- Missing quote cost filled by OP now writes a reusable product resource:
  - writes to Supabase `product_resources` when configured;
  - falls back to `data/manual-product-resources.json` when cloud config is absent or cloud write fails;
  - marks source as quote manual backfill and status as `OP补录待复核`;
  - is returned by product-resource query APIs and used by later match calls.
- Local manual resources are merged with cloud resources in both query and match APIs, so first-version use can self-complete the product library instead of relying on hard imports only.
- Customer-facing quote output remains separated from staff-facing cost, review and suggestion fields.

## Source Documents Read

- `/Users/alic/Downloads/youyixing_phase1_prd.md`
- `/Users/alic/Downloads/youyixing_phase1_codex_instruction.md`
- `CLAUDE.md`
- `docs/PROJECT_STATUS.md`
- `docs/FEATURE_MAP.md`
- `docs/NEXT_ACTIONS.md`
- `docs/BUG_LOG.md`
- `docs/QA_CHECKLIST.md`
- `docs/ARCHITECTURE_CURRENT.md`
- `docs/DATABASE_PHASE_1_DRAFT.md`
- `docs/QUOTE_ENGINE_CONTRACT.md`
- `docs/QUOTE_ACCEPTANCE_REPORT.md`

## Baseline Notes

- Existing app shape: single-page workbench with `index.html`、`app.js`、`styles.css`、`server.js`.
- Existing quote domain modules are pure-function/test boundaries and do not fully own the old `app.js` quote flow.
- Existing project docs still warn that order, permission and boss dashboard are not formal production features. This phase will implement a light verifiable closed loop without pretending backend RLS or full ERP is complete.
- Existing user/worktree changes before this phase: `docs/DEV_LOG.md`、`docs/NEXT_ACTIONS.md`、`docs/SOP/README.md` already modified. This phase must append around them and not overwrite.

## Completed

- Created phase 1 goal tracking directory and files.
- Added deterministic Phase 1 demand parser for Majfuza-style multi-channel text.
- Added customer fields for travel agency and child ages, plus expanded source options.
- Kept DeepSeek as the main recognition path, with phase 1 parser output used as validation/fallback for hard customer fields such as date, traveler count, hotel/train exclusions and guide language.
- Added deterministic 10-day route extraction tests and helpers, but this local route output must not override the AI route recommendation in the OP main flow.
- Kept the existing OP path: `确认线路并刷新报价`.
- Reverted quote scoping that made only Day 2 and Day 3 active, because it hid product-resource matching problems instead of fixing the quote engine.
- Added Chinese OP quote versions `方案A：含导游` and `方案B：不含导游`, with English display mapping only in customer proposal output.
- Added English proposal Option comparison and local English fallback if translation API fails.
- Added customer export guard for Chinese residue and internal field leakage.
- Added product review pool for OP/manual cost fill and boss review flow.
- Added minimal order conversion with four statuses: `待确认`、`待安排`、`进行中`、`已完成`.
- Added boss basic dashboard and front-end role visibility for OP / sales / boss.
- Added phase 1 audit log for review-pool, export, order conversion and order status changes.
- Added quote missing-cost product-library publishing from the quote desk to server-side product resources.
- Added cloud + local product-resource merge for query and matching.
- Added OpenAI-compatible provider environment variables while keeping DeepSeek legacy variables compatible.
- Added an application manifest that records phase 1 boundaries and deferred future modules.

## Changed Files

- `goals/phase1-intelligent-quote-closed-loop/GOAL.md`
- `goals/phase1-intelligent-quote-closed-loop/GOALS.md`
- `goals/phase1-intelligent-quote-closed-loop/REPORT.md`
- `goals/phase1-intelligent-quote-closed-loop/ACCEPTANCE.md`
- `index.html`
- `styles.css`
- `app.js`
- `app.manifest.json`
- `.env.example`
- `server.js`
- `public/js/domain/phase1/phase1-closed-loop.js`
- `tests/phase1-closed-loop.test.js`
- `tests/product-resource-upsert-from-quote.test.js`
- `tests/a1-ui-simplification.test.js`

## Verification

- `node --check app.js` passed.
- `node --check server.js` passed.
- `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check` passed.
- `node --test tests/*.test.js` passed: 39 tests, 39 pass.
- `curl -I --max-time 2 http://127.0.0.1:8787/` passed: `HTTP/1.1 200 OK`.
- 2026-07-06 main-flow restore verification:
  - `node --check app.js` passed.
  - `node --test tests/*.test.js` passed: 37 tests, 37 pass.
  - `curl -I --max-time 2 http://127.0.0.1:8787/` passed: `HTTP/1.1 200 OK`.
  - `index.html` now serves `app.js?v=20260706-mainflow-restore` to avoid stale browser cache.
  - Code scan confirms `generateItineraryDraft` no longer returns local phase1 route output before calling DeepSeek.
  - Code scan confirms `applyPhase1QuoteScope` is no longer called by quote build/refresh paths.
- 2026-07-06 customer proposal rendering verification:
  - `node --check app.js` passed.
  - `node --test tests/*.test.js` passed: 37 tests, 37 pass.
  - `curl -I --max-time 2 http://127.0.0.1:8787/` passed: `HTTP/1.1 200 OK`.
  - `index.html` now serves `app.js?v=20260706-customer-proposal-v1` to avoid stale browser cache.
  - Code scan found no customer proposal usage of `报价方案对比`, `Option Comparison`, `Quote Scope`, `报价范围` or `quoteOptionDisplayName`.
- 2026-07-06 product-resource memory verification:
  - `node --check server.js` passed.
  - `node --check app.js` passed.
  - `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check` passed.
  - `node --test tests/*.test.js` passed: 39 tests, 39 pass.
  - HTTP validation confirmed a quote-filled vehicle resource can be written, queried and matched through product-resource APIs.
  - The temporary HTTP validation resource was then unpublished from Supabase and confirmed absent from later product-resource query results.
  - `curl -I --max-time 2 http://127.0.0.1:8787/` returned `HTTP/1.1 200 OK` after restarting the service on the current code.
- Previous browser smoke before user rejection, kept only as historical evidence and no longer accepted as current pass evidence:
  - Majfuza demand recognized as `Majfuza Sultana`, `孟加拉旅行社`, `孟加拉国`, `2026-07-12`, 10 adults, 1 child age 6, cities `昆明、重庆、成都`.
  - Hotel and train ticket services are excluded.
  - 10-day itinerary generated with Day 2 Wulong, Day 3 Chongqing city tour, Day 7 Chengdu-Kunming, Day 8 Stone Forest/Kunming, Day 10 airport drop.
  - Confirm route generated old internal names `Option A：With Guide` and `Option B：Without Guide`; this was later corrected to Chinese OP-facing names.
  - Option A browser summary: total `¥4,575`, adult average `¥430`.
  - Option B browser summary: total `¥2,500`, adult average `¥235`, guide cost `¥0`.
  - English proposal generated; browser check found no Chinese residue and no internal leakage terms.
  - Manual ticket cost `¥120` created review-pool item `武隆天生三桥门票 / 重庆 / 景点门票 / 待老板审核`.
  - Boss dashboard showed review-pool count `1 条` and the review item.

## Risks

- `app.js` is very large and remains the current business control surface; edits must stay surgical.
- The latest correction has code-level and test verification, but user-facing Majfuza browser smoke must be repeated after refresh because the previous browser evidence belonged to the rejected implementation path.
- Phase 1 requires light order, role and boss-view flows, but current backend auth/RLS is not complete. Final report must distinguish front-end control from real data security.
- Product-resource backfill now writes to Supabase or local JSON, but boss review, rollback UI and permission hardening are still future hardening work.
- LocalStorage remains only a UI draft/cache layer. Product-resource memory for first-version quote reuse is server-side Supabase or local JSON.
- Browser automation timed out around the final `成交转订单` alert; the order code path is implemented but needs a final manual smoke click during user acceptance.
- Browser automation did not complete a final file-download save for image/PDF export after the last code reload; export guard and functions remain wired, and the English proposal itself was browser-generated and checked.

## Rollback

- Remove `goals/phase1-intelligent-quote-closed-loop/`.
- Revert any later code patches file by file after checking user changes.

## Next Recommendation

- 乐哥先复验本次主流程回归：AI 推荐、中文行程、英文导游字段、报价产品库匹配、A/B 方案展示。
- Do not enter Phase 2 until user approval.
- Treat later Xiaoyi assistant, boss OP, supplier field redesign, new UI and permission templates as post-first-version modules.
- During user acceptance, manually click:
  1. `成交转订单` and confirm the order appears with status `待确认`.
  2. `确认方案` then `导出图片` / `下载 PDF` to confirm the browser download path on this machine.
