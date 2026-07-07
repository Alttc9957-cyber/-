# B0 Module Architecture

Date: 2026-07-07

## Goal

B0 starts the modular split without changing the workbench entrypoint or replacing the quote flow. The old `app.js` remains the page orchestrator, while stable configuration and pure domain rules move into small browser/CommonJS-compatible modules.

## Why This Shape

- Keep `http://127.0.0.1:8787/` and `index.html` script loading unchanged.
- Avoid a full React/Vite rewrite during V1 hardening.
- Make every extracted module testable in Node and callable in the browser.
- Preserve a direct rollback path: remove the new script tags and restore the old constants if needed.

## Current Module Boundary

```text
public/js/
  shared/
    app-config.js
  entities/
    itinerary/
      attraction-matching.js
  domain/
    quote/
    product/
    events/
  agent/
  adapters/
```

### `shared/app-config.js`

Owns stable application configuration:

- service order and service labels
- product and supplier categories
- product status and field type options
- route city aliases and coordinates
- supplier category metadata
- import summary metadata
- currency rates

`app.js` now reads these values from `window.YouyixingAppConfig`.

### `entities/itinerary/attraction-matching.js`

Owns attraction text rules:

- English attraction alias standardization
- Chinese attraction aliases, such as `故宫 -> 故宫博物院`
- free landmark detection, such as `天安门广场` and `外滩`
- transfer-only day detection
- ticket-name normalization and equivalence checks

`app.js` now uses this module before generating ticket quote rows.

## Small Fixes Included In B0

- Product library ticket groups now expose an expandable price detail table.
- Product and supplier table widths were reduced to keep more content on one screen.
- Supplier management no longer exposes the dev-facing placeholder cleanup button on the OP page.
- Supplier list rendering now shows core fields instead of a 15-column operations/debug table.
- Customer proposals default to itemized sell-price display.
- Boss/admin can confirm and export a test preview when costs are missing; formal order conversion remains blocked.
- Transfer-only arrival/check-in days no longer generate ticket rows.
- Free landmarks are not treated as paid ticket resources.

## Next Extraction Targets

1. `features/product-library`: table renderers, ticket group expansion, product filters.
2. `features/supplier-manager`: supplier list, detail drawer/modal, import/export UI.
3. `entities/quote`: missing-cost gate, quote row summaries, proposal visibility rules.
4. `features/proposal`: customer proposal renderers and export guards.

## Guardrails

- Do not move mutable state into modules until the related feature has tests.
- Do not change quote calculation and UI layout in the same extraction unless the test target is explicit.
- Keep modules dual-compatible: browser global plus CommonJS export.
- `app.js` should shrink through extraction, not regain new business rules.
