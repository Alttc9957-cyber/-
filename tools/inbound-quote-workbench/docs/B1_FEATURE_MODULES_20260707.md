# B1 Feature Modules

Date: 2026-07-07

## Goal

B1 continues the strangler-style split started in B0. The goal is not to rewrite the quote workbench, but to move feature rendering and small pure business rules out of `app.js` while keeping the current OP workflow intact.

## Modules Added

```text
public/js/
  entities/
    customer/customer-preferences.js
    transport/vehicle-recommendation.js
  features/
    product-library/product-table-view.js
    supplier-manager/supplier-list-view.js
```

### `features/product-library/product-table-view.js`

Owns product-library table presentation that does not need page state:

- ticket group count badges
- expandable ticket-spec detail table
- cost and reference-sale price range display

`app.js` still owns data lookup and product matching. It passes existing helper functions into this module.

### `features/supplier-manager/supplier-list-view.js`

Owns the supplier list table renderer:

- core PRD fields only
- selected-row state through `activeSupplierId`
- actions remain as data attributes so `app.js` keeps event binding

Supplier data fetching, editing, toggling and detail rendering remain in `app.js` for now.

### `entities/customer/customer-preferences.js`

Owns conservative customer preference rules:

- meal preference must be explicitly present in the customer text
- AI-returned halal/vegetarian values are cleared if the source text does not support them
- multi-city or long-trip cases default to airport pickup/dropoff unless transfer is explicitly excluded

### `entities/transport/vehicle-recommendation.js`

Owns deterministic vehicle recommendation:

- 2 travelers plus guide/driver and long-trip luggage now recommends 7-seat vehicle
- long trips count as needing luggage space
- reason text records the seat-demand basis

## Small Bugs Fixed

- Eva case no longer accepts hallucinated `清真餐` when the raw customer text has no dietary preference.
- 14-day / multi-city cases default to `接送机` unless the customer explicitly excludes transfer.
- 2 travelers + guide + driver + long-trip luggage recommends `7座车` instead of `5座车`.
- `生成报价草稿` now wraps long AI steps in timeouts and restores the button label safely.
- `isTransferOnlyDayText` no longer keeps a second full implementation in `app.js`; it delegates to the itinerary entity module.

## Verification

- `node --check app.js`
- `node --check server.js`
- `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check`
- `node --test tests/*.test.js`

## Still Not Done

- Service-side role/session authentication is still a larger A/B boundary item, not fixed in B1.
- Supplier detail should still move from the right panel to a drawer/modal later.
- Customer proposal traffic descriptions still need the next pass to become shorter date/city segments.
