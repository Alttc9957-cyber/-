const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const catalogPath = path.resolve(__dirname, "../data/products/youyixing-product-catalog.json");
const payload = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const catalog = payload.productCatalog;

function findItem(items, predicate, label) {
  const item = items.find(predicate);
  assert.ok(item, `missing catalog item: ${label}`);
  return item;
}

test("product catalog imports every template sheet into the right category", () => {
  assert.equal(payload.report.sheets["线路报价"].category, "线路产品");
  assert.equal(payload.report.sheets["仅包车报价"].category, "用车");
  assert.equal(payload.report.sheets["导游报价"].category, "导游");
  assert.equal(payload.report.sheets["特色体验价"].category, "特色体验");
  assert.equal(payload.report.sheets["门票报价"].category, "景点门票");
  assert.equal(payload.report.sheets["餐"].category, "餐厅");
  assert.equal(payload.report.sheets["酒店"].category, "酒店");

  assert.equal(catalog.routes.length, 24);
  assert.ok(catalog.vehicles.length >= 900);
  assert.equal(catalog.guides.length, 48);
  assert.equal(catalog.experiences.length, 77);
  assert.equal(catalog.tickets.length, 145);
  assert.ok(catalog.meals.length >= 150);
});

test("vehicle costs from the source workbook are preserved", () => {
  const daxing = findItem(catalog.vehicles, (item) => (
    item.city === "北京" && item.serviceType === "接送机" && /大兴/.test(item.route) && item.model === "7座"
  ), "北京大兴机场 7座");
  assert.equal(daxing.costPrice, 260);
  assert.equal(daxing.salePrice, 460);

  const chongqingAirport = findItem(catalog.vehicles, (item) => (
    item.city === "重庆" && item.serviceType === "接送机" && item.model === "7座"
  ), "重庆接送机 7座");
  assert.equal(chongqingAirport.costPrice, 250);
  assert.equal(chongqingAirport.salePrice, 450);

  const wulong = findItem(catalog.vehicles, (item) => (
    item.city === "重庆" && item.serviceType === "包车" && /武隆/.test(item.route) && item.model === "14座~17座"
  ), "重庆武隆包车 14座~17座");
  assert.equal(wulong.costPrice, 1500);

  const cityDay = findItem(catalog.vehicles, (item) => (
    item.city === "重庆" && item.serviceType === "包车" && /8小时/.test(item.route) && item.model === "7座"
  ), "重庆市内一日游8小时 7座");
  assert.equal(cityDay.costPrice, 700);
});

test("blank prices stay blank and raw fields keep the full Excel row", () => {
  const meal = catalog.meals[0];
  assert.equal(meal.costPrice, "");
  assert.notEqual(meal.costPrice, 0);
  assert.equal(meal.rawFields["K列 / 建议卖价"], 106);
  assert.equal(meal.rawFields["L列 / L列"], 10);

  const hotel = findItem(catalog.hotels, (item) => item.hotelName === "北京首都宾馆", "北京首都宾馆");
  assert.equal(hotel.costPrice, "");
  assert.notEqual(hotel.costPrice, 0);
  assert.ok(Object.prototype.hasOwnProperty.call(hotel.rawFields, "N列 / 成本价"));
});

test("valid rows without explicit ticket type are still imported", () => {
  const homeVisit = findItem(catalog.experiences, (item) => (
    item.city === "北京" && item.experienceName === "家访"
  ), "北京家访体验");
  assert.equal(homeVisit.ticketType, "体验项目");
  assert.equal(homeVisit.costPrice, 15);

  const huanglong = findItem(catalog.tickets, (item) => (
    item.city === "张家界" && item.scenicName === "黄龙洞"
  ), "张家界黄龙洞门票");
  assert.equal(huanglong.ticketType, "门票");
  assert.equal(huanglong.costPrice, 120);
});

test("blank inherited rows are not promoted into fake products", () => {
  const fakeExperienceRows = catalog.experiences.filter((item) => (
    item.experienceName === "绒绣体验" && item.ticketType === "体验项目" && item.costPrice === "" && item.salePrice === ""
  ));
  assert.equal(fakeExperienceRows.length, 0);

  const fakeTicketRows = catalog.tickets.filter((item) => (
    item.scenicName === "功夫体验" && item.ticketType === "景区门票" && item.costPrice === "" && item.salePrice === ""
  ));
  assert.equal(fakeTicketRows.length, 0);
});
