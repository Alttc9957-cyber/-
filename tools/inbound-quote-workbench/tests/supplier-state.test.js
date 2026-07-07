const assert = require("node:assert/strict");
const test = require("node:test");

process.env.VERCEL = "1";
const server = require("../server.js");

test("default supplier placeholders follow PRD category boundaries", () => {
  const suppliers = server.defaultPlaceholderSuppliers();
  assert.equal(suppliers.length, 2);
  assert.deepEqual(suppliers.map((supplier) => supplier.category), ["包车", "大交通"]);
  assert.equal(suppliers.every((supplier) => supplier.isPlaceholder), true);

  const charterDetail = suppliers.find((supplier) => supplier.category === "包车").serviceDetails[0];
  assert.equal("crossCityAllowed" in charterDetail, false);
  assert.equal("canCrossCity" in charterDetail, false);
  assert.equal(charterDetail.routeName.includes("包车"), true);
  assert.equal(charterDetail.packageCostPrice, 900);

  const trafficDetail = suppliers.find((supplier) => supplier.category === "大交通").serviceDetails[0];
  assert.equal("trainNumber" in trafficDetail, false);
  assert.equal("flightNumber" in trafficDetail, false);
  assert.equal("inventory" in trafficDetail, false);
  assert.equal("stock" in trafficDetail, false);
  assert.match(trafficDetail.serviceFeeRule, /服务费/);
});

test("supplier normalization keeps one primary contact and service detail prices", () => {
  const supplier = server.normalizeSupplierRecord({
    category: "用车",
    name: "测试车队",
    city: "北京",
    contacts: [
      { name: "A", phone: "138", primary: true },
      { name: "B", phone: "139", primary: true },
    ],
    serviceDetails: [{
      routeName: "北京慕田峪一日游",
      vehicleModel: "14座车",
      packageCostPrice: "¥1,500",
      packageSalePrice: "1900",
      canCrossCity: true,
    }],
  });

  assert.equal(supplier.category, "包车");
  assert.equal(supplier.contacts.filter((contact) => contact.primary).length, 1);
  assert.equal(supplier.serviceDetails[0].vehicleModel, "14座~17座");
  assert.equal(supplier.serviceDetails[0].costPrice, 1500);
  assert.equal(supplier.serviceDetails[0].salePrice, 1900);
  assert.equal("canCrossCity" in supplier.serviceDetails[0], false);
});

test("supplier schema exposes separated child tables and service detail tables", () => {
  const schema = server.supplierSchemaDefinition();
  assert.equal(schema.childTables.includes("contacts"), true);
  assert.equal(schema.childTables.includes("attachments"), true);
  assert.equal(schema.serviceDetailTables["包车"], "vehicle_route_quotes");
  assert.equal(schema.serviceDetailTables["大交通"], "major_transport_agent_rules");
  assert.equal(schema.quoteRules.includes("quote_reads_service_details"), true);
});
