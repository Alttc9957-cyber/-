const assert = require("node:assert/strict");
const test = require("node:test");

process.env.VERCEL = "1";
const { productResourceMatchScore, productResourceRouteMatch } = require("../server.js");

test("明确市内一日游路线时，不会错配到同城同车型的武隆资源", () => {
  const query = { category: "用车", city: "重庆", serviceType: "包车", model: "7座", route: "市内一日游 8 小时" };
  const cityDay = { category: "用车", city: "重庆", service_type: "包车", model: "7座", name: "重庆包车 市内一日游8小时 7座", route: "市内一日游8小时", spec: "" };
  const wulong = { category: "用车", city: "重庆", service_type: "包车", model: "7座", name: "重庆包车 武隆 7座", route: "武隆", spec: "" };

  assert.equal(productResourceRouteMatch(cityDay, query.route).matched, true);
  assert.equal(productResourceRouteMatch(wulong, query.route).matched, false);
  assert.ok(productResourceMatchScore(cityDay, query) > productResourceMatchScore(wulong, query));
  assert.ok(productResourceMatchScore(wulong, query) < 80);
});

test("机场路线可以命中接送机资源", () => {
  const query = { category: "用车", city: "重庆", serviceType: "接送机", model: "7座", route: "机场" };
  const airportTransfer = { category: "用车", city: "重庆", service_type: "接送机", model: "7座", name: "重庆接送机 接送机 7座", route: "接送机", spec: "" };

  assert.equal(productResourceRouteMatch(airportTransfer, query.route).matched, true);
  assert.ok(productResourceMatchScore(airportTransfer, query) >= 80);
});
