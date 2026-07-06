# NEXT_ACTIONS

日期：2026-07-05

本文记录下一轮可直接执行的小任务包。每轮只能选择一个任务包推进，开工前必须再次读取 `CLAUDE.md`、`docs/PROJECT_STATUS.md` 和本文件。

## 2026-07-06 第一版上线底座最新状态

乐哥最新确认：第一版上线标准不是继续扩展 ERP，而是让“报价 + 产品库调用”达到客户测试可用。

已落地：

- 报价缺成本补录可通过 `POST /api/product-resources/upsert-from-quote` 写入产品库持久层。
- 有 Supabase 配置时写入 `product_resources`；无云端配置或云端失败时写入 `data/manual-product-resources.json`。
- 产品库查询和匹配接口会合并云端资源与本地补录资源，后续报价可以复用员工补齐的数据。
- 补录资源保留 `OP补录待复核` 状态，第一版可用，后续再做老板复核、回滚、权限和供应商主数据治理。
- DeepSeek 只是默认模板，客户部署可改用自己的 OpenAI-compatible `AI_*` 接口；前端只显示脱敏状态。
- `app.manifest.json` 已记录第一版模块边界：当前只做 `ai-gateway`、`customer-demand`、`itinerary`、`product-catalog`、`quote-engine`、`cost-review`、`proposal`。

下一步只建议做两件事：

1. 乐哥用 Majfuza 案例做客户视角复验：中文主行程、英语导游、含导游 / 不含导游总价、产品库匹配、缺成本补录后能再次匹配。
2. 复验通过后做部署前检查：真实 API 配置、Supabase 权限、备份、域名/端口、日志脱敏、导出 PDF/图片、成交转订单手工 smoke。

明确延后：

- 小易智能报价助手扩展。
- 老板 OP 管理中心。
- 供应商侧整体字段重设计。
- 新前端 UI 系统。
- 权限对应 UI 模板。

## P0 产品定位与阶段路线冻结结果

2026-07-06 已冻结当前产品定位和三阶段路线：

- 产品定位：友易行是入境游旅行社内部经营中控台，不是单一报价页面。
- 第一阶段：销售报价可信 MVP，重点是产品库成本可信、线路合理、报价可保存和可下载。
- 第二阶段：订单与 OP 执行，重点是成交转订单、订单快照、OP 任务和供应商确认。
- 第三阶段：老板经营看板与智能化，重点是权限、经营数据和小易建议助手。

后续任务必须优先保证第一阶段“报价可信”。产品库成本未稳定前，不进入订单大功能；报价系统未稳定前，不进入老板看板。

本轮新增定位文档：

- `docs/PRODUCT_POSITIONING.md`
- `docs/STAGE_PLAN.md`
- `docs/CODEX_EXECUTION_LOOP.md`
- `goals/P0-product-positioning/`

## 推荐顺序

1. A：产品库字段匹配 / Excel 汇总表对齐
2. C：登录与权限管理最小可交付
3. B：订单管理最小闭环

推荐先做 A，因为报价系统交付的核心信任来自产品库成本。只要产品库字段、成本来源、缺成本提示不稳定，后面的订单和权限都只能建立在不可靠报价上。

## AI 协同任务集推进方式

从下一轮开始，后续业务模块必须先落成 `.ai/tasks/<task-id>.yml`，再执行。

执行顺序：

1. Planner 把客户反馈和本文件拆成任务文件。
2. 用户只审批模块，例如 A2、A3、B1、C1。
3. Codex 作为唯一 Coder，在任务文件边界内自行推进子任务。
4. QA 使用 `node scripts/ai/detect-test-scope.mjs` 判断测试范围。
5. Coder 或 QA 使用 `node scripts/ai/verify-module.mjs` 跑常规验证。
6. Reviewer 根据 diff、红线和验收标准决定是否通过。
7. Release 生成交付报告、压缩包和下一阶段建议。

推荐脚本：

```bash
node scripts/ai/select-next-task.mjs
node scripts/ai/detect-test-scope.mjs
node scripts/ai/verify-module.mjs
```

当前推荐下一业务模块：A2 产品库真实数据修复与成本可信化。

原因：

- 产品库成本可信度仍是报价系统交付的根。
- 第一阶段验收标准已经从“报价能跑”升级为“报价可信”。
- A2 必须先固定产品库和供应商成本库边界，再修报价调用。
- 产品库成本未稳定前，不建议进入订单大闭环。
- 报价系统未稳定前，不进入老板看板。
- 数据库迁移、线上数据和密钥仍必须人工确认。

## 下一轮推荐任务文件

下一轮建议先创建：

`.ai/tasks/A2-product-catalog-cost-trust.yml`

任务边界：

- 只修产品库真实数据、字段清洗、成本可信度、供应商成本回填和报价调用。
- 不做订单、权限、老板看板或小易 Agent。
- 不改 DeepSeek 配置。
- 不执行数据库迁移。
- 不让 AI 自动发布正式产品库。
- 不把空成本显示成正常 0。

验收重点：

- 北京 3 天 10 人能生成合理线路和可信报价。
- 重庆 3 天 10 人慢一点不能套用北京线路。
- 产品库和供应商成本库边界清楚。
- 缺成本明确显示“待补成本”。
- 手动补成本只能进入产品库草稿，不能直接发布正式产品。

## 多 AI 接入下一步

如果下一轮由 Trae、WorkBuddy 或其他 AI 接手，先让它执行以下动作：

1. 读取 `AGENTS.md`。
2. 读取自身角色文件，例如 `.ai/agents/coder.md`。
3. 读取本文件和 `docs/PROJECT_STATUS.md`。
4. 运行 `node scripts/ai/select-next-task.mjs`。
5. 如果没有明确任务文件，先创建 `.ai/tasks/A2-product-catalog-cost-trust.yml`，不要直接改业务代码。
6. 如果接手者不是 Codex，只能做规划、审查、验收或交付建议，不能直接写代码。

下一轮推荐任务文件：

` .ai/tasks/A2-product-catalog-cost-trust.yml`

任务目标：

- 重新审查产品库真实数据、成本字段和供应商成本回填。
- 不改 DeepSeek。
- 不迁移数据库。
- 不进入订单大闭环。
- 不做老板看板。

推荐角色：

- Planner：先生成 A2 任务文件。
- Coder：只能由 Codex 执行，按 A2 文件修产品库真实数据和成本可信化问题。
- QA：跑产品库、重庆、北京、缺成本和报价明细验收。
- Reviewer：审查是否破坏报价主流程和成本来源红线。
- Release：打包并输出交付报告。

---

## 任务包 A：产品库字段匹配 / Excel 汇总表对齐

任务名称：产品库字段匹配 / Excel 汇总表对齐

所属阶段：阶段 0 收口，产品库验收加固。

目标：

- 用真实《产品库汇总.xlsx》重新检查所有 Sheet 字段。
- 明确每个 Sheet 的标准字段、原始字段、成本字段、售价字段、供应商字段。
- 确认导入后的产品页和报价明细不再出现错位字段。
- 形成产品库字段映射报告和客户验收用数据清单。

涉及文件：

- `scripts/build-system-product-catalog.py`
- `scripts/import-product-catalog-to-supabase.js`
- `data/products/youyixing-product-catalog.json`
- `app.js`
- `server.js`
- `tests/product-catalog-import.test.js`
- `docs/QUOTE_ACCEPTANCE_REPORT.md`
- `docs/BUG_LOG.md`
- `docs/DEV_LOG.md`

不允许修改的范围：

- 不改报价页面整体流程。
- 不改 DeepSeek 配置。
- 不执行未确认的数据库结构迁移。
- 不删除现有产品字段。
- 不把空成本改成 0。
- 不让 AI 决定成本价。

验收标准：

- 7 个模板 Sheet 可识别并进入正确品类。
- 用车、导游、门票、酒店、特色体验、餐厅、线路产品都有数量报告。
- 原始字段完整保存在 `rawFields`。
- 主表不出现“导入景资源名称”“城市服务类型”“8人以下一小时规格”等错位字段。
- 重庆接机 7 座成本 250。
- 重庆送机 7 座成本 250。
- 重庆武隆包车 14 座到 17 座成本 1500。
- 重庆市内一日游 8 小时 7 座成本 700。
- 北京大兴机场接机、北京市内用车、英文导游、故宫门票能命中产品库。
- 餐厅无成本显示待补成本，不显示正常 0。
- `node --test tests/product-catalog-import.test.js` 通过。

回滚方式：

- 若只改产品库 JSON，回退该文件到上一提交。
- 若改导入脚本，执行 `git checkout -- scripts/build-system-product-catalog.py scripts/import-product-catalog-to-supabase.js` 前必须确认没有用户手工改动。
- 若发布了错误云端批次，不删除历史批次，新增一个正确批次并发布为最新。

预计风险：

- Excel 合并单元格和多行表头导致字段错位。
- 旧 localStorage 缓存污染测试结果。
- 云端产品库和静态底库数量不一致。
- 产品页展示字段不代表 `rawFields` 完整性。

---

## 任务包 B：订单管理最小闭环

任务名称：订单管理最小闭环

所属阶段：阶段 1，报价成交后的最小可交付。

目标：

- 保留当前成交转订单入口。
- 将订单最小字段固定下来。
- 报价成交后生成订单记录、保留报价版本快照、可在订单页面查看。
- 先不做完整 OP、财务、供应商付款。

涉及文件：

- `app.js`
- `index.html`
- `styles.css`
- `db/schema.sql` 或新迁移草案
- `docs/FEATURE_MAP.md`
- `docs/BUG_LOG.md`
- `docs/DEV_LOG.md`
- `docs/QA_CHECKLIST.md`

不允许修改的范围：

- 不改产品库导入规则。
- 不改报价匹配成本规则。
- 不新增复杂订单审批。
- 不新增财务结算模块。
- 不改变客户方案生成逻辑。

验收标准：

- 报价已提交或方案已确认后才显示成交转订单。
- 点击成交转订单后生成订单编号。
- 订单记录包含客户、国家、出行日期、人数、城市、成交金额、关联报价版本、状态。
- 返回订单列表后能看到该订单。
- 刷新页面后订单不丢失。
- 从订单列表可以回到关联报价项目。
- 客户可见页面不展示内部成本和供应商联系方式。

回滚方式：

- 若只做本地状态，删除新增订单字段和渲染即可回退。
- 若新增数据库草案，不执行迁移即可无运行风险。
- 若已执行迁移，必须准备 down migration；本任务包默认不执行迁移。

预计风险：

- 订单数据如果只存 localStorage，不适合正式多员工协作。
- 报价版本快照不完整会导致订单后续无法追溯。
- 订单状态和项目状态可能不同步。

---

## 任务包 C：登录与权限管理最小闭环

任务名称：登录与权限管理最小闭环

所属阶段：阶段 1，内部使用安全基础。

目标：

- 明确最小角色：老板、销售、OP。
- 建立账号、角色、页面访问、敏感字段显示规则。
- 先做最小保护，不做复杂组织架构。
- 确保销售不能看到供应商电话、成本策略等敏感信息。

涉及文件：

- `server.js`
- `index.html`
- `app.js`
- `public/js/agent/agent-permissions.js`
- `db/schema.sql` 或新迁移草案
- `docs/DATABASE_PHASE_1_DRAFT.md`
- `docs/FEATURE_MAP.md`
- `docs/DEV_LOG.md`
- `docs/QA_CHECKLIST.md`

不允许修改的范围：

- 不改报价计算公式。
- 不改产品库成本来源。
- 不暴露 Supabase service role key。
- 不把权限只做成前端隐藏。
- 不做多租户复杂后台。

验收标准：

- 老板账号可登录。
- 老板可以创建或预置员工账号。
- 销售账号可进入报价项目，但看不到供应商电话和内部成本策略。
- OP 账号可查看订单或操作相关信息。
- 未登录用户不能进入工作台。
- AI 工具调用必须带 `userId`、`role`、`tenantId`。
- L3 操作仍需人工确认，不能由 AI 自动执行。

回滚方式：

- 如果只做文档和草案，删除草案即可回退。
- 如果接入 Supabase Auth，保留旧本地入口作为开关 fallback。
- 若权限逻辑影响报价页面打开，立即关闭登录保护开关并记录 bug。

预计风险：

- RLS policy 设计不完整会导致数据泄露或全部不可读。
- 前端隐藏字段不能替代后端权限。
- 本地静态预览和带后端的测试环境行为会不同。

---

## 暂不推荐本阶段做的任务

- 老板 KPI 仪表盘。
- 完整财务收付款。
- 飞书同步。
- 多租户。
- 重写为 Next.js。
- 大规模拆分 `app.js`。

这些任务都依赖稳定产品库、报价版本和权限基础。现在直接做，会继续放大版本混乱。
