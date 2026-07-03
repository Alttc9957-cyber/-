# CHANGELOG

友易行版本变更记录。本文只记录面向版本的用户可见变化、关键修复、数据迁移和风险提示。

## [Unreleased]

### Added

- 新增 V1.4 可报价资源 core：`quotable-resource-core.js`。
- 新增浏览器内查询服务：`window.YouyixingServices.queryQuotableResources(params)`。
- 新增产品资源与供应商服务明细关联层：`productResources`、`resourceSupplierLinks`、`quotableResources`。
- 新增报价行“从资源库选择供应商资源”，选择后写入 `quoteLineSnapshot`。
- 新增产品资源详情与供应商明细反向查看入口。
- 新增 V1.4 验收文档：`docs/acceptance-v1.4.md`、`docs/data-flow-v1.4.md`。
- 新增回归测试：`tests/quotable-resource-core.test.js`。
- 新增产品库真实 Excel 导入验收文档：`docs/acceptance-product-catalog-20260703.md`。
- 新增 Supabase 产品库数据底座验收文档：`docs/acceptance-supabase-product-catalog-20260703.md`。
- 新增产品库导入回归测试：`tests/product-catalog-import.test.js`。
- 新增 Supabase 产品库表结构：`db/schema.sql`。
- 新增云端产品库导入脚本：`scripts/import-product-catalog-to-supabase.js`。
- 新增后端产品库 API：`GET /api/product-imports/latest/report`、`GET /api/product-resources`、`POST /api/product-resources/match`。
- 新增开发管理文档体系：
  - `docs/DEV_LOG.md`
  - `docs/BUG_LOG.md`
  - `docs/FEATURE_MAP.md`
  - `docs/QA_CHECKLIST.md`
  - `docs/RELEASE_NOTES.md`
  - `docs/VERSION_ARCHIVE.md`
- 新增历史压缩包与相关开发资产索引，覆盖 v7 到 v12 的友易行历史交付包。

### Changed

- 供应商联系人归一化为唯一主联系人。
- 供应商服务明细统一成本价和参考售价字段。
- 包车服务明细继续使用“包车价”，不新增“可跨城”字段。
- 启动探针改为等待初始化完成后再执行，减少页面启动空状态报错风险。
- 系统产品库使用真实《产品库汇总.xlsx》重建，当前有效产品数量为线路 24、用车 940、导游 48、特色体验 77、门票 145、餐厅 151、酒店 153。
- 产品库模板导入的 `rawFields` 增加 Excel 列坐标和多行表头组合字段，避免尾部成本列、备注列和说明列丢失。
- `.env`、`.env.*`、`node_modules`、`.DS_Store` 已加入忽略规则，真实 Supabase 密钥只保存在本机。
- 云端产品库 API 返回数据库原始字段，同时补充前端惯用字段，避免下一轮接入时成本字段因命名不一致读空。

### Fixed

- 停用供应商不再进入可报价资源池。
- 价格已过期的供应商资源不能直接选入报价。
- 客户视图报价快照可隐藏内部成本字段。
- 修复特色体验中票种为空但有价格的有效行被跳过的问题。
- 修复门票中票种为空但有景点名称和价格的有效行被跳过的问题。
- 修复系统产品库构建脚本中 `特色体验价` M 列备注、`餐` K/L 列保存错位的问题。
- 修复导游、特色体验、门票 Sheet 空白行被 fill-down 后生成假资源的问题。
- 修复空成本在产品库数据中被误写成数字 0 的回归风险；空成本继续保存为空字符串。
- 修复云端导入脚本读取备选价格字段时可能把真实数字 0 当空值跳过的问题。

### Known Risks

- 产品库页面和报价主流程尚未完全切换到 Supabase API，仍需下一轮替换本地产品库读取层。
- 供应商成本回填仍需要用真实供应商明细继续完整复测。
- 图片导出和 PDF 下载仍需要复测。
- 运行日志当前不足以完整复盘 AI 原始输出、归一化结果和回退原因。

## [v0.1.0-baseline-2026-07-02] - 2026-07-02

### Baseline

- 冻结当前友易行项目代码状态。
- baseline commit：`49b2624`
- baseline tag：`v0.1.0-baseline-2026-07-02`

### Scope

- 包含报价项目、产品资源库、供应商管理、客户方案、AI 设置、本地数据和当前已有验收报告文件。
- 该版本是审查和回退基准，不代表所有功能已验收通过。

### Known Risks

- 当前业务代码经过多轮快速修改，功能状态不均衡。
- baseline 前的历史 bug 修复记录不完整。
- 后续每次修改必须在 `docs/DEV_LOG.md`、`docs/BUG_LOG.md` 或 `docs/CHANGELOG.md` 中留下可审查记录。
