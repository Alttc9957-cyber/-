# Inbound Quote Workbench MVP Acceptance

Date: 2026-06-25

## Implemented

- Original browser-ready workspace preserved under `tools/inbound-quote-workbench/`.
- Original source tag: `v0.0.1-original`.
- Development branch: `feature/intelligent-quote-mvp`.
- DeepSeek-backed local Agent proxy at `POST /api/agent`.
- Right-side AI Agent sidebar on quote project detail page.
- Agent pending-result workflow: outputs are shown first, OP applies them explicitly.
- Customer demand recognition through DeepSeek.
- Route draft generation through DeepSeek.
- Route confirmation writes itinerary into the existing manual itinerary editor.
- Quote item extraction through DeepSeek.
- Agent quote items seed the existing quote calculation flow.
- Local cleaned product resources copied into `tools/inbound-quote-workbench/data/`.
- Runtime data loader merges cleaned tickets, vehicles, guides, hotels, historical routes, and pricing rules.
- Existing quote engine calculates cost, sale price, margin, average price, and missing-cost warnings.
- English customer quote preview generation through DeepSeek.
- Customer preview hides cost, margin, supplier contacts, and internal notes.
- Quote version saving.
- PDF and image export buttons on the proposal page.

## Verified Flow

Tested in the local browser at `http://127.0.0.1:8787`:

```text
Open quote project
↓
Run DeepSeek demand recognition
↓
Apply customer fields
↓
Generate route draft with DeepSeek
↓
Confirm route into itinerary editor
↓
Extract quote items with DeepSeek
↓
Apply quote items to quote tables
↓
Calculate quote from product resources
↓
Generate English customer quote preview
↓
Save quote version
↓
Click PDF and image export
```

## Data Verification

Runtime product resource counts after loading cleaned local data:

- Tickets: 239
- Vehicles: 1019
- Guides: 56
- Hotels: 318
- Experiences: 69
- Meals: 151
- Route products: 24

## Remaining Known Limits

- OP / operation-cost calculation still needs a confirmed business rule.
- If product data lacks a cost, the system marks it as missing and keeps manual editing available.
- Some quote items such as specialty experiences and domestic traffic still need better resource mapping when the cleaned data has no direct match.
- Homepage task board remains close to the original project board because it was deprioritized for the first MVP.
- `.env` is required locally for real DeepSeek calls and is intentionally ignored by Git.

## Run

```bash
cd /Users/alic/Documents/codex/youyixing-quote-system/tools/inbound-quote-workbench
cp .env.example .env
# fill DEEPSEEK_API_KEY in .env
node server.js
```

Then open:

```text
http://127.0.0.1:8787
```
