const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");
const productTableViewJs = fs.readFileSync(path.join(root, "public/js/features/product-library/product-table-view.js"), "utf8");
const supplierListViewJs = fs.readFileSync(path.join(root, "public/js/features/supplier-manager/supplier-list-view.js"), "utf8");

test("产品库普通主界面不暴露重置系统产品库入口", () => {
  assert.doesNotMatch(indexHtml, /id="clearProductCatalog"/);
  assert.match(appJs, /async function clearProductCatalog/);
});

test("产品库主表只渲染核心业务列", () => {
  const tableRenderer = appJs.slice(appJs.indexOf("function renderProductCategoryTable"), appJs.indexOf("function renderTicketProductCategoryTable"));
  assert.match(tableRenderer, /"资源名称", "品类", "城市", "服务类型\/规格", "成本价", "参考售价", "供应商"/);
  assert.doesNotMatch(tableRenderer, /"状态", "来源", "备注", "操作"/);
});

test("景点门票主表按景点聚合票种，避免同景点多规格铺满列表", () => {
  assert.match(appJs, /function productCatalogDisplayRows/);
  assert.match(appJs, /function ticketGroupKey/);
  assert.match(appJs, /function renderTicketGroupSpecs/);
  assert.match(appJs, /function productPriceRangeDisplay/);
  assert.match(appJs, /productTableView\.renderTicketGroupSpecs/);
  assert.match(appJs, /productTableView\.productPriceRangeDisplay/);
  assert.match(productTableViewJs, /\$\{count\}个票种/);
  assert.match(productTableViewJs, /展开价格明细/);
  assert.match(productTableViewJs, /mini-spec-table/);
  const ticketRenderer = appJs.slice(appJs.indexOf("function renderTicketProductCategoryTable"), appJs.indexOf("function priceOrPending"));
  assert.match(ticketRenderer, /"票种\/规格"/);
  assert.match(ticketRenderer, /productCatalogDisplayRows\(category, items\)/);
  assert.doesNotMatch(ticketRenderer, /const visibleItems = items\.slice/);
});

test("供应商主界面不暴露开发态占位清理按钮，列表改为轻量核心列", () => {
  assert.doesNotMatch(indexHtml, /id="clearSupplierPlaceholders"/);
  assert.match(appJs, /async function clearSupplierPlaceholders/);
  const supplierRenderer = appJs.slice(appJs.indexOf("function renderSupplierManagement"), appJs.indexOf("function filteredSuppliers"));
  assert.match(supplierRenderer, /supplierListView\.renderSupplierListTable/);
  assert.match(supplierListViewJs, /"供应商名称","品类","来源","城市 \/ 范围","主要联系人","状态","服务明细","操作"/);
  assert.doesNotMatch(supplierListViewJs, /"历史服务次数"/);
  assert.doesNotMatch(supplierListViewJs, /"评分 \/ 标签"/);
});

test("报价缺成本同步会写入产品库持久层", () => {
  assert.match(appJs, /写入产品库并用于后续报价/);
  assert.match(appJs, /\/api\/product-resources\/upsert-from-quote/);
  assert.doesNotMatch(appJs, /同步为正式产品/);
  assert.match(appJs, /product\.item\.status = "OP补录待复核"/);
});

test("报价明细来源提示会过滤已匹配成功行", () => {
  assert.match(appJs, /function shouldShowInlineSourceNote/);
  assert.match(appJs, /if \(!shouldShowInlineSourceNote\(meta, sourceOrRow\)\) return ""/);
});

test("项目状态保存会压缩候选资源避免 localStorage 超额", () => {
  assert.match(appJs, /function compactProjectSnapshotForStorage/);
  assert.match(appJs, /const STORAGE_DROP_KEYS = new Set/);
  assert.match(appJs, /"candidates"/);
  assert.match(appJs, /setLocalStorageJson\("youyixing_project_state"/);
  assert.match(appJs, /compactProjectSnapshotsForStorage\(state\.projectSnapshots \|\| \{\}, "minimal"\)/);
});
