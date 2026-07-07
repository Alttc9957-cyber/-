# ARCHITECTURE_CURRENT

日期：2026-07-03

本文记录友易行 quote workbench 当前代码结构。目标是让后续修改可审查、可回退，不把未来重构计划当成已完成事实。

## 当前运行形态

- 前端入口：`index.html`
- 主要业务文件：`app.js`
- 本地服务：`server.js`
- 样式：`styles.css`
- Excel 解析：`vendor/xlsx.full.min.js`
- 可报价资源核心：`quotable-resource-core.js`
- 静态/系统产品库：`data/products/youyixing-product-catalog.json`
- 云端产品库 API：`GET /api/product-imports/latest/report`、`GET /api/product-resources`、`POST /api/product-resources/match`
- 新增域模块：`public/js/domain/**`
- B0 新增模块：`public/js/shared/**`、`public/js/entities/itinerary/**`
- B1 新增模块：`public/js/entities/customer/**`、`public/js/entities/transport/**`、`public/js/features/**`
- 新增 Agent 安全骨架：`public/js/agent/**`
- 新增兼容 adapter：`public/js/adapters/quote-engine-adapter.js`

## 当前核心数据流

1. `server.js` 提供本地页面、静态文件、AI/翻译接口、产品库 API。
2. `index.html` 加载 `quotable-resource-core.js`、新增域模块、B0/B1 共享 / 实体 / feature 模块，再加载 `app.js`。
3. `app.js` 初始化页面状态、项目、产品库、供应商、报价、客户方案。
4. 产品库优先读取 Supabase 已发布批次；失败时保留静态系统产品库 fallback。
5. 报价主流程仍由 `app.js` 内既有函数驱动。
6. 新增 quote domain 暂时只提供纯函数和测试，旧流程通过 adapter 可逐步接入，不直接替换。

## 当前模块边界

### 业务主流程

- `app.js` 仍是报价工作台的事实主控。
- 需求识别、主行程表、报价行生成、产品匹配、客户方案生成仍集中在 `app.js`。
- 稳定配置已迁到 `public/js/shared/app-config.js`。
- 景点别名、免费地标和接送机日判断已迁到 `public/js/entities/itinerary/attraction-matching.js`。
- 客户餐食偏好、接送默认和车型推荐已迁到 B1 entity 模块。
- 产品库门票展开和供应商轻表格渲染已迁到 B1 feature 模块。
- 本轮没有重写 `buildQuote`、`generateQuoteResources` 或报价页面渲染。

### 产品库

- 系统底库来自真实《产品库汇总.xlsx》构建结果。
- 云端产品库作为当前更可信的数据底座。
- 产品原始字段通过 `rawFields` 保留。
- 本轮新增 `normalizeProductRemarks(product)`，用于把备注拆成可审查的 `remarkAtoms`，但不改现有产品页主流程。

### 报价引擎候选层

- `buildQuoteCandidates(requirementItem, products, options)` 是新增纯函数。
- 输出候选、得分、匹配原因、警告，不直接写入页面状态。
- 警告码包括 `NO_PRODUCT_CANDIDATE`、`MISSING_COST`、`PRICE_EXPIRED`。

### Agent 安全边界

- 本轮只增加工具注册、权限判断、执行网关和日志骨架。
- 没有接入新的模型。
- 没有让 AI 自动改成本或自动提交业务数据。
- L3 操作永远返回 `approval_required`。

### 领域事件

- `createDomainEvent(type, payload, context)` 统一生成事件结构。
- 当前只作为后续老板看板和审计日志的数据契约，不接实时看板。

## 已知架构风险

- `app.js` 体量过大，业务函数边界不清，后续每次只允许小步抽离。
- 产品库、供应商、报价明细之间仍有本地状态和云端状态并存的问题。
- 供应商服务明细尚未云端化。
- 客户方案图片/PDF 导出仍是独立风险，不属于本轮修复范围。
- Agent 调用日志仍不足以完整审计 AI 原始输出、归一化结果和人工确认。

## 本轮安全策略

- 新模块全部放在 `public/js/**`。
- 通过 `index.html` 只做脚本加载。
- 不改业务主流程函数入口。
- 用 Node 测试锁住纯函数行为。
- 回退时可删除新增脚本引入和新增目录，旧报价流程仍可运行。
