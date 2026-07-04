# DEV_LOG

友易行开发日志。从 2026-07-02 起，任何业务修改、修复、上线、回退、测试补丁都必须登记到本文件。

## 记录规则

每次修改必须记录：

- 日期：
- 修改目标：
- 修改原因：
- 关联 bug：
- 关联功能：
- 涉及文件：
- 具体改动：
- 验证结果：
- 是否影响旧功能：
- 回退方式：
- 下一步建议：

要求：

- 先写清楚为什么改，再改代码。
- 一个提交只解决一个明确目标。
- 不允许把业务修复、UI 调整、数据迁移混在一个无法审查的提交里。
- 如果发现新问题，必须同步登记到 `docs/BUG_LOG.md`。
- 如果改变用户可见功能，必须同步登记到 `docs/CHANGELOG.md`。
- 如果改变交付版本，必须同步登记到 `docs/RELEASE_NOTES.md`。
- 如果影响核心流程，必须按 `docs/QA_CHECKLIST.md` 跑回归。

## 2026-07-02

日期：2026-07-02

修改目标：冻结当前友易行项目状态，建立可追踪、可回溯、可审查的开发管理机制。

修改原因：项目已经经历多轮修改，存在版本混乱、bug 修复记录不清、功能变更不可追踪的问题；当前阶段需要先建立基准版本和管理文档，不继续扩大业务改动。

关联 bug：

- BUG-20260702-001 产品库导入和报价匹配仍需重新验收。
- BUG-20260702-003 图片和 PDF 导出失败需复测。
- BUG-20260702-004 运行日志缺少关键识别上下文。

关联功能：

- F-001 报价项目列表与项目状态
- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填
- F-007 客户方案生成与导出
- F-015 本地服务、AI 接口与运行日志

涉及文件：

- `docs/DEV_LOG.md`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/FEATURE_MAP.md`
- `docs/QA_CHECKLIST.md`
- `docs/RELEASE_NOTES.md`
- `docs/VERSION_ARCHIVE.md`

具体改动：

- 创建当前代码基准提交。
- 创建 tag：`v0.1.0-baseline-2026-07-02`。
- 新增开发日志、版本变更、bug 管理、功能地图、QA 清单、发布说明文档。
- 初步登记当前主要功能模块和已知风险。
- 新增历史版本资产索引，把 `/Users/alic/Downloads/youyixing-builds/` 下 v7 到 v12 的友易行压缩包、企业 AI 内容工作流包和 AI 猫素材目录纳入追踪。

验证结果：

- 已确认仓库处于 Git 管理。
- 已创建 baseline commit 和 tag。
- 本次文档提交后需确认 `git status --short` 为空。

是否影响旧功能：否。本次只新增文档和 Git 版本记录，不修改业务逻辑。

回退方式：

- 只查看 baseline：`git switch --detach v0.1.0-baseline-2026-07-02`
- 需要把当前分支回退到 baseline 时，先确认无未保存改动，再执行：`git reset --hard v0.1.0-baseline-2026-07-02`

下一步建议：

- 下一阶段不要直接修多个 bug。
- 先按 `docs/BUG_LOG.md` 逐条登记复现路径。
- 优先做产品库导入与报价成本回填的最小闭环验收。
- 若需要从历史包找回功能，先按 `docs/VERSION_ARCHIVE.md` 解压到临时目录对比，不直接覆盖当前仓库。

## 2026-07-03

日期：2026-07-03

修改目标：按调研文档建立友易行 P0/P1 可审查改造边界，新增报价 domain、产品备注结构化、Agent Gateway、领域事件和对应测试，不替换现有报价主流程。

修改原因：当前 `app.js` 仍承担大部分业务逻辑，产品库、报价匹配、供应商成本、AI 建议之间缺少稳定契约；继续直接在主流程里改会让问题更难追踪。本轮先把可测试的纯函数边界和文档契约立起来。

关联 bug：

- BUG-20260702-001
- BUG-20260703-007

关联功能：

- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填
- F-006 报价明细、汇总与缺成本检查
- F-008 小易 AI 助手
- F-017 报价 domain 纯函数层
- F-018 Agent Gateway 权限与日志骨架
- F-019 领域事件模型

涉及文件：

- `index.html`
- `public/js/domain/quote/*`
- `public/js/domain/product/*`
- `public/js/domain/events/domain-events.js`
- `public/js/agent/*`
- `public/js/adapters/quote-engine-adapter.js`
- `tests/remark-atoms.test.js`
- `tests/quote-candidate-builder.test.js`
- `tests/quote-line-version-builder.test.js`
- `tests/agent-gateway.test.js`
- `tests/domain-events.test.js`
- `docs/ARCHITECTURE_CURRENT.md`
- `docs/REFACTOR_PLAN_P0_P1.md`
- `docs/QUOTE_ENGINE_CONTRACT.md`
- `docs/DATABASE_TARGET_SCHEMA_P1.md`
- `docs/BOSS_DASHBOARD_EVENT_MODEL.md`
- `docs/DEV_LOG.md`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/FEATURE_MAP.md`
- `docs/QA_CHECKLIST.md`
- `docs/RELEASE_NOTES.md`

具体改动：

- 新增 quote domain 纯函数：需求归一化、候选生成、报价行生成、报价版本汇总和警告结构。
- 新增产品备注拆分：`normalizeProductRemarks(product)` 返回 `cleanProduct` 和 `remarkAtoms`，保留 `rawFields` 与 `rawRemark`。
- 新增 Agent 工具注册、权限判断、执行网关和日志骨架；L3 操作固定返回 `approval_required`。
- 新增领域事件创建函数，要求事件上下文必须包含 `tenantId` 和 `actorId`。
- 新增 quote-engine adapter，只提供旧流程兼容入口，不替换 `buildQuote`。
- 新增 5 个 Node 单测，覆盖本轮新模块。
- 补齐架构、报价契约、P0/P1 计划、数据库目标模型和老板看板事件模型文档。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `find public/js -type f | xargs node --check` 等价检查通过。
- `node --test tests/*.test.js` 26 项通过。

是否影响旧功能：低。本轮只在 `index.html` 增加脚本引入，未修改 `app.js` 报价主流程和 `server.js` API。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`。
- 如只需临时停用新增模块，可移除 `index.html` 中 `public/js/**` 的新增脚本引入。

下一步建议：

- 先给 `buildQuote` 增加只读诊断日志，记录每个需求项的候选数量、最终来源和缺成本原因。
- 再选门票或导游作为低风险品类，逐步接入 `buildQuoteCandidates`，旧逻辑保留 fallback。

---

日期：2026-07-03

修改目标：按 B 方案建立 Supabase 云端产品库数据底座，先把真实产品库导入云端并开放服务端查询 API。

修改原因：静态浏览器 + localStorage 容易让旧产品库覆盖新产品库，且前端导 Excel 无法形成稳定数据审查和发布流程；产品库需要变成可追溯、可发布、可查询的数据库。

关联 bug：

- BUG-20260702-001
- BUG-20260703-003

关联功能：

- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填
- F-010 本地数据加载与持久化

涉及文件：

- `.gitignore`
- `app.js`
- `server.js`
- `db/schema.sql`
- `package.json`
- `package-lock.json`
- `scripts/build-system-product-catalog.py`
- `scripts/import-product-catalog-to-supabase.js`
- `data/products/youyixing-product-catalog.json`
- `tests/product-catalog-import.test.js`
- `docs/acceptance-product-catalog-20260703.md`
- `docs/acceptance-supabase-product-catalog-20260703.md`

具体改动：

- 修复 Excel 解析中过度 fill-down 的问题，空白行不再继承上一行名称生成假资源。
- 将真实产品库重新生成：线路 24、用车 940、导游 48、特色体验 77、门票 145、酒店 153、餐厅 151。
- 新增 Supabase Postgres 表结构和索引。
- 新增云端导入脚本，导入前执行质量门禁，失败则拒绝发布。
- 已将产品库导入 Supabase，导入批次 `4d50f5cc-d8ff-47ff-89bd-1028056814b3`。
- 新增后端 API：最新导入报告、产品资源查询、产品资源匹配。
- 产品资源 API 保留数据库原始字段，同时补充 `costPrice`、`salePrice`、`supplierName`、`serviceType` 等前端惯用字段。
- 云端导入脚本读取多个备选价格字段时保留真实数字 0，不再用 `||` 把 0 当成空值跳过。
- `.gitignore` 排除 `.env`、`.env.*`、`node_modules`、`.DS_Store`，防止密钥进入仓库或压缩包。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `node --check scripts/import-product-catalog-to-supabase.js` 通过。
- `python3 -m py_compile scripts/build-system-product-catalog.py` 通过。
- `node --test tests/product-catalog-import.test.js` 5 项通过。
- `node --test tests/quotable-resource-core.test.js` 6 项通过。
- `http://127.0.0.1:8787/` 返回 `HTTP/1.1 200 OK`。
- `GET /api/product-imports/latest/report` 返回 `status=published`、`pass=true`。
- `POST /api/product-resources/match` 测试重庆接机 7 座，返回 `matched`、成本 250。

是否影响旧功能：新增云端数据底座和服务端 API；未把前端报价主流程完全切换到云端。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`。
- 云端数据保留历史批次；如需停止使用云端 API，删除本机 `.env.supabase.local` 或停用相关环境变量即可。

下一步建议：

- 产品库页面读取 `/api/product-resources`。
- 报价匹配从本地 `state.productCatalog` 逐步切换到 `/api/product-resources/match`。
- 浏览器 localStorage 只保留项目草稿，不再保存完整产品库。

---

日期：2026-07-03

修改目标：用真实《产品库汇总.xlsx》重建系统产品库，修复模板导入漏行、错列和原始字段丢失问题。

修改原因：产品库是报价成本的来源；旧构建脚本会把特色体验、门票里票种为空但有价格的有效行跳过，并且部分 Sheet 的备注 / 建议价列错位，导致成本或辅助字段进库前已经丢失。

关联 bug：

- BUG-20260702-001
- BUG-20260703-003

关联功能：

- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填

涉及文件：

- `app.js`
- `scripts/build-system-product-catalog.py`
- `data/products/youyixing-product-catalog.json`
- `tests/product-catalog-import.test.js`
- `docs/acceptance-product-catalog-20260703.md`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/DEV_LOG.md`

具体改动：

- `rawFields` 保留标准字段名，同时补充 Excel 列坐标和多行表头组合名。
- 特色体验中票种为空但有体验名称和价格的行导入为 `ticketType=体验项目`。
- 门票中票种为空但有景点名称和价格的行不再跳过，优先用类型补票种。
- 修正系统产品库构建脚本中 `特色体验价` M 列备注、`餐` K/L 列建议价和加价信息的保存。
- 用 `/Users/alic/Downloads/产品库汇总.xlsx` 重新生成 `youyixing-product-catalog.json`，并在后续审查中剔除空白行继承生成的假资源。
- 新增产品库导入回归测试，锁住重庆 / 北京关键成本点和空成本规则。

验证结果：

- `node --check app.js` 通过。
- `python3 -m py_compile scripts/build-system-product-catalog.py` 通过。
- `node --test tests/product-catalog-import.test.js` 5 项通过。
- `node --test tests/quotable-resource-core.test.js` 6 项通过。
- 本地 `http://127.0.0.1:8787/` 返回 `HTTP/1.1 200 OK`。
- 产品库 JSON 返回 `HTTP/1.1 200 OK`，且重庆接送机 7 座成本为 250。

是否影响旧功能：影响产品库模板导入和系统底库数据；不改变报价主流程，不新增业务模块。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`。
- 若只回退系统产品库数据，可恢复上一版 `data/products/youyixing-product-catalog.json` 并重新加载页面。

下一步建议：

- 在浏览器清除本地产品库覆盖层后，用重庆和北京客户案例跑完整报价明细。
- 单独修复客户方案图片和 PDF 下载。

---

日期：2026-07-03

修改目标：修复供应商管理 V1.3 验收风险，并新增 V1.4 可报价资源查询与报价行成本快照能力。

修改原因：客户反馈 API/调用出口缺失，供应商服务明细无法稳定进入报价明细，导致产品资源、供应商成本和报价行之间不可追溯。

关联 bug：

- BUG-20260703-001
- BUG-20260703-002

关联功能：

- F-005 产品资源匹配与报价成本回填
- F-009 供应商管理与服务明细
- F-010 本地数据加载与持久化

涉及文件：

- `quotable-resource-core.js`
- `app.js`
- `index.html`
- `styles.css`
- `tests/quotable-resource-core.test.js`
- `docs/acceptance-v1.4.md`
- `docs/data-flow-v1.4.md`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/FEATURE_MAP.md`
- `docs/QA_CHECKLIST.md`

具体改动：

- 新增 `QuotableResource` 纯函数 core，支持供应商明细归一化、价格状态、查询、匹配、报价行快照和客户视图成本脱敏。
- 新增浏览器内查询服务 `window.YouyixingServices.queryQuotableResources`。
- 新增产品资源和供应商服务明细关联层。
- 产品资源库新增“供应商资源”入口。
- 供应商详情新增服务明细关联产品资源数量和报价调用次数。
- 报价行新增“从资源库选择供应商资源”入口，选中后回填成本、供应商、服务明细和 `quoteLineSnapshot`。
- 供应商联系人归一化为唯一主联系人。
- 包车服务明细统一使用包车价成本和包车价参考售价。
- 停用供应商排除在可报价资源之外。
- 初始化完成后再写入验收探针。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `node --check quotable-resource-core.js` 通过。
- `node --test tests/quotable-resource-core.test.js` 6 项通过。
- `PORT=8799 node server.js` 启动成功。
- `curl -I --max-time 3 http://127.0.0.1:8799/` 返回 `HTTP/1.1 200 OK`。
- `/api/settings` 返回 `hasApiKey=true`，完整 Key 未返回前端。
- 浏览器烟测打开页面成功，业务控制台未捕获 error。

是否影响旧功能：影响报价行操作区、产品资源库行操作、供应商详情展示；未重写报价主流程，未删除已有功能。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`
- 临时禁用 V1.4 查询入口：恢复 `index.html` 中 `quotable-resource-core.js` script 引用和 `app.js` 中新增的 `YouyixingServices`、报价行选择入口。

下一步建议：

- 用真实《产品库汇总.xlsx》重新导入后，手工关联供应商服务明细并验证报价行选择。
- 继续单独修复客户方案图片和 PDF 下载问题。

---

日期：2026-07-03

修改目标：把产品资源库页面和报价匹配切到 Supabase 云端产品库已发布批次，并修复景点门票字段显示和门票重复识别。

修改原因：云端产品库底座已建立，但前端仍存在读取本地产品库 / 旧缓存的风险，导致产品页看不到完整云端字段，报价明细可能继续使用旧数据或临时来源编号。

关联 bug：

- BUG-20260703-005
- BUG-20260703-006

关联功能：

- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填
- F-010 本地数据加载与持久化

涉及文件：

- `app.js`
- `server.js`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/FEATURE_MAP.md`
- `docs/QA_CHECKLIST.md`
- `docs/RELEASE_NOTES.md`
- `docs/acceptance-cloud-product-ui-match-20260703.md`

具体改动：

- `loadSystemProductCatalog()` 在加载静态底库后读取 Supabase 最新发布批次。
- 产品页和报价资源池使用 `/api/product-resources` 的云端产品资源覆盖用车、门票、导游、酒店、餐厅和特色体验。
- 云端启用时忽略旧 `youyixing_product_state` 产品覆盖层，避免坏缓存覆盖云端底库。
- 云端资源转前端产品时保留 `rawFields`、`extraFields`、来源 Sheet / 行号和云端资源 UUID。
- 景点门票列表改为专用字段表头，不再把门票字段压进通用“服务类型 / 规格”。
- 价格解析只接受真实数字，空值继续为空，不自动转 0。
- 报价资源和报价行补齐 `sourceProductId`、`sourceResourceId`、`supplierName`、`matchStatus`、`matchReason`。
- 门票识别按别名组去重，避免“故宫博物院 / 故宫”等重复生成报价项。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `node --check scripts/import-product-catalog-to-supabase.js` 通过。
- `python3 -m py_compile scripts/build-system-product-catalog.py` 通过。
- `node --test tests/product-catalog-import.test.js` 5 项通过。
- `node --test tests/quotable-resource-core.test.js` 6 项通过。
- `GET /api/product-imports/latest/report` 返回 `status=published`、`qualityReport.pass=true`。
- `GET /api/product-resources` 统计：用车 940、门票 145、特色体验 77、导游 48、酒店 153、餐厅 151。
- 重庆接机 / 送机 7 座成本 250，重庆武隆包车 14 座成本 1500，重庆市内一日游 7 座成本 700。
- 北京大兴接机成本 260，北京市内用车成本 700，英文导游成本 860，故宫博物院门票成人 60 / 儿童 30，酒店返回北京同星级候选。
- 餐厅成本为空时显示待补成本，不显示 0。
- 浏览器控制台无 error。
- 产品库景点门票页截图：`/Users/alic/Downloads/youyixing-product-ticket-fields-20260703.png`。

是否影响旧功能：影响产品资源库加载、报价匹配数据来源和门票识别去重；不重写报价主流程，不新增业务模块。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`。
- 临时停用云端产品库：删除本机 `.env.supabase.local` 或让 `/api/product-resources` 不可用，前端会保留静态系统产品库 fallback。

下一步建议：

- 第三阶段把供应商服务明细入云端，并验证同城市、同服务类型、同车型 / 票种 / 房型的供应商成本覆盖规则。
- 单独修复客户方案图片和 PDF 下载问题。

---

日期：2026-07-03

修改目标：结单冲刺补丁：收敛报价明细长备注、修复客户方案导出依赖、修复云端用车路线错配，并输出当前产品库数据完整度审计。

修改原因：客户测试时更关心“价格是否直接准确进入报价表”。旧报价行把来源、候选、失败原因全量铺在成本输入框下方，干扰交付观感；图片/PDF 导出依赖 CDN，外部网络拦截时会直接不可用；云端匹配 API 在同城同服务同车型但路线不命中时仍可能判为 matched，导致重庆市内一日游错配到武隆包车。

关联 bug：

- BUG-20260702-003
- BUG-20260703-007
- BUG-20260703-008

关联功能：

- F-005 产品资源匹配与报价成本回填
- F-006 报价明细、汇总与缺成本检查
- F-007 客户方案生成、多语言与导出

涉及文件：

- `app.js`
- `server.js`
- `index.html`
- `styles.css`
- `public/js/domain/quote/quote-display.js`
- `public/js/domain/quote/index.js`
- `vendor/html2canvas.min.js`
- `vendor/jspdf.umd.min.js`
- `tests/quote-display.test.js`
- `tests/product-resource-match-scoring.test.js`
- `docs/DEV_LOG.md`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/FEATURE_MAP.md`
- `docs/QA_CHECKLIST.md`
- `docs/RELEASE_NOTES.md`
- `docs/acceptance-closing-sprint-20260703.md`

具体改动：

- 新增报价展示纯函数 `quote-display.js`，把复杂来源统一压缩为“产品库成本 / 供应商成本 / 待确认 / 待补成本 / 未匹配”等短状态。
- `sourceNote()` 改为短状态 + 折叠详情，不再默认把候选资源和失败原因铺满报价明细。
- 用车分段缺价只显示“待补成本”，完整原因放在详情或 hover 中。
- 新增折叠的本次报价诊断面板，并把最新诊断快照保存到 `youyixing_quote_diagnostics_latest`。
- 图片/PDF 导出依赖改为本地 `vendor/html2canvas.min.js` 和 `vendor/jspdf.umd.min.js`。
- 云端产品匹配 API 增强路线匹配：有明确路线词时，路线不命中最高只能进入待确认，不能直接判定 matched；机场/接送机、站点、市内一日游、武隆等关键词按同义族匹配。
- 新增回归测试，锁定报价来源短标签和重庆市内一日游不再错配武隆。
- 新增本轮验收审查报告，记录测试命令、重庆硬用例和产品库严格数据审计结果。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `node --test tests/*.test.js` 31 项通过。
- 8787 服务重启后 `curl -I --max-time 2 http://127.0.0.1:8787/` 返回 `HTTP/1.1 200 OK`。
- 浏览器 smoke check 通过：`window.html2canvas=true`、`window.jspdf.jsPDF=true`、`window.YouyixingQuoteDisplay=true`。
- 报价生成 smoke check 通过：报价短标签出现，默认正文不再出现“候选资源：”，诊断面板能输出状态和原因。
- 云端 API 重庆四例通过：
  - 重庆接机 / 7座：成本 250。
  - 重庆送机 / 7座：成本 250。
  - 重庆武隆包车 / 14座~17座：成本 1500。
  - 重庆市内一日游 8 小时 / 7座：成本 700。
- 产品库严格数据审计：用车 940/缺成本 0，导游 48/缺成本 0，景点门票 145/缺成本 13，酒店 153/缺成本 5，餐厅 151/缺成本 151，特色体验 77/缺成本 2，线路产品 24/缺成本 0；所有品类 `rawFields` 均有保留；三类历史脏字段命中 0。

是否影响旧功能：影响报价来源展示、报价诊断面板、客户方案导出依赖加载、云端产品匹配 API 评分；不重写报价主流程，不新增业务模块。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`。
- 若只回退导出依赖，可把 `index.html` 中 `html2canvas/jspdf` script 改回 CDN。
- 若只回退路线评分，可恢复 `server.js` 中 `productResourceMatchScore()` 的旧评分逻辑。

下一步建议：

- 用真实客户行程跑北京和跨城成都/重庆测试，重点看主行程城市是否被接送机阶段带偏。
- 继续补餐厅真实成本或在报价规则中把餐厅默认显示为待补成本，不要参与正常 0 成本展示。
- 用已确认客户方案实点“导出图片 / 下载 PDF”，确认下载文件在公网预览和本地服务都可用。

---

日期：2026-07-04

修改目标：确保客户测试阶段 DeepSeek 全程接入，禁止 Agent 在缺少 Key 时静默降级到本地规则。

修改原因：乐哥反馈测试时 DeepSeek 必须全程接入。现场检查发现 8787 服务未运行导致前端无法读取配置；服务重启后 DeepSeek 配置存在且测试通过。同时发现旧代码在缺少 API Key 时会回退 `localAgentResponse`，这会造成“看起来能跑、其实不是 DeepSeek”的假成功。

关联 bug：

- BUG-20260704-001

关联功能：

- F-008 小易 AI 助手
- F-007 客户方案生成、多语言与导出

涉及文件：

- `server.js`
- `docs/DEV_LOG.md`
- `docs/BUG_LOG.md`
- `docs/CHANGELOG.md`
- `docs/QA_CHECKLIST.md`

具体改动：

- 新增 `sendMissingAiConfig()`，统一返回 `DEEPSEEK_REQUIRED`。
- `/api/agent` 缺少 DeepSeek API Key 时返回 503，不再返回本地 `localAgentResponse`。
- `/api/agent/chat` 缺少 DeepSeek API Key 时返回 503，不再返回 `local-agent-engine`。
- 保留纯本地动作入口用于确定性按钮/应用逻辑，不让它冒充模型生成。

验证结果：

- 重新启动 8787 服务，`curl -I --max-time 2 http://127.0.0.1:8787/` 返回 `HTTP/1.1 200 OK`。
- `/api/settings` 返回 `hasApiKey=true`、来源 `.env`。
- `/api/settings/ai/test` 返回 `ok=true`。
- `/api/agent` 返回 DeepSeek `usage` 和模型名。
- `/api/translate/segment` 返回 DeepSeek `usage` 和模型名。
- 独立 Node 进程置空 `DEEPSEEK_API_KEY` 后调用 `/api/agent`，返回 503、`DEEPSEEK_REQUIRED`。
- `node --check server.js` 通过。
- `node --check app.js` 通过。
- `node --test tests/*.test.js` 31 项通过。

是否影响旧功能：影响缺少 DeepSeek 配置时的 Agent 行为；测试阶段这是预期行为。不会影响已有 DeepSeek Key 正常调用，也不改变产品库报价成本来源。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`。
- 如需恢复离线演示模式，可把 `handleAgentRequest()` 和 `handleAgentChatRequest()` 中的 `sendMissingAiConfig()` 改回本地 fallback。

下一步建议：

- 页面顶部或系统设置处增加更明显的 DeepSeek 在线状态提示，防止客户测试时服务没启动却误以为模型丢失。
