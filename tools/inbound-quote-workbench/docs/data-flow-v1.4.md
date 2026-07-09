# Data Flow V1.4

本文件记录供应商管理系统 V1.4 的数据流。当前项目是本地单页工作台，产品库、供应商库和报价版本主要存于浏览器 `localStorage`，因此本轮采用前端 service 出口，不假造无法读取本地状态的后端接口。

## 数据对象

### product_requirement_item

当前作为 V1.4 预留结构保存在 `state.productRequirementItems`，用于后续把客户需求拆成可匹配的产品需求项。

核心字段：

- `id`
- `projectId`
- `category`
- `city`
- `title`
- `matchFields`
- `quantity`
- `status`

### product_resource

当前由 `state.productCatalog` 自动派生为 `state.productResources`，也支持后续本地新增非派生资源。

核心字段：

- `id`
- `requirementItemId`
- `productCategory`
- `category`
- `title`
- `city`
- `areaOrScope`
- `serviceType`
- `spec`
- `matchFields`
- `manualCost`
- `referencePrice`
- `status`
- `preferredSupplierLinkId`
- `rawFields`

### resource_supplier_link

当前保存在 `state.resourceSupplierLinks`，用于记录产品资源和供应商服务明细的关系。

核心字段：

- `id`
- `productResourceId`
- `supplierId`
- `supplierName`
- `serviceDetailId`
- `serviceDetailType`
- `category`
- `preferred`
- `createdAt`

### quotable_resource

由 `quotable-resource-core.js` 从供应商服务明细生成，运行时保存在 `state.quotableResources`。

核心字段：

- `category`
- `supplierId`
- `supplierName`
- `supplierStatus`
- `serviceDetailType`
- `serviceDetailId`
- `title`
- `city`
- `areaOrScope`
- `matchFields`
- `costPrice`
- `referencePrice`
- `cancellationRule`
- `priceValidFrom`
- `priceValidUntil`
- `priceStatus`
- `contactSummary`
- `tags`
- `rating`
- `riskFlags`
- `updatedAt`

`priceStatus` 取值：

- `valid`
- `expiring_soon`
- `expired`
- `no_validity`

## 查询出口

当前查询出口为浏览器 service：

```js
window.YouyixingServices.queryQuotableResources(params)
```

支持参数：

- `category`
- `city`
- `productResourceId`
- `requirementItemId`
- `keyword`
- `supplierStatus`
- `priceStatus`
- `minPax`
- `language`
- `serviceCategory`
- `routeName`

原因：供应商与产品导入数据存于浏览器本地，`server.js` 无法直接读取客户当前页面的 `localStorage`。后续若迁移到真实后端，只需要把该 service 的实现替换成 API 调用。

## 报价接入

报价行新增“从资源库选择供应商资源”入口。

选择资源后写入当前报价行或子项：

- `sourceType`
- `sourceProductId`
- `sourceResourceId`
- `supplierId`
- `supplierName`
- `serviceDetailId`
- `serviceDetailName`
- `costSource`
- `quoteLineSnapshot`
- `matchStatus`
- `matchReason`
- `missingCost`

`quoteLineSnapshot` 保留：

- `category`
- `productResourceId`
- `supplierId`
- `supplierName`
- `supplierServiceDetailType`
- `supplierServiceDetailId`
- `costPriceSnapshot`
- `referencePriceSnapshot`
- `sellPrice`
- `cancellationRuleSnapshot`
- `priceValidUntilSnapshot`
- `priceStatusSnapshot`
- `selectedBy`
- `selectedAt`
- `orderServiceTaskId`
- `orderStatus`
- `settlementStatus`
- `paymentStatus`

## 成本规则

- 禁用供应商不会进入 `quotable_resource`。
- 价格已过期的资源不能直接选入报价。
- 无价格有效期的资源可以人工确认后进入报价，并保留 `need_confirm`。
- 成本为空保留为空，不显示为正常 0。
- 客户可见报价使用 `publicQuoteLineSnapshot` 脱敏，不展示 `costPriceSnapshot` 和 `costSource`。

## 当前边界

本轮没有实现完整订单任务、财务付款、库存、审批和排团。`quoteLineSnapshot` 中订单字段保持空值，供后续订单服务任务使用。
