# QUOTE_ENGINE_CONTRACT

日期：2026-07-03

本文定义新增 quote domain 的数据契约。当前契约先服务测试和 adapter，不直接替换旧报价主流程。

## 输入：QuoteRequirementItem

```js
{
  id: "REQ-1",
  serviceType: "接送机",
  category: "用车",
  city: "重庆",
  date: "2026-07-10",
  quantity: 1,
  model: "7座",
  route: "重庆机场",
  language: "英语",
  roomType: "",
  star: "",
  rawText: "4人重庆接机"
}
```

要求：

- `serviceType` 是业务识别结果，可为空，但候选层会尝试从 `category`、`name`、`route`、`rawFields` 推断。
- `quantity` 缺失时默认 1。
- AI 只能生成或建议 requirement，不能生成最终成本价。

## 输入：ProductResource

候选函数接受现有产品库资源对象，不要求一次性迁移字段，但至少识别以下字段：

```js
{
  id: "P-1",
  category: "用车",
  city: "重庆",
  name: "重庆接送机 7座",
  serviceType: "接送机",
  model: "7座",
  route: "重庆机场",
  costPrice: 250,
  salePrice: 450,
  supplierName: "待绑定供应商",
  validTo: "2026-12-31",
  rawFields: {}
}
```

要求：

- 空成本必须保留为空字符串、`null` 或 `undefined`，不能显示成正常 0。
- 明确免费资源才能使用 0，并需另行标记 `isFree=true`。
- 原始字段必须保留在 `rawFields`，不能被映射成错误主字段。

## 输出：QuoteLineCandidate

```js
{
  id: "CAND-REQ-1-P-1",
  requirementId: "REQ-1",
  productId: "P-1",
  product,
  score: 92,
  unitCost: 250,
  salePrice: 450,
  costSource: "product_catalog",
  matchStatus: "matched",
  matchReason: "city=重庆;serviceType=接送机;model=7座;route=重庆机场",
  diagnostics: {
    cityMatched: true,
    serviceTypeMatched: true,
    modelMatched: true,
    routeMatched: true
  },
  warnings: []
}
```

候选状态：

- `matched`：可直接报价。
- `need_confirm`：有候选但路线、房型、票种等不够确定。
- `unmatched`：无候选。

## 输出：QuoteLine

```js
{
  id: "QL-REQ-1",
  requirementId: "REQ-1",
  serviceType: "接送机",
  city: "重庆",
  productName: "重庆接送机 7座",
  unitCost: 250,
  quantity: 1,
  totalCost: 250,
  salePrice: 450,
  totalSale: 450,
  supplierName: "待绑定供应商",
  sourceType: "product_catalog",
  sourceProductId: "P-1",
  sourceResourceId: "",
  serviceDetailId: "",
  costSource: "product_catalog",
  matchStatus: "matched",
  matchReason: "city=重庆;serviceType=接送机;model=7座"
}
```

## 输出：QuoteVersion

```js
{
  id: "QV-...",
  quoteId: "QUOTE-1",
  status: "draft",
  lines: [],
  totals: {
    totalCost: 0,
    totalSale: 0,
    grossMargin: 0,
    grossMarginRate: 0,
    missingCostCount: 0
  },
  warnings: []
}
```

## 标准警告码

- `NO_PRODUCT_CANDIDATE`：没有找到产品候选。
- `MISSING_COST`：候选存在但成本为空。
- `PRICE_EXPIRED`：候选价格已过期。
- `NEED_CONFIRM`：候选可用但仍需人工确认。
- `INVALID_REQUIREMENT`：需求项缺必要字段。

## 成本原则

1. 成本只能来自产品库、供应商服务明细或人工确认覆盖。
2. AI 不能直接决定成本价。
3. 缺成本可按 0 临时参与汇总，但必须保留 `missingCost=true` 和警告。
4. 供应商为空不阻断报价，显示“待绑定供应商”。
