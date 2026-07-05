# CLAUDE.md｜友易行入境游旅行社内部工作台

> 本文件是给 Claude Code / Codex / AI 编程助手看的项目执行规则。  
> 项目负责人不会写代码，AI 需要主动做技术决策、拆任务、写代码、跑测试、更新文档，并保证项目不会因为“等验收 / 不知道下一步做什么”而停下来。

---

## 0. 项目一句话定位

友易行不是一个单纯的“智能报价页面”，而是一个面向入境游旅行社内部员工使用的经营中控台：

**产品库 / 供应商库可信底座 + 智能报价系统 + 成交转订单 + OP 任务提醒 + 供应商管理 + 权限管理 + 老板实时看板 + 小易 AI 助手。**

系统目标是让入境游旅行社从客户需求、行程、报价、成团、排团、供应商确认、服务执行、财务结算、员工 KPI 到老板经营分析形成闭环。

---

## 1. 当前项目真实状态

### 1.1 当前阶段

当前处于：

**阶段 0：智能报价系统交付验收 / 稳定化阶段。**

现状判断：

- 智能报价系统主体已完成。
- 客户尚未正式验收。
- 产品库已有数据底座和 Codex 搭建痕迹，但字段匹配、备注分类、成本可信度、供应商服务明细仍有缺陷。
- 订单管理、供应商管理、权限管理、老板看板还没有进入完整可交付状态。
- 现有代码可能仍包含旧原型结构，例如 `app.js`、`server.js`、`styles.css`、`index.html`、`quotable-resource-core.js` 等。
- `quotable-resource-core.js` 里的可报价资源标准化、匹配、快照逻辑是重要资产，禁止随意删掉。

### 1.2 现在不能停工

即使客户还没有验收报价系统，也不能空等。等待验收期间只能做“低风险、不破坏报价主链路”的任务：

1. 补齐测试、QA 清单、Bug Log、Feature Map。
2. 梳理产品库字段映射和 Excel 导入数据质量规则。
3. 设计并新增后端表结构、迁移脚本和类型定义，但不要破坏现有报价流程。
4. 做供应商管理的主数据模型、列表页、详情页、启用 / 停用、排名字段。
5. 做登录、角色、权限矩阵和老板账号管理原型。
6. 写订单 / OP 任务的数据模型和 API contract。
7. 把重复逻辑逐步抽到 `packages/domain-*`，禁止大规模推倒重写。
8. 更新 `docs/PROJECT_STATUS.md`、`docs/NEXT_ACTIONS.md`、`docs/SOP/`。

### 1.3 模块自治执行模式

从 2026-07-05 起，友易行采用“AI 协同开发工作流 v1”。

用户只审批大模块，例如：

- A2 产品库真实数据修复与成本可信化。
- A3 一键同步产品库草稿闭环。
- B1 订单管理最小闭环。
- C1 登录与权限管理最小闭环。

模块一旦被批准，AI 编程助手必须在授权边界内自行完成：

1. 拆解子任务。
2. 修改代码。
3. 修复授权范围内的小 bug。
4. 补测试。
5. 跑验证。
6. 更新文档。
7. 写 `docs/DEV_LOG.md`。
8. 打包产物。
9. 推荐下一阶段。

只有遇到以下红线才停下来问用户：

- 需要修改 `.env`、`.env.*`、`runtime-settings.json` 或任何密钥文件。
- 需要执行数据库迁移、删除云端数据、改 production 配置或部署 production。
- 需要改变报价主流程、成本来源规则、权限红线或供应商敏感信息暴露规则。
- 任务范围明显超出已批准模块。
- 需要执行 `git reset --hard`、强制覆盖用户改动或其他不可逆操作。

### 1.4 AI 协同中控层

仓库内新增 `.ai/`、`goals/` 和 `scripts/ai/` 作为 AI 协同中控层。

固定流程：

1. Planner 把用户反馈整理成 `.ai/tasks/<task-id>.yml`。
2. Coder 按任务文件执行代码、测试和文档更新。
3. QA 根据 diff 和任务文件决定测试范围并运行验证。
4. Reviewer 只看 diff、需求、红线和验收标准，判断是否通过。
5. Release 在验证通过后输出报告、压缩包和下一步建议。

常用脚本：

- `node scripts/ai/detect-test-scope.mjs`：根据 git diff 判断测试范围和风险。
- `node scripts/ai/verify-module.mjs`：运行项目常规验证。
- `node scripts/ai/select-next-task.mjs`：读取项目文档和任务文件，推荐下一模块，不自动执行。
- `node scripts/ai/generate-pr-summary.mjs`：生成交付 / PR 摘要草稿。

---

## 2. 产品核心模块

### 2.1 智能报价系统

必须支持：

- 销售录入客户需求。
- AI 或系统拆解结构化需求草稿。
- 销售确认需求。
- 行程生成 / 导入 / 编辑。
- 系统拆出 `quote_requirement_items`。
- Match Engine 查询产品库和供应商成本。
- 生成候选资源 `quote_line_candidates`。
- 缺成本、多候选、过期价格、低毛利必须进入人工确认。
- 人工确认后生成 `quote_lines`。
- 生成冻结的 `quote_versions`。
- 生成客户方案 `proposals`，客户方案不得暴露内部成本、内部备注、供应商敏感信息。

### 2.2 产品库

产品库要从“Excel 数据堆”升级成“可报价、可审计、可回滚、可协作维护”的产品资源中心。

数据分层：

1. `raw_import_rows`：原始 Excel 行，永不覆盖，只用于溯源、回滚、重新清洗。
2. `staging_products`：自动字段映射后的临时产品，允许人工修正。
3. `normalized_products` / `product_resources`：结构化产品资源。
4. `published_products` / 发布批次：正式报价只读取已发布数据。

产品库必须支持：

- Excel 批次导入。
- 字段自动映射。
- raw fields 完整保留。
- 备注拆解为：价格政策、取消政策、预订政策、保票政策、内部备注、对客备注、风险备注、操作备注。
- 数据质量门禁：缺城市、缺名称、价格为空、价格为 0、供应商缺失、有效期缺失、重复资源。
- 发布批次和回滚。
- 每个产品资源有数据质量状态。
- 报价只能调用 published 数据，不能直接调用 raw Excel 行。

### 2.3 订单管理系统

报价成交后，系统必须能自动生成订单。

订单管理必须支持：

- 报价版本成交后 `convert-to-order`。
- 订单追踪。
- 订单状态：待确认、已确认、执行中、已完成、已取消、待结算。
- 订单关联客户、报价版本、产品资源、供应商、负责人、OP。
- 自动生成 OP 任务。
- 任务按日期提醒，例如：客人即将抵达、需要确认供应商、需要联系导游、需要联系车队、需要发送出团信息。
- 订单状态变化写入 `domain_events`。
- 订单可追溯到报价版本和报价行快照。

建议 OP 任务模板：

- D-14：确认酒店 / 车队 / 导游 / 门票供应商。
- D-7：二次确认车队、导游、用餐、特殊要求。
- D-3：确认最终名单、航班、酒店、集合时间。
- D-1：发送出团提醒，确认导游和车队。
- D0：客人抵达提醒，OP 跟踪执行状态。
- D+1：服务反馈和异常记录。
- 订单完成后：财务结算、供应商评价、产品库沉淀。

### 2.4 供应商管理系统

供应商不是联系人目录，而是“成本、服务能力、风险、价格有效期、订单确认”的管理中心。

必须支持：

- 供应商主档：名称、类型、城市、品类、状态、联系人、电话、微信 / 邮箱、结算方式、支付信息、资质文件、备注。
- 供应商服务明细：车型、线路、语种、房型、餐标、价格、币种、有效期、取消规则、供应商确认方式。
- 供应商启用 / 停用，第一版禁止硬删除。
- 供应商排名：按服务评分、准时率、投诉数、价格稳定性、确认响应速度、人工权重排序。
- 风险记录：迟到、投诉、临时涨价、资质过期、服务不稳定。
- 服务明细可挂接到多个产品资源。
- 成交后自动生成供应商确认任务。
- 供应商价格过期提醒。

### 2.5 系统权限管理

第一版必须至少有 3 个角色：

1. `sales`：销售 / 定制师。
2. `op`：操作 / OP。
3. `owner`：老板 / 总经理。

后续可扩展：`admin`、`finance`、`product_manager`、`viewer`、`agent_service`。

权限红线：

- 销售不能查看供应商敏感信息，包括供应商支付信息、内部成本、供应商联系方式详情、供应商银行账号。
- 销售可以看到自己需要的报价结果、客户方案、销售价、毛利提示，但不能看到完整供应商底层资料。
- OP 可以在自己负责的订单中查看必要供应商联系人和执行信息。
- 老板拥有老板看板，可以查看所有员工工作情况、报价次数、成交量、提交订单量、OP 超时任务、财务风险。
- AI Agent 不能绕过权限读取数据。

### 2.6 老板看板

老板看板不是静态 BI 图表，而是“动作型实时经营看板”。

必须展示：

- 今日新增线索。
- 今日提交报价数。
- 本周成交订单。
- 本月 GMV。
- 本月预计毛利。
- 待收款金额。
- 待付款金额。
- 高风险订单数。
- 销售报价次数、成交次数、成交率。
- OP 今日任务、超时任务、处理订单量。
- 供应商价格即将过期。
- 低毛利报价待审批。
- 缺成本报价待处理。

数据来源必须优先来自：

- `domain_events`
- `quote_versions`
- `orders`
- `operation_tasks`
- `receivables`
- `payables`
- `audit_logs`

禁止只从前端页面状态拼凑老板看板。

### 2.7 老板后台账号管理

老板权限后台必须包含“员工账号管理”功能：

- 创建员工账号。
- 设置姓名、手机号 / 邮箱、角色、所属门店 / 团队、启用状态。
- 生成临时密码或邀请链接。
- 支持发送账号和临时密码。
- 首次登录必须强制改密码。
- 临时密码必须有过期时间。
- 不允许明文保存密码。
- 不允许前端使用 `service_role` key。
- 创建、重置、停用账号必须写入 `audit_logs`。

推荐实现：

- 使用 Supabase Auth 管理登录身份。
- 使用 `profiles` / `staff_profiles` 保存业务员工资料。
- 使用 `user_roles` 或 `memberships` 保存角色。
- 老板后台通过服务端 API 调用 Supabase Admin API 创建用户，服务端必须校验当前用户是 `owner` 或 `admin`。
- 临时密码只在创建时显示一次，并强制用户首次登录修改。

---

## 3. 技术栈决策

### 3.1 总原则

用户不会写代码，AI 必须选择最主流、成熟、可维护、适合云部署的技术栈。

禁止为了炫技引入复杂架构。先保证：能上线、能维护、能验收、能扩展、能交付给真实旅行社老板使用。

### 3.2 目标技术栈

前端：

- Next.js App Router。
- React。
- TypeScript。
- Tailwind CSS。
- shadcn/ui。
- TanStack Table。
- Recharts 或 Tremor。
- Zod 表单与 API 入参校验。

后端：

- Node.js + TypeScript。
- Next.js Route Handlers 或独立 `apps/api` 服务。
- 业务服务分层：Quote Service、Product Service、Supplier Service、Order Service、Dashboard Service、Notification Service、Agent Gateway。
- 复杂领域逻辑放到 `packages/domain-*`，不要写死在页面组件里。

数据库：

- PostgreSQL。
- Supabase Postgres 作为 MVP 主数据底座。
- Supabase Auth 作为登录与身份系统。
- Supabase Row Level Security 作为租户隔离和权限防线。
- SQL migrations 必须进入仓库。
- 可使用 Drizzle ORM 或 SQL typed client，但不要让 ORM 掩盖核心 SQL 和权限规则。

实时与通知：

- MVP 使用 `domain_events` + `notification_outbox` + 定时 jobs。
- 老板看板和员工提醒可使用 Supabase Realtime。
- 复杂长流程稳定后再考虑 Temporal / Windmill。

AI / Agent：

- 短期不要做复杂多 Agent。
- 先做 `Agent Gateway`：工具注册、权限判断、参数校验、数据脱敏、调用业务 API、记录日志、人工确认。
- 后续可引入 LangGraph / LlamaIndex 做可恢复流程和知识库检索。

部署：

- MVP 推荐：Next.js 部署到专属云服务或 Vercel，数据库使用 Supabase 托管 Postgres。
- 如果客户明确要求“专属服务器”：使用 Ubuntu LTS 云服务器 + Docker Compose + Caddy / Nginx + Next.js standalone + worker。
- 不建议第一版自托管完整 Supabase，除非客户强制要求。
- 生产环境必须配置域名、HTTPS、备份、日志和环境变量。

---

## 4. 渐进式重构策略

本项目禁止一上来推倒重做。

必须采用“外科手术式重构”：

1. 保留现有可用入口和业务流程。
2. 给旧函数包 API / Service Adapter。
3. 把产品库、供应商、报价、订单、财务逐步迁到后端主数据。
4. `localStorage` 只能保留草稿和 UI 缓存，不能作为正式业务数据源。
5. Match Engine 独立成共享领域包，前端、后端、Agent 都调用同一套逻辑。
6. 报价版本必须冻结快照，产品库后续改价不能影响历史报价。
7. 每个阶段都必须有验收标准，不能只说“差不多”。

---

## 5. 推荐项目目录结构

如果当前项目还是旧结构，不要一次性搬迁全部文件。先保留旧入口，再逐步迁移到以下目标结构。

```txt
youyixing/
  CLAUDE.md
  README.md
  package.json
  pnpm-workspace.yaml

  apps/
    web/                         # Next.js/React 前端
      app/
      components/
      features/
        quotes/
        products/
        suppliers/
        orders/
        dashboard/
        auth/
      lib/
      styles/

    api/                         # 可选：独立 API 服务；如果不用独立服务，则用 Next.js route handlers
      src/
        routes/
        services/
        repositories/
        middlewares/

  packages/
    domain-quote/                # 报价需求项、候选、报价行、报价版本、毛利策略
      src/
      tests/
    domain-pricing/              # Match Engine、价格有效期、快照、空成本策略
      src/
      tests/
    domain-product/              # 产品库清洗、Excel 映射、发布批次、备注拆解
      src/
      tests/
    domain-supplier/             # 供应商主档、服务明细、评分、风险、价格有效期
      src/
      tests/
    domain-order/                # 订单、OP 任务、供应商确认、提醒规则
      src/
      tests/
    domain-auth/                 # 角色权限、字段脱敏、租户策略
      src/
      tests/
    domain-agent-tools/          # Agent 工具 schema、权限、审计
      src/
      tests/
    ui/                          # 共享 UI 组件
      src/

  db/
    migrations/
    seed/
    policies/
    functions/

  scripts/
    import-product-catalog/
    data-quality/
    migrate-legacy-data/
    create-owner-account/
    backup/

  docs/
    PROJECT_STATUS.md
    NEXT_ACTIONS.md
    FEATURE_MAP.md
    BUG_LOG.md
    QA_CHECKLIST.md
    API_CONTRACT.md
    DATA_DICTIONARY.md
    DEPLOYMENT.md
    SOP/
      daily-dev-loop.md
      quote-acceptance.md
      product-import.md
      supplier-management.md
      order-op-reminders.md
      account-management.md

  tests/
    unit/
    integration/
    e2e/

  legacy/                        # 如果需要临时保留 app.js/server.js，可逐步迁移到这里
```

---

## 6. 编码规范

### 6.1 TypeScript

- 新代码必须使用 TypeScript。
- 开启 `strict`。
- 禁止随意使用 `any`。
- API 入参必须使用 Zod 或等价 schema 校验。
- 所有核心领域对象必须有明确类型。

### 6.2 命名规范

数据库表：snake_case。

- `quote_projects`
- `quote_requirement_items`
- `quote_line_candidates`
- `quote_lines`
- `quote_versions`
- `product_resources`
- `supplier_service_details`
- `operation_tasks`
- `domain_events`
- `audit_logs`

TypeScript 文件：kebab-case 或按框架约定。

函数命名：动词开头。

- `createQuoteProject`
- `matchProductResources`
- `convertQuoteToOrder`
- `createOperationTasksFromTemplate`
- `sanitizeCustomerProposal`

### 6.3 金额和成本

- 金额字段数据库使用 `numeric`，不要用浮点误差严重的类型。
- 缺成本必须是 `null` 或明确状态 `missing_cost`，禁止当作 `0`。
- 价格为 0 必须是真实业务价格，并需要标记原因。
- 客户方案永远不能输出成本价、供应商底价、内部毛利规则。

### 6.4 状态机

订单、报价、任务、导入批次必须使用明确状态枚举，禁止用散乱字符串。

示例：

```ts
export const OrderStatus = {
  Draft: 'draft',
  PendingConfirm: 'pending_confirm',
  Confirmed: 'confirmed',
  Operating: 'operating',
  Completed: 'completed',
  Cancelled: 'cancelled',
  PendingSettlement: 'pending_settlement',
} as const;
```

### 6.5 API 规范

所有 API 必须：

- 校验登录。
- 校验租户 `tenant_id`。
- 校验角色权限。
- 校验请求参数。
- 返回统一错误格式。
- 对正式写入记录 `audit_logs`。
- 对关键业务动作写入 `domain_events`。
- 对可能重复提交的动作支持幂等，例如成交转订单。

统一错误格式：

```json
{
  "ok": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "当前角色无权查看供应商信息",
    "details": {}
  }
}
```

成功格式：

```json
{
  "ok": true,
  "data": {}
}
```

### 6.6 审计日志

以下动作必须写 `audit_logs`：

- 发布报价版本。
- 成交转订单。
- 修改产品核心价格字段。
- 发布 / 回滚产品库批次。
- 新增、停用、修改供应商。
- 创建 / 重置 / 停用员工账号。
- 修改角色权限。
- 财务收款 / 付款。
- AI 建议被采纳并进入正式业务数据。

审计日志字段建议：

- `id`
- `tenant_id`
- `actor_type`：`user | agent | system`
- `actor_id`
- `entity_type`
- `entity_id`
- `action`
- `before_snapshot`
- `after_snapshot`
- `reason`
- `request_id`
- `agent_run_id`
- `created_at`

---

## 7. 推荐数据库核心表

### 7.1 权限与账号

- `tenants`
- `profiles` / `staff_profiles`
- `memberships`
- `roles`
- `role_permissions`
- `account_invitations`
- `password_reset_events`

### 7.2 产品库

- `product_import_batches`
- `product_import_rows`
- `staging_products`
- `product_resources`
- `product_price_tiers`
- `product_quality_checks`
- `remark_atoms`
- `published_product_batches`

### 7.3 供应商

- `suppliers`
- `supplier_contacts`
- `supplier_service_details`
- `supplier_risk_records`
- `supplier_reviews`
- `supplier_rank_snapshots`
- `product_supplier_links`

### 7.4 报价

- `quote_projects`
- `quote_demands`
- `itinerary_days`
- `itinerary_segments`
- `quote_requirement_items`
- `quote_line_candidates`
- `quote_lines`
- `quote_versions`
- `proposals`

### 7.5 订单 / OP

- `orders`
- `order_items`
- `order_status_events`
- `operation_tasks`
- `operation_task_templates`
- `supplier_confirmations`
- `order_alerts`

### 7.6 财务

- `receivables`
- `payables`
- `payment_records`
- `settlement_batches`
- `margin_snapshots`

### 7.7 事件 / 通知 / AI

- `domain_events`
- `notification_outbox`
- `notifications`
- `audit_logs`
- `agent_runs`
- `agent_steps`
- `agent_tool_calls`
- `knowledge_docs`
- `embeddings`

---

## 8. 阶段路线图与执行游标

### 阶段 0：智能报价系统交付验收 / 稳定化

当前状态：正在执行。

目标：确认报价系统是否达到可交付状态，并输出剩余 Bug 清单、可交付范围和下一阶段计划。

必须完成：

- 跑通真实报价案例。
- 检查成本、售价、毛利、供应商来源。
- 检查页面刷新后数据是否保留。
- 检查客户方案是否隐藏成本和内部备注。
- 运行现有测试。
- 输出 `docs/QUOTE_ACCEPTANCE_REPORT.md`。
- 更新 `docs/BUG_LOG.md`。
- 更新 `docs/NEXT_ACTIONS.md`。

验收标准：

- 核心报价流程可跑通。
- 至少 3 个真实案例通过。
- 关键字段不丢失。
- 缺成本不会被当成 0。
- 报价行有来源说明。
- 客户可理解交付说明已生成。

等待客户验收时可继续做：

- 供应商表结构和页面原型。
- 产品库数据质量门禁。
- 登录和权限矩阵。
- 订单 / OP 表结构和 API contract。
- 老板看板指标口径。

### 阶段 1：登录、权限、云部署基础

目标：让系统具备真实内部员工使用的基础。

必须完成：

- Supabase Auth 登录。
- `owner`、`sales`、`op` 三种角色。
- 角色权限矩阵。
- 销售无法查看供应商敏感信息。
- 老板后台员工账号管理。
- 创建账号、发送临时密码 / 邀请链接、强制首次改密。
- 云服务器或 Vercel + Supabase 部署基线。
- 生产环境变量、HTTPS、备份、日志。

验收标准：

- 老板可创建销售账号和 OP 账号。
- 销售登录后看不到供应商敏感信息。
- OP 登录后能看到自己的任务入口。
- 老板能进入老板后台。
- 生产地址可访问。
- 服务端没有泄露 `service_role` key。

### 阶段 2：产品库 / 供应商库后端化

目标：解决产品库调用效果不好、Excel 备注噪音、供应商成本不可追溯问题。

必须完成：

- raw / staging / normalized / published 分层。
- Excel 字段映射。
- `remark_atoms` 拆解。
- 产品质量门禁。
- 供应商主档。
- 供应商服务明细。
- 供应商启用 / 停用。
- 供应商评分和排名字段。
- 产品与供应商服务明细挂接。
- 产品资源搜索和匹配 API。

验收标准：

- 原始 Excel 字段不丢。
- 报价只读取 published 产品库。
- 空成本显示待补，不进入错误计算。
- 发布批次可回滚。
- 至少 3 个真实供应商样本通过新增、编辑、停用测试。
- 至少 3 个真实产品样本能被报价和订单引用。

### 阶段 3：报价链路可追溯重构

目标：在不破坏现有报价能力的情况下，把报价链路改成可版本化、可审计、可复盘。

必须完成：

- `quote_requirement_items`。
- `quote_line_candidates`。
- 候选确认 / 拒绝原因。
- `quote_lines` 来源快照。
- `quote_versions` 冻结快照。
- 客户方案从报价版本生成。
- 报价工作台三栏式 UI：左侧客户 / 状态，中间行程 / 报价，右侧小易 / 风险 / 候选 / 审批。

验收标准：

- 每条报价行都有来源快照。
- 多候选必须人工确认。
- 缺成本、过期价格、低毛利有预警。
- 历史报价版本不受产品库更新影响。
- 客户方案不暴露内部成本、内部备注、供应商敏感信息。

### 阶段 4：订单管理与 OP 任务提醒

目标：报价成交后，系统能真正运转。

必须完成：

- 成交报价版本转订单。
- 订单列表、订单详情、订单状态追踪。
- 自动生成 OP 任务。
- 供应商确认任务。
- 日期型提醒 worker / cron job。
- OP 工作台：我的任务、今日待办、超时任务。
- `domain_events`。
- `notification_outbox`。

验收标准：

- 销售成交后自动生成订单。
- OP 能收到任务。
- 客人抵达前能触发提醒。
- 任务超时老板可见。
- 订单能追溯到报价版本。
- 供应商确认结果可记录。

### 阶段 5：老板看板与员工 KPI

目标：老板可以实时看到所有员工的工作情况，用于经营管理和 KPI。

必须完成：

- 老板首页顶部 KPI。
- 实时事件流。
- 员工工作频次统计。
- 报价次数、成交量、订单提交量、OP 任务完成数、超时任务。
- 低毛利审批、缺成本提醒、供应商价格过期提醒。
- 按员工、日期、目的地、订单状态筛选。

验收标准：

- 老板能看到销售提交报价事件。
- 老板能看到成交订单。
- 老板能看到 OP 超时任务。
- 老板能看到员工提交文件数量和工作频次。
- 看板数据来自业务表和 `domain_events`，不是前端假数据。

### 阶段 6：财务、BI、SOP、Agent 强化

目标：形成更完整的旅行社经营系统。

必须完成：

- 应收应付。
- 收款记录。
- 付款记录。
- 毛利报表。
- 财务预警。
- SOP 知识库。
- Agent Gateway 完整审计。
- 高级 BI 可接 Metabase。
- 多租户和 RLS 强化。

验收标准：

- 订单成交后生成应收应付草稿。
- 收款后老板看板更新。
- 应收逾期提醒。
- 毛利可按订单、销售、目的地、月份查看。
- AI 不能跨租户检索。
- SOP 可被 Agent 检索引用。

---

## 9. “不知道下一步做什么”时的自动决策规则

每次 Claude / Codex 开始工作时，必须先判断当前状态。

### 9.1 优先级排序

如果没有明确任务，就按以下顺序选择下一步：

1. 当前阶段未通过验收的红线问题。
2. 会阻塞真实上线的问题：登录、权限、数据持久化、部署。
3. 会影响报价准确性的问题：产品库、成本、匹配、快照。
4. 会影响成交后履约的问题：订单、OP 任务、供应商确认。
5. 会影响老板管理的问题：看板、员工 KPI、事件流。
6. 测试、文档、SOP、部署脚本。
7. UI 美化和体验优化。

### 9.2 等客户验收时的默认任务池

如果用户说“客户还没验收，我不知道干什么”，不要停下，不要只安慰。直接从下面选任务：

- 生成 / 更新 `docs/QUOTE_ACCEPTANCE_REPORT.md`。
- 用真实案例补自动化测试。
- 修复 Bug Log 里 P0/P1 问题。
- 设计 `suppliers`、`supplier_contacts`、`supplier_service_details` 迁移。
- 做供应商列表 / 详情 / 启用停用。
- 做账号权限矩阵和路由保护。
- 做老板账号创建员工账号 API contract。
- 做订单表和 OP 任务表 migration 草案。
- 做 `domain_events` 表和事件写入辅助函数。
- 做产品库字段映射和 remark_atoms 规则。
- 写部署文档和环境变量模板。

### 9.3 每次工作结束必须留下下一步

每次完成一个任务，必须更新：

- `docs/PROJECT_STATUS.md`
- `docs/NEXT_ACTIONS.md`
- `docs/BUG_LOG.md`（如有 Bug）
- `docs/SOP/*.md`（如形成可复用流程）

`docs/NEXT_ACTIONS.md` 必须至少包含：

```md
# NEXT_ACTIONS

## 当前阶段

## 已完成

## 正在进行

## 下一步 1
- 目标：
- 文件：
- 命令：
- 验收标准：

## 下一步 2
...

## 阻塞项

## 等客户验收期间可继续推进的任务
```

---

## 10. 常用命令

如果当前项目已有 `package-lock.json`，优先使用 `npm`；如果已有 `pnpm-lock.yaml`，优先使用 `pnpm`。新建 monorepo 推荐使用 `pnpm`。

### 10.1 旧项目检查命令

```bash
node --check app.js
node --check server.js
node --test tests/*.test.js
```

### 10.2 新项目通用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

### 10.3 数据库命令

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:reset
pnpm db:generate-types
pnpm import:products
pnpm data-quality:check
```

如果使用 Supabase CLI：

```bash
supabase status
supabase db diff
supabase db push
supabase gen types typescript --project-id <project-id> --schema public > packages/db/types.ts
```

### 10.4 部署命令

Vercel：

```bash
vercel
vercel --prod
```

云服务器 Docker：

```bash
docker compose up -d --build
docker compose logs -f web
docker compose logs -f worker
docker compose restart web
docker compose ps
```

### 10.5 每次改代码后至少运行

根据改动范围选择，但不要完全不测试。

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

旧项目至少运行：

```bash
node --check app.js
node --check server.js
node --test tests/*.test.js
```

---

## 11. 关键红线规则

以下情况禁止上线给真实旅行社员工使用：

1. 报价成本为空却显示为 0。
2. 报价行没有来源产品、来源供应商、匹配原因、人工确认人、版本快照。
3. 产品库发布后会导致历史报价变化。
4. AI 可以直接发布正式报价、订单、财务付款。
5. 老板看板无法看到销售提交报价和成交订单。
6. 供应商价格过期没有提醒。
7. 客户方案暴露内部成本、内部备注、供应商敏感信息。
8. 多租户数据没有隔离。
9. 前端暴露 Supabase `service_role` key。
10. 禁用 RLS 或绕过 RLS 直接查询生产数据。
11. 硬删除已有历史订单关联的产品、供应商、报价、员工。
12. 没有 migration 就手改生产数据库。
13. 没有备份就执行破坏性迁移。
14. 只改 UI 不处理数据可信和审计。
15. 把全部 Excel 备注直接丢给 AI 判断成本或价格。
16. 销售能看到供应商银行账号、供应商底价、内部毛利规则。
17. 任务提醒只存在前端，没有后端 job 或事件记录。
18. 账号密码明文保存。
19. 老板创建账号、重置密码没有审计日志。
20. 生产环境使用测试密钥、测试数据库或本地缓存作为主数据。

---

## 12. Agent / AI 规则

### 12.1 AI 能做

- 解析客户需求。
- 生成行程草稿。
- 拆分产品需求项。
- 查询产品库候选。
- 解释为什么匹配某个资源。
- 发现缺成本、过期价格、低毛利、候选不唯一。
- 生成客户方案草稿。
- 生成老板日报 / 周报草稿。
- 查询员工、订单、财务状态。
- 总结 Bug、沉淀 SOP。

### 12.2 AI 不能直接做

- 不能直接确认最终成本价。
- 不能静默修改已发布产品价格。
- 不能直接提交正式财务付款。
- 不能绕过审批发布低毛利报价。
- 不能把内部备注输出给客户。
- 不能绕过权限读取供应商敏感信息。
- 不能跨租户检索。

### 12.3 Agent Gateway

Agent 必须通过 `Agent Gateway` 调用工具。

Agent Gateway 负责：

- 工具注册。
- 权限判断。
- 参数校验。
- 数据脱敏。
- 调用业务 API。
- 记录 `agent_runs`、`agent_steps`、`agent_tool_calls`。
- 对高风险写入触发人工确认。

工具分级：

- `read`：查询产品、报价、订单、SOP、指标。
- `draft`：生成需求项、报价候选、客户方案草稿、异常诊断。
- `propose`：提交待确认变更。
- `approved`：经人工确认后写入报价、订单、任务。

---

## 13. 云服务器与上线规则

### 13.1 MVP 上线方案

优先方案：

- Web / API：Next.js 部署到 Vercel 或专属云服务器。
- Database / Auth：Supabase 托管 Postgres + Auth + RLS。
- Worker：定时 job 处理 OP 提醒、价格过期、应收逾期。
- Domain：绑定正式域名。
- HTTPS：必须启用。
- Logs：保留应用日志和错误日志。
- Backup：数据库每日备份。

### 13.2 专属服务器方案

如果客户要求内部员工访问一个专属系统，可使用：

- Ubuntu LTS 云服务器。
- Docker Compose。
- Caddy 或 Nginx 反向代理。
- Next.js standalone server。
- Worker 容器。
- Supabase 托管数据库，或后续迁移到独立 PostgreSQL。

服务器目录建议：

```txt
/opt/youyixing/
  docker-compose.yml
  .env.production
  releases/
  backups/
  logs/
```

必须配置：

- 自动 HTTPS。
- 环境变量隔离。
- 数据库连接只在服务端使用。
- 防火墙只开放 80、443、SSH 必要端口。
- SSH 禁止弱密码。
- 数据库备份和恢复演练。

---

## 14. 每日开发 SOP

每天开始时：

1. 读取 `CLAUDE.md`。
2. 读取 `docs/PROJECT_STATUS.md`。
3. 读取 `docs/NEXT_ACTIONS.md`。
4. 读取 `docs/BUG_LOG.md`。
5. 检查当前阶段和阻塞项。
6. 如果没有明确任务，按第 9 章优先级自动选择。

执行任务时：

1. 先说明本次目标和验收标准。
2. 找到相关文件。
3. 尽量小步修改。
4. 写或补测试。
5. 运行检查命令。
6. 修复失败。
7. 更新文档。
8. 明确下一步。

每天结束时：

1. 更新 `docs/PROJECT_STATUS.md`。
2. 更新 `docs/NEXT_ACTIONS.md`。
3. 更新 `docs/SOP/`。
4. 写清楚：今天完成了什么、还差什么、明天第一件事做什么。

---

## 15. 对话沉淀 SOP

用户要求“把每一次对话的步骤沉淀出 SOP”。因此每次完成一个阶段性任务后，都要在 `docs/SOP/` 下新增或更新 SOP。

SOP 文件格式：

```md
# SOP｜任务名称

## 1. 适用场景

## 2. 输入材料

## 3. 操作步骤

## 4. 验收标准

## 5. 常见错误

## 6. 修复办法

## 7. 相关文件

## 8. 下次复用提示词
```

必须沉淀的 SOP：

- 报价系统验收 SOP。
- 产品库 Excel 导入 SOP。
- 产品字段映射 SOP。
- 供应商新增 / 停用 SOP。
- 报价成交转订单 SOP。
- OP 任务提醒 SOP。
- 老板创建员工账号 SOP。
- 权限测试 SOP。
- 部署上线 SOP。
- Bug 复盘 SOP。

---

## 16. 本项目当前最推荐的下一步

如果当前没有新的明确指令，下一步按这个顺序做：

1. 新增或更新 `docs/PROJECT_STATUS.md`，写明当前阶段是“智能报价系统待验收 / 供应商与订单模块准备”。
2. 新增或更新 `docs/NEXT_ACTIONS.md`，列出等待客户验收期间可推进任务。
3. 补 `docs/QUOTE_ACCEPTANCE_REPORT.md`，用真实案例验证报价主链路。
4. 新增 `db/migrations` 草案：账号、角色、供应商、订单、OP 任务、domain_events、audit_logs。
5. 实现基础登录和角色保护。
6. 实现老板后台创建员工账号。
7. 实现供应商管理第一版：新增、编辑、启用 / 停用、基础排名字段。
8. 实现成交转订单和 OP 任务模板。
9. 实现老板看板第一版事件流和 KPI。
10. 最后再优化小易 AI 助手。

---

## 17. 给 AI 编程助手的最后提醒

- 用户不会写代码，不要把关键技术决策推回给用户。
- 不要问“你想用什么技术栈”，本文件已经决定：Next.js + TypeScript + Supabase/Postgres + RLS + Agent Gateway。
- 不要因为客户未验收就停工。
- 不要为了做新功能破坏已经能跑的报价链路。
- 每次都要留下下一步，让项目可以连续推进。
- 做完任何功能都必须写验收标准和测试办法。
- 能跑测试就跑测试，不能跑要说明原因和替代验证方式。
- 任何涉及成本、报价、订单、财务、权限、供应商敏感信息的地方，优先保证可信、可审计、可回滚。
