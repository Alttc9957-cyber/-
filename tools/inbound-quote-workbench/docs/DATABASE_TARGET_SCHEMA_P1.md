# DATABASE_TARGET_SCHEMA_P1

日期：2026-07-03

本文是 P1 目标数据库模型，不代表当前系统已完成迁移。当前产品库已先走 Supabase 底座；项目、报价、供应商服务明细仍有本地状态。

## 设计原则

- 产品库是成本真源之一，必须可发布、可回溯、可审查。
- 供应商服务明细是另一成本来源，后续需要入云端。
- 报价版本必须保存快照，不能只保存当前产品引用。
- AI 输出只能作为草稿、建议和识别记录，不能作为最终成本。
- 所有影响老板看板的数据应通过 domain events 生成。

## 目标表

### tenants

- `id`
- `name`
- `status`
- `created_at`

### users

- `id`
- `tenant_id`
- `name`
- `role`
- `status`
- `created_at`

### product_import_batches

- `id`
- `tenant_id`
- `source_file_name`
- `source_file_hash`
- `status`
- `quality_report`
- `created_by`
- `created_at`
- `published_at`

### product_import_rows

- `id`
- `tenant_id`
- `batch_id`
- `source_sheet`
- `source_row`
- `raw_fields`
- `parse_status`
- `parse_warnings`
- `created_at`

### product_resources

- `id`
- `tenant_id`
- `batch_id`
- `category`
- `city`
- `name`
- `service_type`
- `route`
- `model`
- `spec`
- `supplier_name`
- `cost_price`
- `sale_price`
- `low_season_cost`
- `high_season_cost`
- `adult_cost`
- `child_cost`
- `pricing_unit`
- `status`
- `raw_fields`
- `remark_atoms`
- `created_at`
- `updated_at`

### product_price_tiers

- `id`
- `tenant_id`
- `product_resource_id`
- `tier_name`
- `sale_price`
- `cost_price`
- `currency`
- `raw_fields`

### suppliers

- `id`
- `tenant_id`
- `name`
- `category`
- `status`
- `contacts`
- `raw_fields`
- `created_at`
- `updated_at`

### supplier_service_details

- `id`
- `tenant_id`
- `supplier_id`
- `category`
- `city`
- `service_type`
- `name`
- `model`
- `ticket_type`
- `room_type`
- `cost_price`
- `sale_price`
- `valid_from`
- `valid_to`
- `status`
- `raw_fields`

### product_supplier_links

- `id`
- `tenant_id`
- `product_resource_id`
- `supplier_service_detail_id`
- `is_preferred`
- `status`
- `created_at`

### quote_projects

- `id`
- `tenant_id`
- `customer_name`
- `status`
- `start_date`
- `adults`
- `children`
- `cities`
- `raw_demand`
- `created_by`
- `created_at`
- `updated_at`

### quote_requirements

- `id`
- `tenant_id`
- `quote_project_id`
- `service_type`
- `category`
- `city`
- `date`
- `quantity`
- `model`
- `route`
- `language`
- `raw_text`
- `source`

### quote_versions

- `id`
- `tenant_id`
- `quote_project_id`
- `version_no`
- `status`
- `totals`
- `warnings`
- `created_by`
- `created_at`

### quote_lines

- `id`
- `tenant_id`
- `quote_version_id`
- `requirement_id`
- `service_type`
- `city`
- `product_name`
- `unit_cost`
- `quantity`
- `total_cost`
- `sale_price`
- `total_sale`
- `supplier_name`
- `source_type`
- `source_product_id`
- `source_resource_id`
- `service_detail_id`
- `cost_source`
- `match_status`
- `match_reason`
- `line_snapshot`

### ai_agent_logs

- `id`
- `tenant_id`
- `user_id`
- `tool_name`
- `permission_level`
- `status`
- `input_summary`
- `output_summary`
- `error`
- `created_at`

### domain_events

- `id`
- `tenant_id`
- `actor_id`
- `actor_role`
- `type`
- `entity_type`
- `entity_id`
- `payload`
- `created_at`

## P1 迁移顺序建议

1. 供应商服务明细入云端。
2. 报价项目和报价版本入云端。
3. 报价行保存快照和来源 ID。
4. AI 操作日志入云端。
5. 老板看板从 `domain_events` 聚合。

## 当前暂不做

- 不做完整权限系统。
- 不做复杂审批流。
- 不做多租户 SaaS 交付。
- 不做财务结算和订单履约全模块。
