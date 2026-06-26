# 友易行产品资源库当前调用盘点

生成时间：2026-06-25

## 1. 当前源码实际加载的数据

位置：`tools/inbound-quote-workbench/data/`

| 类型 | 文件 | 数量 | 当前用途 |
|---|---:|---:|---|
| 景点门票 | `data/products/attractions.json` | 126 | 运行时追加到 `state.productCatalog.tickets` |
| 包车价格 | `data/products/vehicles.json` | 99 | 运行时追加到 `state.productCatalog.vehicles` |
| 导游价格 | `data/products/guides.json` | 8 | 运行时追加到 `state.productCatalog.guides` |
| 酒店资源 | `data/products/hotels.json` | 165 | 运行时追加到 `state.productCatalog.hotels` |
| 大交通 | `data/products/transports.json` | 2 | 仅作为规则/手动录入说明 |
| 历史线路 | `data/cases/historical-routes.json` | 1 | 追加到历史线路推荐 |
| 历史报价 | `data/cases/historical-quotes.json` | 1 | 当前未完整参与报价计算 |
| 报价规则 | `data/rules/pricing-rules.json` | 1 份 | 加载到 `state.pricingRules` |
| 价格策略 | `data/rules/profit-strategies.json` | 2 | 加载到 `state.profitStrategies` |

注意：源码 `app.js` 里还内置了更大一批飞书导入数据，数量约为：

| 类型 | 内置数量 |
|---|---:|
| 线路产品 | 24 |
| 用车 | 920 |
| 特色体验 | 69 |
| 景点门票 | 113 |
| 导游 | 48 |
| 酒店 | 153 |
| 餐 | 151 |

所以页面运行后不是只读 `data/products/*.json`，而是：

```text
app.js 内置飞书导入产品
+
data/products/*.json 运行时追加
```

这会带来重复、冲突和优先级不清的问题。

## 2. 本地资料库中有但当前源码未完整接入的数据

位置：`Local-KB/Travel-Quote-System/`

### 2.1 清洗后数据

| 类型 | 文件 | 数量 | 当前是否进入源码 |
|---|---:|---:|---|
| 景点门票 | `01-清洗后数据/景点门票.json` | 126 | 已复制到源码 data |
| 包车价格 | `01-清洗后数据/包车价格.json` | 99 | 已复制到源码 data |
| 导游价格 | `01-清洗后数据/导游价格.json` | 8 | 已复制到源码 data |
| 酒店资源 | `01-清洗后数据/酒店资源.json` | 165 | 已复制到源码 data |
| 供应商资料 | `01-清洗后数据/供应商资料.json` | 156 | 未接入源码 data |
| 历史线路案例 | `01-清洗后数据/历史线路案例.json` | 1 | 已复制到源码 data |
| 历史报价案例 | `01-清洗后数据/历史报价案例.json` | 1 | 已复制到源码 data |
| 报价规则 | `01-清洗后数据/报价规则.json` | 1 份 | 已复制到源码 data |
| 价格策略 | `01-清洗后数据/价格策略.json` | 2 | 已复制到源码 data |

### 2.2 供应商管理原始表

位置：`07-工作台调用资料/03-供应商管理/`

| 文件 | 行数 | 说明 |
|---|---:|---|
| `仅包车报价.csv` | 255 | 原始飞书表，多行表头，需要重新清洗 |
| `导游报价.csv` | 210 | 原始飞书表，多层表头，需要重新清洗 |

### 2.3 产品及产品说明原始表

位置：`07-工作台调用资料/02-产品及产品说明/`

| 文件 | 行数 | 说明 |
|---|---:|---|
| `线路报价.csv` | 215 | 线路产品原始表 |
| `门票报价.csv` | 344 | 门票原始表 |
| `酒店.csv` | 201 | 酒店原始表 |
| `餐.csv` | 199 | 餐厅原始表 |
| `特色体验价.csv` | 未在本轮展开 | 特色体验原始表 |

### 2.4 销售填写的报价表单

位置：`07-工作台调用资料/06-销售需求与报价表单/`

| 文件 | 行数 | 当前用途 |
|---|---:|---|
| `hichina报价模板.csv` | 289 | 当前未直接进入系统报价逻辑 |
| `云贵川初版.csv` | 未统计 | 当前未直接进入系统报价逻辑 |
| `云贵川二改.csv` | 未统计 | 当前未直接进入系统报价逻辑 |
| `云贵川三改成交版.csv` | 347 | 仅被清洗成 1 条历史线路/历史报价案例 |
| `0425全程火车版.csv` | 未统计 | 当前未直接进入系统报价逻辑 |
| `0425全程火车版副本.csv` | 未统计 | 当前未直接进入系统报价逻辑 |
| `酒店明细.csv` | 203 | 部分酒店数据进入清洗后酒店资源 |
| `行程简表.csv` | 217 | 当前未直接进入系统报价逻辑 |
| `酒店确认单.csv` | 未统计 | 当前未直接进入系统报价逻辑 |

## 3. 当前报价调用链路

当前代码链路：

```text
loadRuntimeData()
→ mergeRuntimeProducts()
→ state.productCatalog
→ refreshQuoteResources()
→ quoteResources()
→ lookupVehicleResource / lookupGuideResource / lookupHotelResource / lookupTicketResource / lookupMealResource
→ buildQuote()
→ calcTotals()
```

## 4. 已发现的核心问题

### 4.1 供应商资料没有真正接入报价计算

`供应商资料.json` 有 156 条，但源码 `data/` 里没有 `suppliers.json`。

当前供应商管理页面使用的是 `app.js` 内置的 9 条示例供应商，不是清洗后的真实供应商库。

报价资源里的 `supplierId` 大量为空，系统显示：

```text
飞书导入待绑定供应商
```

### 4.2 产品和供应商没有统一主键

产品资源里很多字段有 `supplier_id: null`。

供应商资料里有真实联系人、电话、权限可见性，但产品项没有稳定关联到供应商。

结果：

```text
产品可报价
但不知道来自哪个真实供应商
供应商管理页面也无法反查对应成本
```

### 4.3 源码内置数据和 data JSON 数据重复追加

`app.js` 内置了飞书导入数据，`data/products/*.json` 又会在运行时追加。

例如：

```text
内置门票 113 条 + 清洗门票 126 条
内置用车 920 条 + 清洗用车 99 条
内置酒店 153 条 + 清洗酒店 165 条
```

匹配时会出现同名资源多候选，但当前优先级不清晰。

### 4.4 用车清洗字段和匹配逻辑不完全对得上

`lookupVehicleResource()` 要求：

```text
type = vehicle
sameCity
vehicleType = 包车 / 接送机
model = 5座 / 7座 / 14座等
```

但清洗后的 `vehicles.json` 示例是：

```json
{
  "vehicle_type": "5座车",
  "full_day_price": 330,
  "airport_transfer_price": 330
}
```

运行时转换时把 `vehicle_type` 同时当成 `vehicleType` 和 `model`，可能导致：

```text
OP 选择「包车 + 5座车」
但清洗资源变成「5座车 + 5座车」
匹配不上
```

### 4.5 酒店成本可能取错字段

`hotels.json` 示例：

```json
{
  "nightly_price": 630,
  "internal_notes": "协议价；成本:550"
}
```

当前转换逻辑：

```js
costPrice: item.nightly_price
```

也就是说系统可能把卖价/报价 `630` 当成成本，而不是解析备注里的成本 `550`。

这会直接影响毛利。

### 4.6 销售填的报价表单没有形成可复用报价项数据

销售表单现在主要只是归档在本地资料库里。

当前只提取了 1 条：

```text
云贵川三改成交版 → 历史线路案例 + 历史报价案例
```

但没有把销售表单里的每日报价项拆成：

```text
day_items
ticket_items
vehicle_items
guide_items
hotel_items
meal_items
traffic_items
manual_adjustments
```

所以 Agent 目前无法真正学习销售表单里的报价结构。

## 5. 建议下一步

### 第一步：补齐当前真实数据目录

新增：

```text
tools/inbound-quote-workbench/data/products/meals.json
tools/inbound-quote-workbench/data/products/experiences.json
tools/inbound-quote-workbench/data/suppliers/suppliers.json
tools/inbound-quote-workbench/data/cases/sales-quote-forms.json
```

### 第二步：统一产品资源标准结构

建议统一成：

```json
{
  "id": "resource_xxx",
  "type": "vehicle | guide | hotel | attraction | meal | experience | transport",
  "city": "北京",
  "name": "资源名称",
  "supplier_id": "supplier_xxx",
  "cost_price": 0,
  "sale_reference_price": 0,
  "pricing_unit": "per_day | per_person | per_room_night | per_trip",
  "season": "normal | peak | off",
  "valid_from": "2026-xx-xx",
  "valid_to": "2027-xx-xx",
  "source_file": "飞书表名 / sheet",
  "source_row": 0,
  "status": "active | pending | missing_cost"
}
```

### 第三步：统一供应商标准结构

供应商不要只放在页面示例里，要作为正式数据：

```json
{
  "id": "supplier_xxx",
  "supplier_name": "供应商名称",
  "supplier_type": "酒店 | 车队 | 导游 | 门票 | 餐厅",
  "city": "北京",
  "contact_name": "",
  "phone": "",
  "visibility": {
    "sales_can_view": false,
    "op_can_view": true,
    "boss_can_view": true
  },
  "status": "active | pending | blacklist"
}
```

### 第四步：重新清洗销售报价表单

销售表单要拆成结构化案例，不只是整表归档。

建议输出：

```text
sales-quote-forms.json
historical-route-days.json
historical-quote-items.json
historical-quote-versions.json
```

### 第五步：改报价匹配优先级

建议优先级：

1. 当前项目人工指定资源
2. 精确供应商资源
3. 清洗后标准产品资源
4. 历史报价案例同类资源
5. 旧内置兜底价
6. 待补成本

