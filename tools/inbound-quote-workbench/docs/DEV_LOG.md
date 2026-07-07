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

## 2026-07-07

日期：2026-07-07

修改目标：优化产品资源库主表的景点门票展示，避免同一景点多个票种连续占用多行。

修改原因：乐哥截图反馈“看起来像重复资源 / 不同售价异常”。现场排查后确认这是同一景点存在多个票种或规格，底层数据合理，但主表平铺展示影响 OP 扫表效率。

关联 bug：

- BUG-20260707-001 产品资源库主表同一景点多个门票规格平铺展示。

关联功能：

- F-004 产品资源库导入与清洗

涉及文件：

- `app.js`
- `index.html`
- `tests/a1-ui-simplification.test.js`
- `docs/BUG_LOG.md`
- `docs/DEV_LOG.md`
- `docs/CHANGELOG.md`

具体改动：

- 新增产品库展示行聚合：同一城市 + 同一景点的门票规格在主表聚成一行。
- “全部”和“景点门票”列表都会使用聚合展示。
- 门票规格以短标签展示，成本价 / 参考售价显示区间。
- 底层 `state.productCatalog.tickets` 不合并，报价匹配仍按具体票种取价。
- 补充静态回归测试，防止门票主表退回“一票种一行”的展示。
- 更新 `app.js` 缓存版本为 `20260707-ticket-grouping`，方便当前 8787 端口刷新生效。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check` 通过。
- `node --test tests/a1-ui-simplification.test.js` 通过，6/6。
- `node --test tests/*.test.js` 通过，47/47。
- `node scripts/ai/detect-test-scope.mjs` 通过，riskLevel `medium`，无 blocker。
- `node scripts/ai/verify-module.mjs` 通过。
- `curl http://127.0.0.1:8787/` 确认加载 `app.js?v=20260707-ticket-grouping`。
- 系统门票底层 145 条，按同一城市 + 同一景点聚合后主表展示为 72 行，减少 73 行。

是否影响旧功能：只影响产品资源库展示层，不修改产品数据、DeepSeek 配置、报价公式、产品匹配和数据库。

回退方式：

- 回退 `app.js` 中 `productCatalogDisplayRows`、`renderTicketGroup*`、`productPriceRangeDisplay` 等展示聚合函数，并恢复 `renderProductCategoryTable` / `renderTicketProductCategoryTable` 直接分页原始 items。

下一步建议：

- 刷新 8787 后进入产品资源库，确认故宫、颐和园、八达岭、天坛等同一景点只占一行，票种在规格列里展开。

---

日期：2026-07-07

修改目标：完成友易行 V1 地基修复阶段 A 的第一批风险补齐：接口权限、产品补录审核区、服务端持久化兜底、缺成本门禁和 Eva 真实案例结构化验收。

修改原因：上线前整包审查发现当前版本存在敏感写接口无服务端角色校验、OP 补录资源“待复核但已发布”、报价 / 订单 / 审计大量依赖 localStorage、英文多城市真实案例抽取不足、英文景点与中文产品库命中不稳等风险。

关联 bug：

- 待编号：敏感写接口缺少服务端角色守卫。
- 待编号：OP 补录资源待复核状态下仍可进入正式产品匹配。
- 待编号：报价版本、订单和阶段审计日志缺少服务端事实来源。
- 待编号：Eva 英文多城市需求无法稳定结构化。

关联功能：

- F-005 产品资源匹配与报价成本回填
- F-006 报价明细、汇总与缺成本检查
- F-011 订单管理与成交转订单
- F-012 AI 模型配置与报价规则设置
- F-018 Agent Gateway 权限与日志骨架

涉及文件：

- `server.js`
- `app.js`
- `public/js/domain/phase1/phase1-closed-loop.js`
- `tests/product-resource-upsert-from-quote.test.js`
- `tests/server-auth-guard.test.js`
- `tests/phase1-closed-loop.test.js`
- `tests/product-resource-match-scoring.test.js`
- `.ai/tasks/A-v1-foundation-goal-loop.yml`
- `docs/API_RISK_MATRIX_20260707.md`
- `docs/DEV_LOG.md`
- `docs/CHANGELOG.md`

具体改动：

- 新增服务端最小角色守卫，敏感写接口按 `sales` / `op` / `boss` / `admin` 做服务端校验。
- 新增 `GET /api/auth/session`、`GET /api/product-resource-reviews`、`POST /api/product-resource-reviews/approve`、`GET/POST /api/quote-versions`、`GET/POST /api/orders`、`POST /api/audit-events`。
- 报价台缺成本补录改为进入产品补录审核区，`is_published=false`，老板 / 管理员审核通过后才进入正式产品库。
- 报价版本、订单、关键审计事件新增服务端 local-json 持久化兜底；localStorage 保留为草稿和离线兜底。
- 客户方案确认、导出 PDF / 图片、成交转订单前增加缺成本门禁。
- 快捷补成本不再默认填 0，且拒绝 0 或负数成本。
- Eva 英文多城市案例纳入测试，可抽取北京 / 西安 / 张家界 / 桂林 / 上海、城市晚数和关键景点。
- 产品匹配增加英文景点别名与中文产品库名称的同义匹配，如 Mutianyu / 慕田峪、Terracotta / 兵马俑、Li River / 漓江。
- 新增接口风险矩阵和本阶段 AI 任务文件。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check` 通过。
- `node --test tests/*.test.js` 通过，46/46。
- 接口 smoke 通过：OP 提交补录后产品匹配为 `unmatched`；老板审核通过后匹配为 `matched`。
- 本地接口 smoke 通过：`GET /api/product-resources` 无角色返回 401，`op` 角色返回 200。

是否影响旧功能：影响报价缺成本补录口径。原先补录后会直接写入正式产品库并参与后续匹配；现在改为先进入审核区，当前报价可使用手填成本，但正式产品库必须老板 / 管理员审核后才发布。

回退方式：

- 回退本轮 commit 即可恢复旧接口和旧补录行为。
- 如需只回退审核区，可还原 `server.js` 中 `/api/product-resources/upsert-from-quote` 行为和 `app.js` 中 `applyQuoteProductSync()` 行为。
- 本轮未执行数据库迁移，未修改 `.env`，未写线上 Supabase 数据。

下一步建议：

- 继续阶段 A：把产品补录审核区接到老板视图按钮，补更完整的报价 / 订单服务端读取回填。
- 阶段 A 完成后提交代码，由 Hermes 做仓库审查。

## 2026-07-06

日期：2026-07-06

修改目标：完成 P0 产品定位与阶段路线冻结，固化友易行产品定义、三阶段路线和 Codex 自循环执行机制。

修改原因：当前项目经历多轮产品库、报价、供应商、DeepSeek 和 AI 协同文档建设后，最容易继续陷入“修一个点、坏另一个点”的状态。继续进入业务代码前，需要先明确最终产品是什么、第一阶段怎样算能用、哪些模块先后推进、Codex 后续如何自测和自修。

关联 bug：

- BUG-20260702-001 产品库导入和报价匹配仍需客户验收。
- BUG-20260703-005 云端产品库与本地覆盖层需要继续保持清晰边界。
- BUG-20260702-003 图片和 PDF 导出仍需实点验收。

关联功能：

- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填
- F-006 报价明细、汇总与缺成本检查
- F-011 订单管理与成交转订单
- F-020 AI 协同开发工作流 v1

涉及文件：

- `docs/PRODUCT_POSITIONING.md`
- `docs/STAGE_PLAN.md`
- `docs/CODEX_EXECUTION_LOOP.md`
- `docs/NEXT_ACTIONS.md`
- `docs/SOP/README.md`
- `docs/DEV_LOG.md`
- `goals/P0-product-positioning/GOAL.md`
- `goals/P0-product-positioning/GOALS.md`
- `goals/P0-product-positioning/REPORT.md`
- `goals/P0-product-positioning/ACCEPTANCE.md`

具体改动：

- 新增产品定位文档，明确友易行是入境游旅行社内部经营中控台，不是单一报价页面。
- 新增三阶段路线文档，固定第一阶段销售报价可信 MVP、第二阶段订单与 OP 执行、第三阶段老板经营看板与智能化。
- 新增 Codex 自循环执行机制文档，明确 Codex 是唯一 Coder，用户只做阶段级验收。
- 新增 P0 目标卡、子任务、验收和报告文档。
- 更新下一步任务文档，明确下一轮优先 A2 产品库真实数据修复与成本可信化。
- 更新 SOP，要求后续每轮开工前读取产品定位、阶段路线和 Codex 执行机制。

验证结果：

- 待执行 `git status --short --branch`。
- 待执行 `node --check app.js`。
- 待执行 `node --check server.js`。
- 待执行 `node --test tests/*.test.js`。

是否影响旧功能：否。本轮只改文档和目标卡，不修改 `app.js`、`server.js`、报价业务逻辑、数据库、产品真实数据、环境变量或 DeepSeek 配置。

回退方式：

- 删除 `docs/PRODUCT_POSITIONING.md`、`docs/STAGE_PLAN.md`、`docs/CODEX_EXECUTION_LOOP.md`。
- 删除 `goals/P0-product-positioning/`。
- 回退 `docs/NEXT_ACTIONS.md`、`docs/SOP/README.md`、`docs/DEV_LOG.md` 中本轮追加内容。

下一步建议：

- 下一轮优先执行 A2：产品库真实数据修复与成本可信化。
- A2 应先创建 `.ai/tasks/A2-product-catalog-cost-trust.yml`，再按产品库真实 Excel、云端产品库、供应商成本、报价调用四条线做对抗性验收。

## 2026-07-05

日期：2026-07-05

修改目标：完成阶段 0 收口与阶段 1 启动准备，只建立状态文档、验收清单、下一步任务包和 SOP。

修改原因：当前项目经历多轮产品库、报价、供应商和 DeepSeek 修复，版本边界和下一步范围容易漂移；在继续写业务代码前，需要先把当前阶段、可测范围、不可测范围、风险和后续任务包固定下来。

关联 bug：

- BUG-20260702-001 产品库导入和报价匹配仍需客户验收。
- BUG-20260703-005 云端产品库与本地覆盖层需要继续保持清晰边界。
- BUG-20260704-001 DeepSeek 全程接入需要继续按验收清单检查。

关联功能：

- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填
- F-006 报价明细、汇总与缺成本检查
- F-011 订单管理与成交转订单
- F-012 AI 模型配置与报价规则设置
- F-018 Agent Gateway 权限与日志骨架

涉及文件：

- `docs/PROJECT_STATUS.md`
- `docs/NEXT_ACTIONS.md`
- `docs/QUOTE_ACCEPTANCE_REPORT.md`
- `docs/SOP/README.md`
- `docs/DATABASE_PHASE_1_DRAFT.md`
- `docs/DEV_LOG.md`

具体改动：

- 新增当前项目阶段状态文档，明确已完成、半成品、未开始、可客户测试和不可客户测试范围。
- 新增下一步任务包文档，拆出 A 产品库字段匹配 / Excel 汇总表对齐、B 订单管理最小闭环、C 登录与权限管理最小闭环。
- 新增客户验收报告，按重庆、北京、跨城市等场景定义通过和失败标准。
- 新增开发 SOP，规定每轮开工前读 `CLAUDE.md`、扫描状态、先出方案、结束更新日志和验证结果。
- 按最新交付要求补充 SOP：每轮执行完毕必须提供本地端口、端口健康检查结果和排除敏感文件后的压缩包路径。
- 新增阶段 1 数据库草案，仅记录建议表和字段，不执行迁移。

验证结果：

- 已执行 `git status --short --branch`，确认本轮开始前仅有用户要求放入根目录的 `CLAUDE.md` 未跟踪。
- 已检查 `docs/` 现有文件，确认本轮新增文档不覆盖已有文档。
- 已按交付纪律准备本地端口检查和压缩包输出。
- 本轮为文档收口，没有运行业务测试；下一轮涉及代码时必须按 `docs/QA_CHECKLIST.md` 执行专项验证。

是否影响旧功能：否。本轮没有改 `app.js`、`server.js`、报价逻辑、数据库执行脚本、部署配置或环境变量。

回退方式：

- 删除本轮新增的 `docs/PROJECT_STATUS.md`、`docs/NEXT_ACTIONS.md`、`docs/QUOTE_ACCEPTANCE_REPORT.md`、`docs/SOP/README.md`、`docs/DATABASE_PHASE_1_DRAFT.md`。
- 从 `docs/DEV_LOG.md` 删除本条 2026-07-05 记录。

下一步建议：

- 下一轮优先执行任务包 A：产品库字段匹配 / Excel 汇总表对齐。
- 原因是报价交付最依赖产品库成本可信度；产品库字段和成本来源没有完全稳定前，不建议先做订单或权限。

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

---

日期：2026-07-05

修改目标：执行 A1 产品库与报价明细稳定化，先做前端减法、缺成本展示修复和报价行同步安全收口。

修改原因：乐哥反馈产品库和报价明细页面仍显得复杂，普通用户会看到重置产品库、原始字段、供应商资源、AI 清洗、同步产品库等内部操作；报价明细匹配成功后仍有大量绿色来源提示，影响客户测试观感。产品目标应是“直接展示成本、缺成本明确提示、诊断信息折叠保留”。

关联 bug：

- BUG-20260702-001
- BUG-20260703-008

关联功能：

- F-004 产品资源库与导入
- F-005 产品资源匹配与报价成本回填
- F-006 报价明细、汇总与缺成本检查

涉及文件：

- `index.html`
- `app.js`
- `styles.css`
- `tests/a1-ui-simplification.test.js`
- `docs/DEV_LOG.md`

具体改动：

- 从产品库主操作区隐藏“重置为系统产品库”入口，保留底层 `clearProductCatalog()` 函数，避免普通用户误清本地覆盖层。
- 产品库普通品类主表改为只显示：资源名称、品类、城市、服务类型/规格、成本价、参考售价、供应商。
- 景点门票主表改为只显示：景点名称、城市、成本价、参考售价、供应商、缺成本提示。
- 产品库主表不再默认展示状态、来源、备注、原始字段、供应商资源、编辑、AI 清洗和供应商跳转等内部操作。
- 成本为空时统一显示“待补成本”，不把空成本当 0；只有明确 `isFree=true` 的资源才允许显示 0。
- 报价明细匹配成功时不再默认渲染绿色来源提示，未匹配、待确认、缺成本、待清洗仍显示短提示；完整来源保留在诊断面板。
- 用车分段拆分只显示需要处理的异常项，不再把每个成功分段都渲染成绿色标签。
- 报价行操作改为“选资源”主按钮 + “更多”折叠操作，减少报价表按钮堆叠。
- 报价项同步产品库时移除“同步为正式产品”，只允许先“保存为产品库草稿”，状态固定为“待清洗”。
- 新增 A1 静态回归测试，防止重置入口、正式同步入口和复杂主表字段回弹。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `node --test tests/*.test.js` 35 项通过。

是否影响旧功能：影响产品库和报价明细的默认展示方式；不改导入解析、不改 DeepSeek、不改数据库、不改报价主流程。被隐藏的产品库行级能力和重置函数仍保留在代码中，后续可按权限或诊断入口重新开放。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`。
- 若只回退产品库页面减法，恢复 `index.html` 产品库按钮和 `app.js` 中 `renderProductCategoryTable()` / `renderTicketProductCategoryTable()`。
- 若只回退报价明细减法，恢复 `sourceNote()`、`vehicleBreakdownHtml()` 和 `quoteRowActions()`。

下一步建议：

- 用真实客户流程浏览器验收产品库与报价明细：重点看门票字段是否清爽、报价行是否只显示价格和短状态、缺成本是否红色明确。
- 下一轮再处理图片/PDF 导出和跨城市接送机行程识别，不要和本轮产品库展示修复混在一起。

---

日期：2026-07-05

修改目标：搭建 AI 协同开发工作流 v1，让后续模块按照“任务文件 -> AI 执行 -> 自动测试 -> AI 审核 -> 修复循环 -> 输出报告 -> 推荐下一阶段”推进。

修改原因：友易行多轮开发后版本、需求、bug 和交付物容易混在一起；后续不适合每个小问题都让用户确认，需要改为用户审批大模块，AI 在授权边界内自行拆解、执行、测试、审查和打包。

关联 bug：

- 无新增业务 bug。本轮是开发流程和文档基建。

关联功能：

- F-020 AI 协同开发工作流 v1

涉及文件：

- `.ai/agents/planner.md`
- `.ai/agents/coder.md`
- `.ai/agents/reviewer.md`
- `.ai/agents/qa.md`
- `.ai/agents/release.md`
- `.ai/tasks/README.md`
- `.ai/tasks/task-template.yml`
- `.ai/reports/README.md`
- `.ai/state/project_state.template.json`
- `goals/README.md`
- `goals/_template/GOAL.md`
- `goals/_template/GOALS.md`
- `goals/_template/REPORT.md`
- `goals/_template/ACCEPTANCE.md`
- `scripts/ai/detect-test-scope.mjs`
- `scripts/ai/verify-module.mjs`
- `scripts/ai/select-next-task.mjs`
- `scripts/ai/generate-pr-summary.mjs`
- `CLAUDE.md`
- `docs/SOP/README.md`
- `docs/NEXT_ACTIONS.md`
- `docs/DEV_LOG.md`

具体改动：

- 新增 `.ai/agents/`，定义 Planner、Coder、Reviewer、QA、Release 的职责和红线。
- 新增 `.ai/tasks/task-template.yml`，固定模块任务文件字段：id、title、stage、approved、owner_agent、allowed_files、forbidden_files、redlines、scope、out_of_scope、acceptance、required_commands、risk_level、rollback、next_candidates。
- 新增 `.ai/reports/` 和 `.ai/state/`，用于后续模块报告和项目状态沉淀。
- 新增 `goals/_template/`，提供 GOAL、GOALS、REPORT、ACCEPTANCE 四个模块交付模板。
- 新增 `scripts/ai/detect-test-scope.mjs`，根据 git diff、未跟踪文件和敏感路径判断测试范围、风险和阻断项。
- 新增 `scripts/ai/verify-module.mjs`，统一执行 `git status --short --branch`、`node --check app.js`、`node --check server.js`、`node --test tests/*.test.js`。
- 新增 `scripts/ai/select-next-task.mjs`，读取 `docs/NEXT_ACTIONS.md`、`docs/PROJECT_STATUS.md` 和 `.ai/tasks/*.yml`，输出下一模块推荐但不自动执行。
- 新增 `scripts/ai/generate-pr-summary.mjs`，根据 git diff 生成交付摘要草稿。
- 更新 `CLAUDE.md`，写入模块自治执行模式和 AI 协同中控层。
- 更新 `docs/SOP/README.md`，写入 AI 协同工作流 v1 的固定流程。
- 更新 `docs/NEXT_ACTIONS.md`，说明后续如何按任务集推进。

验证结果：

- `node --check scripts/ai/detect-test-scope.mjs` 通过。
- `node --check scripts/ai/verify-module.mjs` 通过。
- `node --check scripts/ai/select-next-task.mjs` 通过。
- `node --check scripts/ai/generate-pr-summary.mjs` 通过。
- `node scripts/ai/detect-test-scope.mjs` 通过，能识别当前 diff 中的 `app.js`，输出风险等级 `medium`，推荐 `node --check app.js` 和 `node --test tests/*.test.js`。
- `node scripts/ai/select-next-task.mjs` 通过，推荐下一模块为 A2 产品库真实数据修复与成本可信化。
- `node scripts/ai/verify-module.mjs` 通过：`git status --short --branch`、`node --check app.js`、`node --check server.js`、`node --test tests/*.test.js` 均完成，35 项测试通过。

是否影响旧功能：否。本轮不改报价业务逻辑、不改产品库数据、不改订单模块、不改权限模块、不改老板看板、不迁移数据库、不改 `.env`、不改 DeepSeek 配置、不部署 production。

回退方式：

- 删除新增 `.ai/`、`goals/`、`scripts/ai/` 文件。
- 回退 `CLAUDE.md`、`docs/SOP/README.md`、`docs/NEXT_ACTIONS.md`、`docs/DEV_LOG.md` 中本轮追加段落。

下一步建议：

- 下一轮优先执行 A2：产品库真实数据修复与成本可信化。
- A2 开工前先由 Planner 创建 `.ai/tasks/A2-product-catalog-cost-trust.yml`，再由 Coder/QA/Reviewer/Release 按流程推进。

---

日期：2026-07-05

修改目标：建立仓库级 AI 协同说明，让 Trae、WorkBuddy、Codex、Claude Code 或其他 AI 进入仓库后，明确项目定位、角色分工、红线、审查、验收和交付格式。

修改原因：上一轮已建立 `.ai/` 协同骨架，但缺少仓库根目录级 `AGENTS.md`。后续多个 AI 进入同一仓库时，需要一个统一入口，避免不同 AI 同时大改 `app.js`、误碰密钥、误改 DeepSeek、误动数据库或跳过测试。

关联 bug：

- 无新增业务 bug。本轮是 AI 协同说明和文档建设。

关联功能：

- F-020 AI 协同开发工作流 v1

涉及文件：

- `AGENTS.md`
- `.ai/agents/planner.md`
- `.ai/agents/coder.md`
- `.ai/agents/reviewer.md`
- `.ai/agents/qa.md`
- `.ai/agents/release.md`
- `docs/SOP/README.md`
- `docs/NEXT_ACTIONS.md`
- `docs/DEV_LOG.md`

具体改动：

- 新增 `AGENTS.md`，作为所有 AI 进入仓库后的总说明书，写明项目定位、当前阶段、角色分工、文件红线、`app.js` 风险、分支建议、标准工作流和提交报告格式。
- 强化 Planner、Coder、Reviewer、QA、Release 五个角色文件，明确各自职责、默认权限、审查/验收/交付输出格式和红线。
- 更新 `docs/SOP/README.md`，补充多 AI 协同流程、开工前必读文件、Reviewer 审查规则、QA 验收规则、必须询问用户和不需要询问用户的边界。
- 更新 `docs/NEXT_ACTIONS.md`，补充 Trae / WorkBuddy 接入方式，以及下一轮 A2 任务文件建议。

验证结果：

- `git status --short --branch` 已执行，确认本轮新增 `AGENTS.md` 并更新指定协同文档；工作区仍包含上一轮 A1 未提交代码与文档变更，本轮未回滚或覆盖。
- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `node --test tests/*.test.js` 通过，35 项测试全部通过。

是否影响旧功能：否。本轮只做 AI 协同说明和文档建设，不改报价逻辑、不改产品库数据、不做新功能、不改数据库、不改环境变量、不部署、不重构 `app.js`。

回退方式：

- 删除 `AGENTS.md`。
- 回退 `.ai/agents/*.md` 到上一版本。
- 回退 `docs/SOP/README.md`、`docs/NEXT_ACTIONS.md`、`docs/DEV_LOG.md` 中本轮追加内容。

下一步建议：

- 下一轮执行 A2：产品库真实数据修复与成本可信化。
- 先创建 `.ai/tasks/A2-product-catalog-cost-trust.yml`，再开始代码修改。

---

日期：2026-07-05

修改目标：补充 AI 协同权限边界，明确本项目 Coder 只能是 Codex，只有 Codex 可以直接写代码。

修改原因：乐哥明确要求“这个 coder 就是 Codex，只有你可以写代码”。为避免 Trae、WorkBuddy 或其他 AI 误以为自己可以直接修改业务代码，需要把 Codex-only 写代码规则写入仓库级协同文档。

关联 bug：

- 无新增业务 bug。本轮是 AI 协同权限边界文档更新。

关联功能：

- F-020 AI 协同开发工作流 v1

涉及文件：

- `AGENTS.md`
- `.ai/agents/coder.md`
- `docs/SOP/README.md`
- `docs/NEXT_ACTIONS.md`
- `docs/DEV_LOG.md`

具体改动：

- `AGENTS.md` 明确 Coder 只能是 Codex，Trae、WorkBuddy、Claude Code 或其他 AI 不允许直接写代码。
- `.ai/agents/coder.md` 明确只有 Codex 可以直接修改业务文件和应用补丁。
- `docs/SOP/README.md` 明确 Codex 是唯一 Coder，其他 AI 只能规划、审查、验收或交付建议。
- `docs/NEXT_ACTIONS.md` 明确下一轮 A2 中 Coder 只能由 Codex 执行。

验证结果：

- `git status --short --branch` 已执行，确认本轮只新增/更新 AI 协同说明相关文档；工作区中 `app.js` 仍为上一轮 A1 遗留修改，本轮未改业务逻辑。
- 已逐项检查 `.github/workflows`、`.env`、`.env.supabase.local`、`db/schema.sql`、`server.js`、`package.json`、`package-lock.json`、`pnpm-lock.yaml`、`data/products`，均无本轮新增改动。
- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `node --test tests/*.test.js` 通过，35 项测试全部通过。
- 已用 `rg` 检查 Codex-only 写代码规则写入 `AGENTS.md`、`.ai/agents/coder.md`、`docs/SOP/README.md`、`docs/NEXT_ACTIONS.md` 和 `docs/DEV_LOG.md`。

是否影响旧功能：否。本轮只改协同说明文档，不改报价逻辑、不改产品库数据、不改数据库、不改环境变量、不改 DeepSeek 配置。

回退方式：

- 回退上述文档中的 Codex-only 权限边界段落。

下一步建议：

- 继续保持 Trae / WorkBuddy 只做 Planner、Reviewer、QA 或 Release；实际代码修改只交给 Codex。

---

日期：2026-07-06

修改目标：按第一版上线标准补齐“报价缺成本补录 → 产品库持久记忆 → 后续报价可复用”的数据底座。

修改原因：乐哥明确第一版上线标准是报价系统加产品库调用达到客户测试可用；后续小易助手、老板 OP、供应商字段重设计、新 UI 和权限模板都是后续大模块，不能混进第一版。

关联 bug：

- 缺成本补录只能停在当前报价或浏览器草稿，不能成为后续可复用产品库数据。
- 云端产品库启用时，本地覆盖层可能被忽略，导致 OP 补齐的数据无法进入后续匹配。
- AI Provider 文案和配置过度绑定 DeepSeek，不利于客户上线后使用自有接口。

关联功能：

- F-021 第一版产品库自补全数据底座。
- F-022 AI Provider 脱敏与 OpenAI-compatible 配置。
- F-023 应用模块清单 `app.manifest.json`。

涉及文件：

- `.env.example`
- `app.js`
- `app.manifest.json`
- `index.html`
- `server.js`
- `tests/a1-ui-simplification.test.js`
- `tests/product-resource-upsert-from-quote.test.js`
- `goals/phase1-intelligent-quote-closed-loop/GOAL.md`
- `goals/phase1-intelligent-quote-closed-loop/GOALS.md`
- `goals/phase1-intelligent-quote-closed-loop/REPORT.md`
- `goals/phase1-intelligent-quote-closed-loop/ACCEPTANCE.md`
- `docs/NEXT_ACTIONS.md`

具体改动：

- 新增 `POST /api/product-resources/upsert-from-quote`，把报价台 OP 补录成本归一为产品资源。
- 产品资源回写优先使用 Supabase `product_resources`，失败或无配置时落到 `data/manual-product-resources.json`。
- `GET /api/product-resources` 和 `POST /api/product-resources/match` 合并云端资源与本地补录资源。
- 报价台“缺成本同步”按钮改为写入产品库并用于后续报价，写入成功后更新当前报价行、产品目录缓存和审计日志。
- AI 配置改为 `AI_PROVIDER` / `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL` / `AI_TEMPERATURE`，保留 `DEEPSEEK_*` 兼容。
- 新增 `app.manifest.json`，声明第一版模块边界，并把小易助手、老板 OP、供应商字段重设计、新 UI、权限模板标记为延后。
- 客户报价单继续隐藏建议字段、成本、毛利、供应商和员工判断字段。
- 产品资源匹配分数封顶到 100。

验证结果：

- `node --check server.js` 通过。
- `node --check app.js` 通过。
- `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check` 通过。
- `node --test tests/*.test.js` 通过，39 项全部通过。
- HTTP 验证确认：报价补录资源可写入、查询、匹配；临时验证资源随后从 Supabase 下架，并确认后续查询不再返回。
- 已重启 `http://127.0.0.1:8787/`，返回 `HTTP/1.1 200 OK`。

是否影响旧功能：

- 不改变 OP 主路径：仍是确认线路后刷新报价。
- 不进入阶段 2，不做完整 ERP，不做老板 OP 大模块，不做权限模板。
- 不执行数据库结构迁移，不删除线上数据，不修改真实 `.env`。

回退方式：

- 回退 `server.js` 中产品资源回写、云端/本地合并查询和匹配部分。
- 回退 `app.js` 中缺成本同步按钮和 `applyQuoteProductSync` 的服务端写入调用。
- 删除 `app.manifest.json` 和 `tests/product-resource-upsert-from-quote.test.js`。

下一步建议：

- 乐哥用 Majfuza 真实案例复验：客户需求识别、中文主行程、英语导游、产品库匹配、含导游 / 不含导游总价、缺成本补录后后续匹配。
- 复验通过后进入部署前检查，不进入小易助手、老板 OP、供应商字段、新 UI 或权限模板。

---

日期：2026-07-06

修改目标：修复刷新报价时报 `youyixing_project_state exceeded the quota` 的浏览器本地存储超额问题。

修改原因：报价行里带有产品库候选资源 `candidates`，候选资源又包含 Excel 原始字段 `rawFields/raw` 和诊断数据。保存项目快照时把这些运行时大对象一起写入 `localStorage`，Chrome 单站点额度被撑爆，导致刷新报价失败。

涉及文件：

- `app.js`
- `index.html`
- `tests/a1-ui-simplification.test.js`

具体改动：

- 新增项目快照压缩保存：剔除 `candidates`、`rawFields`、`raw`、诊断、图片 base64、文件对象等运行时大字段。
- `saveProjectState()` 和 `saveQuoteVersions()` 改为 `setLocalStorageJson()`，遇到 quota 时自动清理临时诊断缓存，并降级保存当前项目最小快照。
- `saveCurrentProjectSnapshot()` 保存前先生成瘦身快照。
- `index.html` 更新 `app.js` 缓存版本为 `20260706-storage-quota-fix`。
- 新增测试，防止后续把候选资源和原始字段重新塞回项目状态。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check` 通过。
- `node --test tests/*.test.js` 通过，40 项全部通过。
- 已重启 `http://127.0.0.1:8787/`，返回 `HTTP/1.1 200 OK`。
- 首页已加载 `app.js?v=20260706-storage-quota-fix`。

边界：

- 本轮只修本地存储超额，不改报价计算、不改产品库匹配、不改客户报价单字段。
