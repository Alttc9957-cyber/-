# DATABASE_PHASE_1_DRAFT

日期：2026-07-05

本文只记录阶段 1 数据库草案，不是迁移文件。本轮不执行数据库迁移。

## 当前实际状态

当前 `db/schema.sql` 已包含：

- `product_import_batches`
- `product_import_rows`
- `product_resources`
- `product_price_tiers`
- `product_quality_checks`
- `suppliers`
- `supplier_service_details`
- `product_supplier_links`
- `quote_projects`
- `quote_lines`

当前已启用 RLS，但本文件未看到完整 policy。正式权限上线前，不能认为数据库权限已经完成。

## 阶段 1 目标

阶段 1 只解决内部工作台最小数据安全和业务留痕：

- 谁登录。
- 谁能看什么。
- 谁创建了报价。
- 哪个报价成交为订单。
- OP 需要处理什么任务。
- AI 做过什么建议。
- 关键业务事件如何记录。

不做多租户 SaaS、复杂审批流、完整财务系统。

## 建议新增表

### app_users

用途：工作台用户基础表，可映射 Supabase Auth 用户。

字段草案：

- `id uuid primary key`
- `auth_user_id uuid`
- `name text`
- `phone text`
- `email text`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### user_roles

用途：记录用户角色。

字段草案：

- `id uuid primary key`
- `user_id uuid`
- `role text`
- `status text`
- `created_at timestamptz`

角色建议：

- `owner`：老板。
- `sales`：销售 / 定制师。
- `op`：操作。

### quote_versions

用途：保存报价版本快照。

字段草案：

- `id uuid primary key`
- `quote_project_id uuid`
- `version_no integer`
- `status text`
- `totals jsonb`
- `warnings jsonb`
- `quote_snapshot jsonb`
- `created_by uuid`
- `created_at timestamptz`

### quote_requirements

用途：保存从客户需求和行程中拆出来的报价需求项。

字段草案：

- `id uuid primary key`
- `quote_project_id uuid`
- `service_type text`
- `category text`
- `city text`
- `service_date date`
- `quantity numeric`
- `model text`
- `route text`
- `language text`
- `raw_text text`
- `source text`
- `created_at timestamptz`

### orders

用途：报价成交后的最小订单记录。

字段草案：

- `id uuid primary key`
- `order_no text unique`
- `quote_project_id uuid`
- `quote_version_id uuid`
- `customer_name text`
- `country text`
- `start_date date`
- `end_date date`
- `people_count integer`
- `cities jsonb`
- `deal_amount numeric`
- `currency text`
- `status text`
- `created_by uuid`
- `created_at timestamptz`
- `updated_at timestamptz`

### operation_tasks

用途：OP 后续任务提醒。

字段草案：

- `id uuid primary key`
- `order_id uuid`
- `task_type text`
- `title text`
- `city text`
- `due_at timestamptz`
- `owner_user_id uuid`
- `status text`
- `payload jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

### ai_agent_logs

用途：记录 AI 调用和建议，便于追责。

字段草案：

- `id uuid primary key`
- `user_id uuid`
- `quote_project_id uuid`
- `tool_name text`
- `permission_level text`
- `input_summary text`
- `output_summary text`
- `raw_request jsonb`
- `raw_response jsonb`
- `status text`
- `error text`
- `created_at timestamptz`

### domain_events

用途：老板看板和审计数据来源。

字段草案：

- `id uuid primary key`
- `type text`
- `entity_type text`
- `entity_id uuid`
- `actor_user_id uuid`
- `actor_role text`
- `payload jsonb`
- `created_at timestamptz`

### audit_logs

用途：记录关键人工操作。

字段草案：

- `id uuid primary key`
- `actor_user_id uuid`
- `action text`
- `entity_type text`
- `entity_id uuid`
- `before_snapshot jsonb`
- `after_snapshot jsonb`
- `created_at timestamptz`

## 建议补充到现有表的字段

### quote_projects

- `customer_name text`
- `created_by uuid`
- `assigned_sales_id uuid`
- `status_updated_at timestamptz`
- `quote_snapshot jsonb`

### quote_lines

- `quote_version_id uuid`
- `requirement_id uuid`
- `sale_price numeric`
- `total_sale numeric`
- `line_snapshot jsonb`
- `missing_cost boolean`
- `need_confirm boolean`

### supplier_service_details

- `valid_from date`
- `valid_to date`
- `source_type text`
- `contact_visibility text`
- `quality_score numeric`

## 最小权限规则草案

### owner

- 可查看全部报价、订单、供应商和统计。
- 可创建员工账号。
- 可查看供应商联系方式。
- 可查看成本和利润。

### sales

- 可创建和编辑自己的报价项目。
- 可查看产品报价所需成本。
- 不可查看供应商电话、微信、付款信息。
- 不可执行财务确认。

### op

- 可查看已成交订单和操作任务。
- 可查看执行所需供应商信息。
- 不可查看老板级利润统计。

## RLS policy 草案

正式迁移前必须补齐：

- 登录用户只能读取自己可访问的数据。
- 销售不能直接读取供应商敏感联系方式。
- OP 只能读取已成交订单和分配任务。
- owner 可以读取全部业务数据。
- service role 只能在服务端使用，不进入浏览器。

## 迁移顺序建议

1. 先加 `app_users` 和 `user_roles`。
2. 再加 `quote_versions` 和 `quote_requirements`。
3. 再加 `orders`。
4. 再加 `operation_tasks`。
5. 再加 `ai_agent_logs`、`domain_events`、`audit_logs`。
6. 最后补 RLS policy 和权限测试。

## 本轮不执行

- 不生成 migration。
- 不连接 Supabase 执行 SQL。
- 不改现有表。
- 不改 `server.js` API。
- 不改前端权限显示。
