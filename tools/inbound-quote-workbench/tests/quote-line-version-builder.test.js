const assert = require("node:assert/strict");
const test = require("node:test");

const { buildQuoteLineFromCandidate } = require("../public/js/domain/quote/quote-line-builder.js");
const { buildQuoteVersion } = require("../public/js/domain/quote/quote-version-builder.js");

test("candidate 可以生成 quote line 并自动计算 margin", () => {
  const line = buildQuoteLineFromCandidate({
    id: "CAND-1",
    requirementItemId: "REQ-1",
    title: "重庆接送机 7座",
    serviceType: "接送机",
    cost: 250,
    salePrice: 450,
    currency: "CNY",
    rawProductSnapshot: { id: "V-1" },
  }, { quantity: 2, createdBy: "sales-1" });
  assert.equal(line.totalCost, 500);
  assert.equal(line.totalSale, 900);
  assert.equal(line.margin, 400);
  assert.equal(line.productSnapshot.id, "V-1");
});

test("quote lines 可以生成 quote version totals", () => {
  const lines = [
    buildQuoteLineFromCandidate({ id: "C1", requirementItemId: "R1", title: "车", cost: 250, salePrice: 450 }, { quantity: 1 }),
    buildQuoteLineFromCandidate({ id: "C2", requirementItemId: "R2", title: "导游", cost: 860, salePrice: 1200 }, { quantity: 1 }),
  ];
  const version = buildQuoteVersion("Q-1", lines, { versionNo: 2, status: "submitted", productCatalogVersion: "batch-1" });
  assert.equal(version.versionNo, 2);
  assert.equal(version.status, "submitted");
  assert.equal(version.totals.totalCost, 1110);
  assert.equal(version.totals.totalSale, 1650);
  assert.equal(version.totals.grossMargin, 540);
  assert.equal(version.productCatalogVersion, "batch-1");
});
