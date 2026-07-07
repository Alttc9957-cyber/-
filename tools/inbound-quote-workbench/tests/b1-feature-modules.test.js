const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const productTableView = require("../public/js/features/product-library/product-table-view.js");
const supplierListView = require("../public/js/features/supplier-manager/supplier-list-view.js");
const customerPreferences = require("../public/js/entities/customer/customer-preferences.js");
const vehicleRecommendation = require("../public/js/entities/transport/vehicle-recommendation.js");

test("B1 feature modules load before app.js", () => {
  const productIndex = indexHtml.indexOf("features/product-library/product-table-view.js");
  const supplierIndex = indexHtml.indexOf("features/supplier-manager/supplier-list-view.js");
  const customerIndex = indexHtml.indexOf("entities/customer/customer-preferences.js");
  const vehicleIndex = indexHtml.indexOf("entities/transport/vehicle-recommendation.js");
  const appIndex = indexHtml.indexOf("app.js?v=20260707-b1-modules");
  assert.ok(customerIndex > 0 && customerIndex < appIndex);
  assert.ok(vehicleIndex > 0 && vehicleIndex < appIndex);
  assert.ok(productIndex > 0 && productIndex < appIndex);
  assert.ok(supplierIndex > 0 && supplierIndex < appIndex);
});

test("product table module renders expandable ticket specs and price ranges", () => {
  const entry = {
    category: "景点门票",
    items: [
      { spec: "景区门票", cost: 40, sale: 60, supplierName: "A票务" },
      { spec: "缆车往返", cost: 100, sale: 140, supplierName: "B票务" },
    ],
  };
  const html = productTableView.renderTicketGroupSpecs(entry, {
    productCostValue: (item) => item.cost,
    productSaleValue: (item) => item.sale,
    productSupplierName: (item) => item.supplierName,
  });
  assert.match(html, /展开价格明细/);
  assert.match(html, /缆车往返/);
  assert.equal(productTableView.ticketGroupCountBadge(entry).trim(), `<span class="small-badge">2个票种</span>`);
  assert.match(productTableView.productPriceRangeDisplay([40, 100], entry.items), /¥40-¥100/);
});

test("supplier list module keeps the PRD table focused on core fields", () => {
  const html = supplierListView.renderSupplierListTable([
    {
      id: "SUP-DEMO-001",
      name: "北京安途车队",
      category: "包车",
      sourceType: "车队",
      city: "北京",
      serviceScope: "北京市区、机场",
      status: "启用",
      contacts: [{ name: "王调度", role: "调度", primary: true }],
      serviceDetails: [{ costPrice: 800 }],
    },
  ], {
    minSupplierCost: () => 800,
    supplierValidityText: () => "有效",
  });
  assert.match(html, /北京安途车队/);
  assert.match(html, /城市 \/ 范围/);
  assert.doesNotMatch(html, /历史服务次数/);
});

test("Eva preference guard does not infer halal meals without explicit text", () => {
  const evaText = "Eva Perez from Spanish agency, 2 adults, 14 days, Beijing Xian Zhangjiajie Guilin Shanghai, English guide, 4 star hotel.";
  assert.equal(customerPreferences.mealPreferenceFromText(evaText), "");
  assert.equal(customerPreferences.normalizeMealPreference("清真餐", evaText), "");
  assert.equal(customerPreferences.normalizeMealPreference("清真餐", `${evaText} halal meals required`), "清真餐");
});

test("multi-city long trips default to airport pickup and dropoff", () => {
  assert.equal(customerPreferences.shouldDefaultTransferIncluded({
    rawText: "14 days China tour",
    serviceDays: 14,
    cities: ["北京", "西安", "桂林", "上海"],
    services: {},
  }), true);
  assert.equal(customerPreferences.normalizeTransferNeed("", {
    rawText: "no transfer needed",
    serviceDays: 14,
    cities: ["北京", "上海"],
  }), "");
});

test("long trip with guide recommends 7-seat vehicle for two travelers", () => {
  const plan = vehicleRecommendation.recommendVehiclePlan({
    people: 2,
    hasGuide: true,
    hasDriver: true,
    serviceDays: 14,
    luggage: "未知",
    preference: "舒适",
  });
  assert.equal(plan.vehicleType, "7座车");
  assert.match(plan.reason, /14天长线行李空间/);
});
