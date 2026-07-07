const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

process.env.VERCEL = "1";
process.env.MANUAL_PRODUCT_RESOURCES_PATH = path.join(require("node:os").tmpdir(), `youyixing-manual-product-resources-${process.pid}.json`);
process.env.PRODUCT_REVIEW_ITEMS_PATH = path.join(require("node:os").tmpdir(), `youyixing-product-review-items-${process.pid}.json`);
const server = require("../server.js");

const manualStorePath = process.env.MANUAL_PRODUCT_RESOURCES_PATH;
const reviewStorePath = process.env.PRODUCT_REVIEW_ITEMS_PATH;

function withManualStoreBackup(fn) {
  return async () => {
    const existed = fs.existsSync(manualStorePath);
    const backup = existed ? fs.readFileSync(manualStorePath, "utf8") : "";
    const reviewExisted = fs.existsSync(reviewStorePath);
    const reviewBackup = reviewExisted ? fs.readFileSync(reviewStorePath, "utf8") : "";
    try {
      await fn();
    } finally {
      if (existed) fs.writeFileSync(manualStorePath, backup);
      else if (fs.existsSync(manualStorePath)) fs.unlinkSync(manualStorePath);
      if (reviewExisted) fs.writeFileSync(reviewStorePath, reviewBackup);
      else if (fs.existsSync(reviewStorePath)) fs.unlinkSync(reviewStorePath);
    }
  };
}

test("报价台缺成本补录归一为待审核产品资源，不能直接发布", () => {
  const resource = server.normalizeQuoteProductResourcePayload({
    category: "用车",
    item: {
      city: "重庆",
      route: "武隆一日游",
      serviceType: "包车",
      model: "17座车",
      costPrice: 1500,
      salePrice: 1800,
      supplierName: "OP补录供应商",
    },
    quoteRow: { legLabel: "重庆武隆往返", charterCost: 1500 },
    actor: "op",
    projectId: "Q-1",
  });

  assert.equal(resource.category, "用车");
  assert.equal(resource.city, "重庆");
  assert.equal(resource.service_type, "包车");
  assert.equal(resource.model, "17座车");
  assert.equal(resource.cost_price, 1500);
  assert.equal(resource.is_published, false);
  assert.equal(resource.status, "OP补录待复核");
  assert.equal(resource.published_version, "");
  assert.match(resource.source_key, /quote-manual/);
});

test("报价台补录资源先进入待审核区，不会被正式产品库筛选", withManualStoreBackup(async () => {
  const resource = server.normalizeQuoteProductResourcePayload({
    category: "导游",
    item: {
      city: "成都",
      language: "英语",
      fullDayCost: 800,
      salePrice: 1000,
      supplierName: "成都英语导游",
    },
    quoteRow: { serviceCost: 800 },
  });

  const review = server.upsertProductResourceReview({
    resource,
    actor: { role: "op", userId: "op-a" },
  });
  const reviews = server.readProductResourceReviews();
  const saved = server.upsertManualProductResource(resource);
  const rows = server.readManualProductResources();
  const filtered = server.filterManualProductResources(rows, { category: "导游", city: "成都" });

  assert.ok(review.id);
  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].status, "pending_review");
  assert.ok(saved.id);
  assert.equal(saved.is_published, false);
  assert.equal(filtered.length, 0);
}));

test("老板审核通过后，补录资源才可进入正式产品库筛选", withManualStoreBackup(async () => {
  const resource = {
    ...server.normalizeQuoteProductResourcePayload({
      category: "导游",
      item: {
        city: "成都",
        language: "英语",
        fullDayCost: 800,
        salePrice: 1000,
        supplierName: "成都英语导游",
      },
      quoteRow: { serviceCost: 800 },
    }),
    status: "已复核可报价",
    is_published: true,
    published_version: "quote-manual-v1",
  };

  server.upsertManualProductResource(resource);
  const rows = server.readManualProductResources();
  const filtered = server.filterManualProductResources(rows, { category: "导游", city: "成都" });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].cost_price, 800);
  assert.equal(filtered[0].is_published, true);
}));
