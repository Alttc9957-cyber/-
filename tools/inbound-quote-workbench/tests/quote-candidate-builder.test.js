const assert = require("node:assert/strict");
const test = require("node:test");

const { normalizeQuoteRequirementItem } = require("../public/js/domain/quote/quote-requirement-normalizer.js");
const { buildQuoteCandidates } = require("../public/js/domain/quote/quote-candidate-builder.js");

test("正常产品能生成候选并给出匹配原因", () => {
  const requirement = normalizeQuoteRequirementItem({
    id: "REQ-1",
    city: "重庆",
    serviceType: "接送机",
    vehicleType: "7座车",
    productHints: ["机场"],
    date: "2026-07-10",
  });
  const products = [
    { id: "V-1", category: "用车", city: "重庆", name: "重庆接送机 7座", serviceType: "接送机", model: "7座", costPrice: 250, salePrice: 450, route: "机场" },
  ];
  const result = buildQuoteCandidates(requirement, products);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].cost, 250);
  assert.equal(result.candidates[0].matchReasons.some((item) => item.includes("城市匹配")), true);
});

test("缺成本产品会产生 MISSING_COST warning", () => {
  const requirement = normalizeQuoteRequirementItem({ id: "REQ-2", city: "北京", serviceType: "酒店", hotelLevel: "4星舒适型" });
  const products = [{ id: "H-1", category: "酒店", city: "北京", name: "北京参考酒店", star: "4星舒适型", costPrice: "" }];
  const result = buildQuoteCandidates(requirement, products);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.warnings.some((item) => item.code === "MISSING_COST"), true);
});

test("过期产品会产生 PRICE_EXPIRED warning", () => {
  const requirement = normalizeQuoteRequirementItem({ id: "REQ-3", city: "北京", serviceType: "导游", language: "英语", date: "2026-07-10" });
  const products = [{ id: "G-1", category: "导游", city: "北京", name: "英语导游服务", language: "英语", costPrice: 860, validTo: "2026-07-01" }];
  const result = buildQuoteCandidates(requirement, products);
  assert.equal(result.candidates.length, 1);
  assert.equal(result.warnings.some((item) => item.code === "PRICE_EXPIRED"), true);
});

test("没有候选时返回 NO_PRODUCT_CANDIDATE", () => {
  const requirement = normalizeQuoteRequirementItem({ id: "REQ-4", city: "上海", serviceType: "用车" });
  const result = buildQuoteCandidates(requirement, [{ id: "V-2", category: "用车", city: "北京", costPrice: 100 }]);
  assert.equal(result.candidates.length, 0);
  assert.equal(result.warnings[0].code, "NO_PRODUCT_CANDIDATE");
});
