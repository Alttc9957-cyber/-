# CHANGELOG

友易行版本变更记录。本文只记录面向版本的用户可见变化、关键修复、数据迁移和风险提示。

## [Unreleased]

### Added

- 新增 V1 地基修复任务文件：`.ai/tasks/A-v1-foundation-goal-loop.yml`。
- 新增 API 风险矩阵：`docs/API_RISK_MATRIX_20260707.md`。
- 新增服务端角色守卫，敏感写接口需要携带有效角色。
- 新增产品补录审核区接口：`GET /api/product-resource-reviews`、`POST /api/product-resource-reviews/approve`。
- 新增报价版本、订单和审计事件的服务端 local-json 持久化接口。
- 新增 Eva 英文多城市真实案例结构化测试。
- 新增英文景点别名与中文产品库匹配测试。
- 新增当前架构审计文档：`docs/ARCHITECTURE_CURRENT.md`。
- 新增 P0/P1 渐进改造计划：`docs/REFACTOR_PLAN_P0_P1.md`。
- 新增报价引擎契约文档：`docs/QUOTE_ENGINE_CONTRACT.md`。
- 新增 P1 目标数据库模型文档：`docs/DATABASE_TARGET_SCHEMA_P1.md`。
- 新增老板看板事件模型文档：`docs/BOSS_DASHBOARD_EVENT_MODEL.md`。
- 新增报价 domain 纯函数模块：`public/js/domain/quote/**`。
- 新增产品备注结构化模块：`public/js/domain/product/**`。
- 新增 Agent 工具注册、权限、执行网关和日志骨架：`public/js/agent/**`。
- 新增领域事件创建模块：`public/js/domain/events/domain-events.js`。
- 新增旧报价流程兼容 adapter：`public/js/adapters/quote-engine-adapter.js`。
- 新增 5 个 Node 单测，覆盖备注拆分、候选生成、报价行/版本、Agent 网关和领域事件。
- 新增报价来源展示模块：`public/js/domain/quote/quote-display.js`，用于把复杂来源压缩成短状态并保留折叠详情。
- 新增报价诊断快照：生成报价表时写入 `youyixing_quote_diagnostics_latest`，用于排查匹配状态、来源和原因。
- 新增回归测试：`tests/quote-display.test.js`、`tests/product-resource-match-scoring.test.js`。
- 新增结单冲刺验收审查报告：`docs/acceptance-closing-sprint-20260703.md`。
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

- 报价台缺成本补录不再直接发布正式产品资源；OP 提交后进入审核区，老板 / 管理员审核通过后才进入正式产品库匹配。
- 客户方案确认、PDF / 图片导出、成交转订单前会检查缺成本项；缺成本未处理时只能内部预览。
- 快捷补成本不再默认填 0，并拒绝 0 或负数成本。
- 产品资源库主表的景点门票改为按同一城市 + 同一景点聚合展示，多个票种显示为规格标签和价格区间。
- 前端调用 `/api/*` 时会携带当前角色、用户和租户头，供服务端最小权限守卫使用。
- `index.html` 新增 `public/js/**` 脚本加载，顺序位于 `quotable-resource-core.js` 之后、`app.js` 之前，保留旧业务主流程。
- 产品资源库页面在系统产品库加载后优先读取 Supabase 已发布批次，云端数据覆盖静态底库中的用车、门票、导游、酒店、餐厅和特色体验。
- 报价匹配资源池由云端产品库生成，报价行保留云端 `sourceProductId`、`sourceResourceId`、供应商、匹配状态和诊断字段。
- 景点门票列表改为专用表头，展示景点名称、类型、票种、淡季成人、旺季成人、旅行社成人、免费政策和保票政策。
- 云端产品库启用时，本地 `youyixing_product_state` 只保留自定义字段，不再覆盖云端产品资源。
- 供应商联系人归一化为唯一主联系人。
- 供应商服务明细统一成本价和参考售价字段。
- 包车服务明细继续使用“包车价”，不新增“可跨城”字段。
- 启动探针改为等待初始化完成后再执行，减少页面启动空状态报错风险。
- 系统产品库使用真实《产品库汇总.xlsx》重建，当前有效产品数量为线路 24、用车 940、导游 48、特色体验 77、门票 145、餐厅 151、酒店 153。
- 产品库模板导入的 `rawFields` 增加 Excel 列坐标和多行表头组合字段，避免尾部成本列、备注列和说明列丢失。
- `.env`、`.env.*`、`node_modules`、`.DS_Store` 已加入忽略规则，真实 Supabase 密钥只保存在本机。
- 云端产品库 API 返回数据库原始字段，同时补充前端惯用字段，避免下一轮接入时成本字段因命名不一致读空。
- 图片/PDF 导出依赖从 CDN 改为本地 `vendor/html2canvas.min.js` 和 `vendor/jspdf.umd.min.js`，降低客户网络拦截导致导出不可用的风险。
- 报价明细中的成本来源说明默认改为短状态，完整来源、候选和失败原因放入折叠详情与诊断面板。
- 客户测试阶段 `/api/agent` 和 `/api/agent/chat` 缺少 DeepSeek Key 时直接返回 `DEEPSEEK_REQUIRED`，不再静默降级到本地规则。

### Fixed

- 修复 `OP补录待复核` 资源同时 `is_published=true`、可直接污染后续产品匹配的问题。
- 修复 AI 设置写接口、产品补录写接口等敏感接口缺少服务端角色守卫的问题。
- 修复产品库资源读接口无角色也可访问的问题，避免成本和供应商数据裸露。
- 修复 Eva 英文多城市需求无法抽取城市、晚数和景点的问题。
- 修复英文景点名与中文产品库名缺少同义命中，导致正确资源经常并列或排后的问题。
- 修复新增备注拆分模块中“保票/保证”同时包含“确认”时被误归为预约政策的问题，保票政策优先归为 `guarantee_policy`。
- 修复产品库页面仍读取本地旧产品库、导致云端底库没有进入产品页和报价匹配的问题。
- 修复景点门票字段被通用“服务类型 / 规格”压扁，淡旺季票价、免费政策和保票政策只能藏在原始字段里的问题。
- 修复云端数字解析中非数字值可能进入价格字段、以及真实 0 可能被 `||` 回退吞掉的风险。
- 修复报价行来源 ID 使用前端临时编号，无法追溯到云端产品资源 UUID 的问题。
- 修复同一景点因正式名和简称同时命中而在报价明细中重复生成门票项的问题。
- 停用供应商不再进入可报价资源池。
- 价格已过期的供应商资源不能直接选入报价。
- 客户视图报价快照可隐藏内部成本字段。
- 修复特色体验中票种为空但有价格的有效行被跳过的问题。
- 修复门票中票种为空但有景点名称和价格的有效行被跳过的问题。
- 修复系统产品库构建脚本中 `特色体验价` M 列备注、`餐` K/L 列保存错位的问题。
- 修复导游、特色体验、门票 Sheet 空白行被 fill-down 后生成假资源的问题。
- 修复空成本在产品库数据中被误写成数字 0 的回归风险；空成本继续保存为空字符串。
- 修复云端导入脚本读取备选价格字段时可能把真实数字 0 当空值跳过的问题。
- 修复云端用车匹配中“同城 + 同服务类型 + 同车型”压过路线的风险；重庆市内一日游 8 小时 7 座不再错配到武隆 7 座。
- 修复报价行成本输入框下方默认展示过长候选和失败原因的问题。
- 修复客户方案导出依赖依赖外部 CDN 时，在客户网络不可访问 CDN 的环境下容易加载失败的问题。
- 修复 DeepSeek 未配置时 Agent 仍返回本地草稿、造成测试数据来源不可信的问题。

### Known Risks

- 新增 quote domain 当前只通过 adapter 与旧流程兼容，尚未接管 `app.js` 的报价生成主路径。
- Agent Gateway 只是权限与日志骨架，尚未接入真实模型工具执行。
- 餐厅 Sheet 的人均最低成本列在当前 Excel 中为空，151 条餐厅全部保留为待补成本。
- 供应商成本回填仍需要用真实供应商明细继续完整复测。
- 图片导出和 PDF 下载依赖已本地化并完成库加载 smoke check；仍需在已确认客户方案上实点下载文件。
- 运行日志当前不足以完整复盘 AI 原始输出、归一化结果和回退原因。
- 餐厅当前 151 条均缺真实成本字段，报价时必须继续显示待补成本，不能伪装为正常 0 成本。

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
