const assert = require("node:assert/strict");
const test = require("node:test");

const appConfig = require("../public/js/shared/app-config.js");
const attractionMatching = require("../public/js/entities/itinerary/attraction-matching.js");

test("B0 shared config exposes stable service and category contracts", () => {
  assert.deepEqual(appConfig.serviceOrder, ["vehicle", "ticket", "experience", "guide", "hotel", "meal", "traffic", "other"]);
  assert.equal(appConfig.serviceLabels.ticket, "景点门票");
  assert.ok(appConfig.productCategories.includes("线路产品"));
  assert.ok(appConfig.supplierCategories.includes("大交通"));
  assert.equal(appConfig.categoryToType.景点门票, "ticket");
  assert.equal(appConfig.typeToCategory.vehicle, "用车");
});

test("attraction matching standardizes aliases without treating free landmarks as paid tickets", () => {
  assert.equal(attractionMatching.standardAttractionForName("故宫"), "故宫博物院");
  assert.equal(attractionMatching.standardAttractionForName("东方明珠"), "东方明珠塔");
  assert.equal(attractionMatching.isFreeLandmark("天安门"), true);
  assert.equal(attractionMatching.isFreeLandmark("外滩"), true);
  assert.equal(attractionMatching.isFreeLandmark("故宫"), false);
});

test("transfer-only arrival day is not considered a sightseeing day", () => {
  assert.equal(attractionMatching.isTransferOnlyDayText("抵达北京，专车接机，送往酒店办理入住，自由活动。"), true);
  assert.equal(attractionMatching.isTransferOnlyDayText("上午参观故宫博物院，下午前往景山公园。"), false);
});
