const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

test("产品库普通主界面不暴露重置系统产品库入口", () => {
  assert.doesNotMatch(indexHtml, /id="clearProductCatalog"/);
  assert.match(appJs, /async function clearProductCatalog/);
});

test("产品库主表只渲染核心业务列", () => {
  const tableRenderer = appJs.slice(appJs.indexOf("function renderProductCategoryTable"), appJs.indexOf("function renderTicketProductCategoryTable"));
  assert.match(tableRenderer, /"资源名称", "品类", "城市", "服务类型\/规格", "成本价", "参考售价", "供应商"/);
  assert.doesNotMatch(tableRenderer, /"状态", "来源", "备注", "操作"/);
});

test("报价同步只允许先保存为产品库草稿", () => {
  assert.match(appJs, /保存为产品库草稿/);
  assert.doesNotMatch(appJs, /同步为正式产品/);
  assert.match(appJs, /product\.item\.status = "待清洗"/);
});

test("报价明细来源提示会过滤已匹配成功行", () => {
  assert.match(appJs, /function shouldShowInlineSourceNote/);
  assert.match(appJs, /if \(!shouldShowInlineSourceNote\(meta, sourceOrRow\)\) return ""/);
});
