const assert = require("node:assert/strict");
const test = require("node:test");

const { summarizeQuoteSource } = require("../public/js/domain/quote/quote-display.js");

test("报价来源默认压缩为短状态，不把候选和失败原因铺在价格下方", () => {
  const meta = summarizeQuoteSource({
    source: "待补价：服务类型不匹配 / 候选资源：重庆接送机 7座",
    reason: "服务类型不匹配：接送机",
    candidates: [
      { name: "重庆接送机", model: "7座", cost: 250 },
      { name: "重庆接送机", model: "9座", cost: 350 },
    ],
  });

  assert.equal(meta.label, "未匹配");
  assert.equal(meta.level, "danger");
  assert.equal(meta.candidateCount, 2);
  assert.match(meta.detail, /候选：重庆接送机/);
  assert.doesNotMatch(meta.label, /候选资源|服务类型不匹配/);
});

test("已匹配产品库来源显示为产品库成本", () => {
  const meta = summarizeQuoteSource({
    source: "产品库 / 待绑定供应商 / 重庆接送机 7座",
    sourceType: "产品库",
    matchStatus: "matched",
  });

  assert.equal(meta.label, "产品库成本");
  assert.equal(meta.level, "ok");
});

test("缺成本来源显示待补成本但保留原始详情", () => {
  const meta = summarizeQuoteSource({
    source: "待补价 / 待绑定供应商 / 北京餐厅",
    matchStatus: "need_price",
    missingCost: true,
  });

  assert.equal(meta.label, "待补成本");
  assert.equal(meta.level, "warn");
  assert.match(meta.detail, /待补成本/);
});
