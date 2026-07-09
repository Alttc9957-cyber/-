const assert = require("node:assert/strict");
const test = require("node:test");

const { normalizeProductRemarks } = require("../public/js/domain/product/remark-atoms.js");

test("产品备注能被拆成 remarkAtoms 并保留 rawRemark", () => {
  const product = {
    id: "P-1",
    name: "故宫博物院",
    remark: "需要提前预约；节假日可能涨价",
    rawFields: {
      保票政策: "保证出票，需二次确认",
    },
  };
  const { cleanProduct, remarkAtoms } = normalizeProductRemarks(product);
  assert.equal(cleanProduct.name, "故宫博物院");
  assert.equal(cleanProduct.remark, undefined);
  assert.match(cleanProduct.rawRemark, /提前预约/);
  assert.equal(remarkAtoms.some((atom) => atom.type === "booking_policy"), true);
  assert.equal(remarkAtoms.some((atom) => atom.type === "guarantee_policy"), true);
});

test("internal_note 不会成为 customer visible", () => {
  const product = {
    id: "P-2",
    customerNote: "客人可见：请携带护照",
    internalNotes: "内部：不要给客人看，供应商电话 13800000000",
  };
  const { cleanProduct, remarkAtoms } = normalizeProductRemarks(product);
  const internal = remarkAtoms.find((atom) => atom.type === "internal_note");
  assert.equal(internal.visibility, "internal");
  assert.deepEqual(cleanProduct.customerVisibleRemarks, ["客人可见：请携带护照"]);
});
