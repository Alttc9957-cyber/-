const assert = require("node:assert/strict");
const test = require("node:test");

const core = require("../quotable-resource-core.js");

const today = "2026-07-03";

function supplier(category, detail, extra = {}) {
  return {
    id: `SUP-${category}`,
    name: `${category}供应商`,
    category,
    city: detail.city || detail.fromCity || "北京",
    serviceScope: detail.city || detail.fromCity || "北京",
    status: extra.status || "启用",
    contacts: [
      { name: "主联系人", role: "销售", phone: "13800000000", primary: true },
      { name: "备用联系人", role: "调度", phone: "13900000000", primary: true },
    ],
    serviceDetails: [{ id: `SD-${category}`, ...detail }],
    updatedAt: "2026-07-01",
    ...extra,
  };
}

const suppliers = [
  supplier("包车", { city: "重庆", serviceCategory: "武隆包车", routeName: "重庆武隆一日游", vehicleModel: "14座车", packageCostPrice: 1500, packageSalePrice: 1900, validTo: "2027-01-01" }),
  supplier("酒店", { city: "北京", roomTypeName: "双床房", hotelLevel: "舒适型", costPrice: 420, salePrice: 560, validTo: "2027-01-01" }),
  supplier("导游", { city: "北京", languages: "English", dailyCostPrice: 500, salePrice: 700, validTo: "2027-01-01", rawFields: { 登记语种: "English" } }),
  supplier("门票", { city: "北京", attractionName: "故宫博物院", ticketTypeName: "景区门票", costPrice: 40, salePrice: 60, validTo: "2027-01-01" }),
  supplier("大交通", { city: "北京", trafficType: "票务服务", agentScope: "全国火车票", costPrice: 20, salePrice: 30, validTo: "2027-01-01" }),
  supplier("餐", { city: "北京", restaurantName: "北京烤鸭餐厅", mealStandardName: "团队餐标", perPersonCost: 90, perPersonSale: 130, validTo: "2027-01-01" }),
  supplier("特色体验", { city: "北京", experienceName: "胡同非遗体验", audience: "成人", costPrice: 180, salePrice: 260, validTo: "2027-01-01" }),
  supplier("其他", { city: "北京", name: "耳麦租赁", billingMethod: "按人", costPrice: 8, salePrice: 12, validTo: "2027-01-01" }),
  supplier("包车", { city: "重庆", serviceCategory: "接送机", routeName: "重庆机场接机", vehicleModel: "7座车", packageCostPrice: 250, packageSalePrice: 450, validTo: "2027-01-01" }, { id: "SUP-DISABLED", name: "停用车队", status: "停用" }),
];

test("normalizes contacts to exactly one primary contact", () => {
  const contacts = core.normalizeContacts(suppliers[0].contacts);
  assert.equal(contacts.filter((contact) => contact.primary).length, 1);
  assert.equal(contacts[0].primary, true);
});

test("normalizes supplier service detail prices and preserves guide registration fields", () => {
  const charter = core.normalizeServiceDetail({ serviceCategory: "市内包车", vehicleModel: "14座车", packageCostPrice: "1,500", packageSalePrice: "1900" }, "包车");
  assert.equal(charter.costPrice, 1500);
  assert.equal(charter.referencePrice, 1900);
  assert.equal(charter.vehicleModel, "14座~17座");

  const guide = core.normalizeServiceDetail({ languages: "English", dailyCostPrice: 500, rawFields: { license: "A1" } }, "导游");
  assert.equal(guide.languages, "英语");
  assert.deepEqual(guide.originalRegistrationFields, { license: "A1" });
});

test("builds enabled quotable resources and excludes disabled suppliers", () => {
  const resources = core.buildQuotableResources({ suppliers, today });
  assert.equal(resources.length, 8);
  assert.equal(resources.some((resource) => resource.supplierId === "SUP-DISABLED"), false);
  assert.equal(new Set(resources.map((resource) => resource.category)).size, 8);
});

test("computes price status", () => {
  assert.equal(core.priceStatus("", "", today), "no_validity");
  assert.equal(core.priceStatus("", "2026-07-20", today), "expiring_soon");
  assert.equal(core.priceStatus("", "2026-07-02", today), "expired");
  assert.equal(core.priceStatus("", "2027-01-01", today), "valid");
});

test("matches each supplier category with deterministic scoring", () => {
  const resources = core.buildQuotableResources({ suppliers, today });
  const cases = [
    [{ category: "包车", city: "重庆", serviceCategory: "包车", vehicleModel: "14座车", routeName: "武隆" }, 1500],
    [{ category: "酒店", city: "北京", roomType: "双床房" }, 420],
    [{ category: "导游", city: "北京", language: "英语" }, 500],
    [{ category: "门票", city: "北京", keyword: "故宫" }, 40],
    [{ category: "大交通", city: "北京", keyword: "火车票" }, 20],
    [{ category: "餐", city: "北京", keyword: "烤鸭" }, 90],
    [{ category: "特色体验", city: "北京", keyword: "非遗" }, 180],
    [{ category: "其他", city: "北京", keyword: "耳麦" }, 8],
  ];
  cases.forEach(([request, expectedCost]) => {
    const result = core.matchQuotableResources(request, resources);
    assert.notEqual(result.matchStatus, "unmatched", JSON.stringify(request));
    assert.equal(result.selected.costPrice, expectedCost, JSON.stringify(request));
  });
});

test("creates quote line snapshot and hides cost in customer view", () => {
  const [resource] = core.buildQuotableResources({ suppliers: [suppliers[0]], today });
  const snapshot = core.createQuoteLineSnapshot(resource, { selectedBy: "op" });
  assert.equal(snapshot.supplierServiceDetailId, "SD-包车");
  assert.equal(snapshot.costPriceSnapshot, 1500);
  assert.equal(snapshot.costSource, "供应商服务明细");

  const publicSnapshot = core.publicQuoteLineSnapshot(snapshot, "viewer", "customer");
  assert.equal("costPriceSnapshot" in publicSnapshot, false);
  assert.equal("costSource" in publicSnapshot, false);
  assert.equal(publicSnapshot.referencePriceSnapshot, 1900);
});
