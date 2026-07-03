# Acceptance V1.4

## 本轮范围

当前版本在 V1.3 供应商管理基础上，补充 V1.4 可报价资源层，完成以下最小交付：

- 修复供应商明细标准化问题。
- 新增 `QuotableResource` 纯函数 core。
- 新增浏览器内查询 service。
- 产品资源可查看并关联供应商服务明细。
- 报价行可从资源库选择供应商资源并写入成本快照。
- 补充回归测试与文档。

## 已完成

### 供应商 V1.3 验收项

- 供应商品类保持 8 类：酒店、包车、导游、门票、大交通、餐、特色体验、其他。
- 联系人归一化后只保留一个主联系人。
- 包车服务明细使用包车价成本与包车价参考售价，不使用“全天价”字段。
- 包车明细不新增“可跨城”，保留线路名称、出发城市、到达城市 / 区域。
- 导游明细保留 `originalRegistrationFields`。
- 大交通明细仅作为票务服务，不引入具体车次、航班、日期、座位和库存字段。
- 供应商状态、成本价、参考售价、结算字段变化写入本地 `operationLogs`。
- 停用供应商不会进入可报价资源。

### V1.4 可报价资源

- 新增 `quotable-resource-core.js`。
- 新增 `state.productRequirementItems`、`state.productResources`、`state.resourceSupplierLinks`、`state.quotableResources`、`state.operationLogs`。
- 新增 `window.YouyixingServices.queryQuotableResources(params)`。
- 新增 `window.YouyixingServices.matchQuotableResources(params)`。
- 新增 `window.YouyixingServices.createQuoteLineSnapshot(resource, context)`。
- 新增产品资源详情弹窗，可查看已关联供应商资源、候选资源、首选供应商。
- 新增供应商详情反向查看，可看到服务明细关联产品资源数量和报价调用次数。
- 报价行新增“从资源库选择”，选中后写入 `quoteLineSnapshot`。

### 权限与客户可见规则

- `publicQuoteLineSnapshot` 可去除客户视图中的内部成本字段。
- 成本字段只作为内部数据，不放入客户可见报价快照。
- 价格已过期资源阻断直接选择。
- 无价格有效期资源允许人工确认后选择，并标记待确认。

## 验证记录

执行命令：

```bash
node --check app.js
node --check server.js
node --check quotable-resource-core.js
node --test tests/quotable-resource-core.test.js
```

结果：

- `app.js` 语法检查通过。
- `server.js` 语法检查通过。
- `quotable-resource-core.js` 语法检查通过。
- `tests/quotable-resource-core.test.js` 6 项全部通过。

本地服务：

```bash
PORT=8799 node server.js
curl -I --max-time 3 http://127.0.0.1:8799/
curl -s --max-time 3 http://127.0.0.1:8799/api/settings
```

结果：

- 首页返回 `HTTP/1.1 200 OK`。
- `/api/settings` 返回 AI 配置已存在，`hasApiKey=true`，完整 Key 未返回前端。
- 浏览器烟测打开页面成功，业务控制台未捕获 error。

## 回归测试覆盖

`tests/quotable-resource-core.test.js` 覆盖：

- 主联系人唯一性。
- 包车价格归一化。
- 导游原始登记字段保留。
- 停用供应商排除。
- 8 类供应商资源生成。
- `priceStatus` 四种状态。
- 8 类资源确定性匹配。
- 报价行成本快照。
- 客户视图成本脱敏。

## 待人工验收

以下项目需要在真实浏览器数据和真实产品库下继续测：

- 导入完整《产品库汇总.xlsx》后，再进入产品资源详情关联供应商。
- 在报价行选择供应商资源后刷新页面，确认报价版本保存状态。
- 用真实供应商服务明细验证重庆接送机、重庆武隆包车、北京导游、北京酒店。
- 客户方案导出图片和下载 PDF 本轮未修复。

## 当前风险

- 当前项目仍是本地单页工作台，未接真实数据库。
- `server.js` 无法直接读取浏览器 `localStorage`，因此 V1.4 查询采用浏览器 service。
- 报价主流程未重写，自动匹配仍沿用旧 `quoteResources`，本轮重点补人工选择和可追溯快照。
- 大规模产品库导入后的真实 UI 性能仍需继续压测。
