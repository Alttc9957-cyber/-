# API Risk Matrix · 2026-07-07

本文件对应阶段 A1。目标是先把当前 `server.js` API 按上线风险分层，再把高风险写接口接入服务端角色守卫。

## 技术口径

- 权限策略参考 Casbin / RBAC 的角色-动作思想，但本轮不引入完整依赖，先用本地角色策略表落地。
- 数据事实来源参考 Supabase / Postgres，但本轮不执行数据库迁移，先用服务端 JSON 作为可替换持久层。
- 产品库审核参考 Directus / NocoDB 的“草稿-审核-发布”数据治理模式，OP 补录先进入审核区，老板审核后才发布。

## 角色

| 角色 | 说明 |
|---|---|
| `sales` | 销售 / 定制师，可保存报价草稿和生成客户方案 |
| `op` | OP，可提交产品补录审核，可处理报价和订单 |
| `boss` | 老板，可审核产品补录，可查看经营相关信息 |
| `admin` | 管理员，可修改系统级配置 |

## 风险分层

| 接口 | 方法 | 风险层 | 当前策略 |
|---|---:|---|---|
| `/api/settings` | GET | 受控读 | 允许读取脱敏配置 |
| `/api/settings/ai` | POST | 系统配置写 | 仅 `admin` |
| `/api/settings/ai/test` | POST | 系统配置写 | 仅 `admin` |
| `/api/agent` | POST | 受控写 | `sales` / `op` / `boss` / `admin` |
| `/api/agent/chat` | POST | 受控写 | `sales` / `op` / `boss` / `admin` |
| `/api/agent/action` | POST | 敏感写 | `op` / `boss` / `admin` |
| `/api/agent/apply` | POST | 敏感写 | `op` / `boss` / `admin` |
| `/api/translate` | POST | 受控写 | `sales` / `op` / `boss` / `admin` |
| `/api/translate/segment` | POST | 受控写 | `sales` / `op` / `boss` / `admin` |
| `/api/product-imports/latest/report` | GET | 受控读 | `sales` / `op` / `boss` / `admin` |
| `/api/product-resources` | GET | 受控读 | `sales` / `op` / `boss` / `admin`，只返回已发布产品资源 |
| `/api/product-resources/match` | POST | 受控读/计算 | `sales` / `op` / `boss` / `admin`，只匹配已发布资源 |
| `/api/product-resources/upsert-from-quote` | POST | 敏感写 | `op` / `boss` / `admin`，改为提交审核区 |
| `/api/product-resource-reviews` | GET | 敏感读 | `op` / `boss` / `admin` |
| `/api/product-resource-reviews/approve` | POST | 敏感写 | `boss` / `admin`，审核通过后才发布 |
| `/api/quote-versions` | GET/POST | 业务写 | 有效角色，服务端 local-json 兜底 |
| `/api/orders` | GET/POST | 业务写 | 读：`op` / `boss` / `admin`；写：有效角色 |
| `/api/audit-events` | POST | 审计写 | 有效角色 |

## 本轮已经收口的风险

1. 敏感写接口和产品库受控读接口不再无角色裸奔。
2. AI 设置写入改为仅管理员可操作。
3. OP 补录成本不再直接写入正式产品库。
4. 待审核资源 `is_published=false`，不参与正式产品匹配。
5. 报价版本、订单和关键审计事件新增服务端持久化 API。
6. 缺成本阻断客户方案确认、导出和成交转订单。

## 后续接 Supabase / Auth 时的迁移点

1. `x-youyixing-role` 替换为 Supabase Auth JWT。
2. 服务端角色策略表替换为 Casbin policy 或数据库权限表。
3. `product-resource-review-items.json` 迁移到 `product_resource_review_items`。
4. `quote-state.json` 迁移到 `quote_versions`。
5. `order-state.json` 迁移到 `orders` / `order_tasks`。
6. `business-audit-events.json` 迁移到 `audit_logs` / `domain_events`。
