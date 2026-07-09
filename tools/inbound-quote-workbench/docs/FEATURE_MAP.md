# FEATURE_MAP

友易行当前功能地图。本文按当前代码状态记录已有模块、涉及文件、依赖关系和风险状态。

## 项目结构概览

- `index.html`：单页工作台页面结构、模块入口、表单和弹窗容器。
- `app.js`：主要前端业务逻辑，包含状态、渲染、产品库导入、报价匹配、AI 调用、提案导出。
- `styles.css`：页面样式。
- `server.js`：本地静态服务、AI 设置、DeepSeek 调用、翻译接口、Agent action 接口。
- `data/`：产品、历史线路、历史报价、报价规则、翻译记忆、小易记忆和运行日志。
- `vendor/xlsx.full.min.js`：Excel 解析依赖。
- `scripts/build-system-product-catalog.py`：系统产品库构建脚本。
- `docs/`：从 2026-07-02 起新增的开发管理文档。

## 功能清单

### F-001

功能编号：F-001

功能名称：报价项目列表与项目状态

功能描述：展示报价项目看板、统计卡、项目列表、筛选条件，支持新建项目、打开项目详情、状态跟进。

涉及页面：报价项目首页。

涉及组件：`projectDashboard`、`projectStats`、`projectPipeline`、`projectTable`、`projectSearch`、`projectStatusFilter`

涉及接口：无直接后端接口，主要使用浏览器本地状态。

涉及数据字段：`state.projects`、`projectStatuses`、客户名称、账号、国家、城市、状态、创建时间。

当前状态：待确认

风险说明：项目状态和项目详情之间有本地快照同步，需确认刷新页面后状态是否完整保留。

是否为核心交付功能：是

### F-002

功能编号：F-002

功能名称：客户需求输入与结构化识别

功能描述：录入客户需求、聊天记录、OP 线路备注，调用小易或本地规则生成客户资料草稿，写入人数、城市、天数、酒店、导游、用车等字段。

涉及页面：报价项目详情，客户信息编辑区。

涉及组件：`rawDemandInput`、`opRouteInstruction`、`recognizeDemandDraft`、`clientCountry`、`serviceDays`、`cities`、`svcVehicle`、`svcGuide`、`svcHotel`

涉及接口：`POST /api/agent`

涉及数据字段：`startDate`、`serviceDays`、`adults`、`children`、`cities`、`languageNeed`、`hotelPreference`、`mealPreference`、`specialNeed`、`aiNotes`

当前状态：有 bug

风险说明：城市识别和天数识别已经做过热修，但 AI 返回结构不稳定、静态公网无后端时仍依赖本地规则，必须持续回归外地城市需求。

是否为核心交付功能：是

### F-003

功能编号：F-003

功能名称：主行程表与线路编辑

功能描述：生成、导入、编辑、确认主行程表，并根据每日行程拆出停留城市、跨城交通、接送机、接送站和市内用车报价项。

涉及页面：报价项目详情，行程安排区。

涉及组件：`routeDraftPanel`、`itinerarySource`、`itineraryList`、`routeStatusGrid`、`routeEditorModal`

涉及接口：`POST /api/agent`

涉及数据字段：`state.itinerary`、`routeDraft`、`routeConfirmed`、`stayCity`、`trafficNode`、`transferSegment`、`quoteLegs`

当前状态：待确认

风险说明：跨城市阶段曾导致后续主行程城市重复或错位，需要用成都送机、重庆接机等场景专项验证。

是否为核心交付功能：是

### F-004

功能编号：F-004

功能名称：产品资源库导入与清洗

功能描述：管理产品资源，支持按品类查看、筛选、分页、导入 Excel/CSV/JSON、字段映射、友易行产品库模板解析、去重、导出和重置系统产品库。当前系统产品库加载后会优先读取 Supabase 已发布批次，用云端产品资源覆盖静态底库中的用车、门票、导游、酒店、餐厅和特色体验。

涉及页面：产品资源库。

涉及组件：`productCategoryTabs`、`resourceTable`、`productImportModal`、`productImportFile`、`dedupeProducts`、`clearProductCatalog`、`exportProducts`

涉及接口：加载静态数据 `data/products/*.json`；云端出口 `GET /api/product-imports/latest/report`、`GET /api/product-resources`

涉及数据字段：`state.productCatalog`、`rawFields`、`sourceSheet`、`sourceRow`、`supplierName`、`costPrice`、`salePrice`、`lowSeasonCost`、`highSeasonCost`、`adultCost`、`childCost`、`status`

当前状态：待确认

风险说明：前端已验证读取云端批次，产品页景点门票专用字段已恢复；餐厅源表缺成本仍保留为待补成本。供应商服务明细尚未入云端。

是否为核心交付功能：是

### F-005

功能编号：F-005

功能名称：产品资源匹配与报价成本回填

功能描述：从产品库和供应商服务明细生成可报价资源，按城市、服务类型、车型、路线、语种、星级、票种等条件匹配报价行，填入成本、来源和匹配状态。云端产品库加载后，报价资源池由云端产品资源生成，报价行保留云端 `sourceProductId`、`sourceResourceId`。

涉及页面：报价项目详情，报价项目区。

涉及组件：`quoteTabs`、`quoteTablePanel`、`buildQuote`、`sourceNote`、`renderQuoteDiagnosticsPanel`、`openSyncQuoteItemModal`

涉及接口：本地产品库和供应商库；云端出口 `POST /api/product-resources/match`

涉及数据字段：`state.quoteResources`、`sourceType`、`sourceProductId`、`sourceResourceId`、`supplierName`、`serviceDetailId`、`costSource`、`matchStatus`、`matchReason`、`missingCost`、`youyixing_quote_diagnostics_latest`

当前状态：待确认

风险说明：重庆云端 API 四例已通过；路线不命中会降级为待确认，避免错算成本。多个候选仍需 OP 确认。供应商服务明细云端化仍需下一阶段复测。

是否为核心交付功能：是

### F-006

功能编号：F-006

功能名称：报价明细、汇总与缺成本检查

功能描述：按服务项生成用车、门票、导游、酒店、餐、大交通、其他表格，计算成本、售价、毛利、毛利率和缺成本项。

涉及页面：报价项目详情，报价项目区和报价汇总区。

涉及组件：`renderVehicleTable`、`renderGuideTable`、`renderTicketTable`、`renderHotelTable`、`renderMealTable`、`renderTrafficTable`、`summaryPanel`、`quote-display.js`

涉及接口：无直接后端接口。

涉及数据字段：`activeQuote().data`、`grossMargin`、`trafficFeeRate`、`totalCost`、`totalSell`、`missingCostDetails`

当前状态：待确认

风险说明：空成本不能显示为正常 0；汇总可临时按 0 计算，但必须保留缺成本提示。报价行默认只显示短状态，完整匹配原因放折叠详情和诊断快照。

是否为核心交付功能：是

### F-007

功能编号：F-007

功能名称：客户方案生成、多语言与导出

功能描述：基于报价明细生成客户可见方案，支持多语言、价格显示开关、水印、联系方式、素材池、导出图片和下载 PDF。

涉及页面：客户提案页。

涉及组件：`buildProposal`、`proposalContent`、`proposalAssets`、`translationWorkflow`、`exportImage`、`exportPdf`

涉及接口：`POST /api/translate`、`POST /api/translate/segment`

涉及数据字段：`proposalContent`、`outputLang`、`translation.glossary`、`translation.memory`、`proposalAssets`

当前状态：待确认

风险说明：图片/PDF 导出依赖已本地化，浏览器 smoke check 已确认 `html2canvas` 和 `jsPDF` 加载成功；仍需在已确认客户方案上实点下载文件。

是否为核心交付功能：是

### F-008

功能编号：F-008

功能名称：小易 AI 助手

功能描述：右侧聊天式助手，读取当前客户资料、行程、报价明细和提案，提供需求识别、线路草稿、报价项识别、缺失检查、英文方案和图片处理建议。

涉及页面：报价项目详情，小易侧栏。

涉及组件：`xiaoyiLauncher`、`xiaoyiPanel`、`xiaoyiChatLog`、`xiaoyiFileInput`、`agentPendingResult`

涉及接口：`POST /api/agent`、`POST /api/agent/chat`、`POST /api/agent/action`、`POST /api/agent/suggestions`、`POST /api/agent/apply`

涉及数据字段：`state.agent`、`state.xiaoyi`、`state.agentQuoteItems`、`agentContext`

当前状态：待确认

风险说明：AI 不能决定最终成本价；所有成本必须来自产品库、供应商服务明细或人工录入。当前日志不足以完整复盘 AI 调用。

是否为核心交付功能：是

### F-009

功能编号：F-009

功能名称：供应商管理与服务明细

功能描述：按品类维护供应商基础信息、联系人、服务明细，支持导入、导出、列表筛选和详情查看，作为报价成本来源之一。

涉及页面：供应商管理。

涉及组件：`supplierCategoryTabs`、`supplierTable`、`supplierResourceTable`、`supplierModal`、`supplierImportFile`

涉及接口：无直接后端接口，使用本地状态。

涉及数据字段：`state.suppliers`、`contacts`、`serviceDetails`、`supplierName`、`serviceDetailId`、`validFrom`、`validTo`、`status`

当前状态：待确认

风险说明：供应商成本回填规则需要和产品库成本优先级一起复测；供应商为空不能阻断报价。

是否为核心交付功能：是

### F-010

功能编号：F-010

功能名称：本地数据加载与持久化

功能描述：加载系统产品库、历史线路、历史报价、报价规则、翻译词库和本地覆盖层，并保存项目、产品库、供应商、报价版本和订单状态。

涉及页面：全局。

涉及组件：`loadSystemProductCatalog`、`loadRuntimeData`、`loadLocalProductState`、`saveLocalProductState`、`loadProjectState`、`saveProjectState`

涉及接口：静态 JSON 文件、浏览器 `localStorage`、云端产品库 API

涉及数据字段：`youyixing_product_state`、`youyixing_supplier_state`、`youyixing_project_state`、`youyixing_quote_versions`、`youyixing_order_state`

当前状态：待确认

风险说明：云端产品库启用时，本地旧产品库覆盖层会被忽略，避免坏缓存污染报价；若后续恢复本地导入覆盖层，需要重新定义本地层与云端层的合并规则。

是否为核心交付功能：是

### F-011

功能编号：F-011

功能名称：订单管理与成交转订单

功能描述：报价提交或方案确认后，项目可转为订单，并在订单管理页面展示。

涉及页面：客户提案页、订单管理。

涉及组件：`convertToOrder`、`ordersPanel`、`renderOrders`

涉及接口：无直接后端接口。

涉及数据字段：`state.orders`、`projectStatus`、`quoteVersion`、`proposalConfirmed`

当前状态：待确认

风险说明：本轮不做完整订单系统，只保持现有跳转和展示逻辑。

是否为核心交付功能：否

### F-012

功能编号：F-012

功能名称：AI 模型配置与报价规则设置

功能描述：配置 DeepSeek API Key、Base URL、模型、温度，并维护默认利润率、大交通服务费率、酒店房间规则、缺成本提醒等报价规则。

涉及页面：系统设置。

涉及组件：`aiProvider`、`aiApiKey`、`aiBaseUrl`、`aiModel`、`aiTemperature`、`pricingRulesFlowLine`

涉及接口：`GET /api/settings`、`POST /api/settings/ai`、`POST /api/settings/ai/test`

涉及数据字段：`runtime-settings.json`、`DEEPSEEK_API_KEY`、`ruleDefaultMargin`、`ruleTrafficMargin`、`ruleMissingCost`

当前状态：待确认

风险说明：公网静态版没有这些接口；本地服务才有真实 AI 配置能力。`.env` 不应进入 Git。

是否为核心交付功能：是

### F-013

功能编号：F-013

功能名称：财务统计占位

功能描述：预留应收、实收、应付、实付、毛利、渠道、员工和产品利润统计入口。

涉及页面：财务统计。

涉及组件：`finance`

涉及接口：无

涉及数据字段：暂无正式结构。

当前状态：废弃

风险说明：当前只是占位，不应作为本阶段交付范围。

是否为核心交付功能：否

### F-014

功能编号：F-014

功能名称：静态公网预览与本地服务

功能描述：本地通过 `node server.js` 启动服务；公网 GitHub Pages 版本可用于客户预览静态页面。

涉及页面：全局。

涉及组件：`server.js`、`index.html`

涉及接口：本地有 `/api/*`，公网静态页无真实 `/api/*`。

涉及数据字段：静态 JSON、本地环境变量、运行设置。

当前状态：待确认

风险说明：公网静态页不能代表真实 AI 后端能力；客户测试时需要明确区分静态预览和本地完整服务。

是否为核心交付功能：是

### F-015

功能编号：F-015

功能名称：运行日志与审计追踪

功能描述：记录 Agent 操作日志，用于排查 AI 请求、业务动作和系统行为。

涉及页面：后台文件，无独立页面。

涉及组件：`appendOperationLog`、`data/agent-operation-log.json`

涉及接口：`POST /api/agent/action`、`POST /api/agent/suggestions`、`POST /api/agent/apply`

涉及数据字段：`action`、`payload`、`createdAt`

当前状态：有 bug

风险说明：当前日志不能完整记录 raw demand、AI raw output、normalized result、fallback reason 和最终主行程结果，排障价值不足。

是否为核心交付功能：否

### F-016

功能编号：F-016

功能名称：V1.4 可报价资源层

功能描述：把供应商服务明细标准化为可报价资源，提供本地查询、确定性匹配、价格状态、产品资源关联、报价行成本快照和客户视图成本脱敏。

涉及页面：产品资源库、供应商管理、报价明细。

涉及组件：`quotable-resource-core.js`、`queryQuotableResources`、`refreshV14ResourceState`、`openProductResourceDetail`、`openQuotableResourceSelector`、`writeResourceSnapshotToQuoteTarget`

涉及接口：浏览器内 `window.YouyixingServices.queryQuotableResources(params)`；当前没有新增 server.js 数据 API。

涉及数据字段：`state.productRequirementItems`、`state.productResources`、`state.resourceSupplierLinks`、`state.quotableResources`、`state.operationLogs`、`quoteLineSnapshot`

当前状态：待确认

风险说明：当前仍是浏览器本地状态，不是真实数据库；自动报价匹配保留旧主流程，本轮新增的是稳定查询出口和人工选择快照。需要用真实产品库和真实供应商明细继续验收。

是否为核心交付功能：是

### F-017

功能编号：F-017

功能名称：报价 domain 纯函数层

功能描述：新增独立报价域模块，用纯函数处理需求项归一化、产品候选生成、报价行构建、报价版本汇总和警告生成。当前作为测试边界和兼容 adapter，不直接替换 `app.js` 旧报价主流程。

涉及页面：当前无独立页面；后续用于报价项目详情。

涉及组件：`public/js/domain/quote/quote-types.js`、`quote-requirement-normalizer.js`、`quote-candidate-builder.js`、`quote-line-builder.js`、`quote-version-builder.js`、`quote-warnings.js`、`index.js`、`public/js/adapters/quote-engine-adapter.js`

涉及接口：无直接后端接口。

涉及数据字段：`QuoteRequirementItem`、`QuoteLineCandidate`、`QuoteLine`、`QuoteVersion`、`warnings`、`matchReason`、`costSource`

当前状态：待确认

风险说明：当前只完成纯函数和测试，尚未接管 `buildQuote`。接入旧流程时必须保留 fallback，并逐品类验收。

是否为核心交付功能：是

### F-018

功能编号：F-018

功能名称：Agent Gateway 权限与日志骨架

功能描述：新增 Agent 工具注册、权限判断、执行网关和日志骨架，用于约束 AI/工具对系统数据的操作等级。L3 操作需要人工确认，当前固定返回 `approval_required`。

涉及页面：当前无独立页面；后续用于小易 AI 助手和系统设置。

涉及组件：`public/js/agent/agent-tool-registry.js`、`agent-permissions.js`、`agent-gateway.js`、`agent-logger.js`

涉及接口：无新增后端接口。

涉及数据字段：`toolName`、`permissionLevel`、`userId`、`role`、`tenantId`、`status`、`approval_required`、`agent_logs`

当前状态：待确认

风险说明：当前只是浏览器侧骨架，尚未接入真实模型工具调用和后端审计表；不能当成正式权限系统。

是否为核心交付功能：否

### F-019

功能编号：F-019

功能名称：领域事件模型

功能描述：新增统一领域事件创建函数，要求事件上下文包含租户、操作者和角色，为后续老板看板、审计和运营统计提供事件契约。

涉及页面：当前无独立页面。

涉及组件：`public/js/domain/events/domain-events.js`

涉及接口：无新增后端接口。

涉及数据字段：`type`、`payload`、`tenantId`、`actorId`、`actorRole`、`createdAt`、`schemaVersion`

当前状态：待确认

风险说明：当前只创建事件对象，不写数据库，不做实时看板。后续接 Supabase 前需要先定义事件落库策略。

是否为核心交付功能：否

### F-020

功能编号：F-020

功能名称：AI 协同开发工作流 v1

功能描述：在仓库内建立 AI 协同中控层，用任务文件、Agent 职责、目标模板和脚本支持“任务文件 -> AI 执行 -> 自动测试 -> AI 审核 -> 修复循环 -> 输出报告 -> 推荐下一阶段”的开发流程。

涉及页面：无用户页面，属于开发协同和交付管理能力。

涉及组件：`.ai/agents/`、`.ai/tasks/`、`.ai/reports/`、`.ai/state/`、`goals/_template/`、`scripts/ai/detect-test-scope.mjs`、`scripts/ai/verify-module.mjs`、`scripts/ai/select-next-task.mjs`、`scripts/ai/generate-pr-summary.mjs`

涉及接口：无新增业务接口。

涉及数据字段：`task-template.yml` 中的 `id`、`title`、`stage`、`approved`、`owner_agent`、`allowed_files`、`forbidden_files`、`redlines`、`scope`、`out_of_scope`、`acceptance`、`required_commands`、`risk_level`、`rollback`、`next_candidates`

当前状态：正常

风险说明：该工作流只能约束开发过程，不能替代真实代码审查和客户验收；涉及数据库迁移、生产数据和密钥时仍必须人工确认。

是否为核心交付功能：否
