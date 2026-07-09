# Supabase 产品库数据底座验收报告（2026-07-03）

## 本轮目标

把产品库从浏览器本地 JSON / localStorage 迁到 Supabase Postgres，先完成云端数据底座、导入批次、质量报告和后端查询 API。

## 云端项目

- Supabase 项目：`fyaohgjtnngkdiavttad`
- 本地服务端口：`http://127.0.0.1:8787/`
- 导入批次：`4d50f5cc-d8ff-47ff-89bd-1028056814b3`
- 发布版本：`product-catalog-system-20260703`

## 已建表

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

所有表已启用 RLS。浏览器不能直接使用 publishable key 读取资源，必须走服务端 API 或 service key。

## 已发布产品数量

| 品类 | 数量 | 缺成本 |
|---|---:|---:|
| 线路产品 | 24 | 0 |
| 用车 | 940 | 0 |
| 导游 | 48 | 0 |
| 特色体验 | 77 | 2 |
| 景点门票 | 145 | 13 |
| 酒店 | 153 | 5 |
| 餐厅 | 151 | 151 |

餐厅缺成本来自源 Excel：`餐` Sheet 的“人均最低成本”列为空，系统不拿建议卖价冒充成本。

## 后端 API

- `GET /api/product-imports/latest/report`
- `GET /api/product-resources`
- `POST /api/product-resources/match`

## 验证结果

- 首页：`curl -I --max-time 3 http://127.0.0.1:8787/` 返回 `HTTP/1.1 200 OK`。
- 云端导入报告：`status=published`，`quality_report.pass=true`。
- 云端资源查询：重庆 / 用车 / 接送机 / 7座 返回成本 250、卖价 450。
- 云端匹配接口：重庆接机 / 7座 返回 `matchStatus=matched`，成本 250。

## 当前边界

- 前端报价主流程还没有完全切换到云端匹配 API。
- 本轮先完成数据底座和服务端出口，下一轮再把产品库页面和报价匹配逐步切到云端。
- `.env.supabase.local` 只保存在本机，已被 `.gitignore` 排除，不进入提交和压缩包。
