# BOSS_DASHBOARD_EVENT_MODEL

日期：2026-07-03

本文定义后续老板看板的事件模型。当前只新增事件创建纯函数，不实现实时看板。

## 原则

- 老板看板不要直接扫页面状态。
- 关键业务动作生成 domain event。
- 看板按事件聚合，不反向干预报价主流程。
- 事件必须包含 `tenantId`、`actorId`、`actorRole`、`createdAt`。

## 事件结构

```js
{
  id: "EVT-...",
  type: "quote.version_created",
  payload: {},
  context: {
    tenantId: "T-1",
    actorId: "U-1",
    actorRole: "sales"
  },
  createdAt: "2026-07-03T00:00:00.000Z",
  schemaVersion: 1
}
```

## 建议事件类型

### 产品库

- `product.import_started`
- `product.import_completed`
- `product.import_failed`
- `product.resource_published`
- `product.resource_updated`

看板指标：

- 产品库最近发布时间。
- 各品类资源数量。
- 待补成本数量。
- 待绑定供应商数量。
- 导入异常行数量。

### 报价

- `quote.project_created`
- `quote.requirement_recognized`
- `quote.candidate_built`
- `quote.line_created`
- `quote.line_missing_cost`
- `quote.version_created`
- `quote.submitted`
- `quote.proposal_confirmed`

看板指标：

- 今日新增报价数。
- 报价完成率。
- 缺成本报价行数量。
- 待确认候选数量。
- 平均毛利率。
- 报价从创建到提交耗时。

### 供应商

- `supplier.created`
- `supplier.service_detail_created`
- `supplier.cost_used_in_quote`
- `supplier.cost_expired`

看板指标：

- 各品类供应商数量。
- 被报价使用次数。
- 价格过期数量。
- 未绑定供应商资源数量。

### Agent

- `agent.tool_invoked`
- `agent.tool_rejected`
- `agent.approval_required`
- `agent.draft_created`
- `agent.result_applied`

看板指标：

- AI 使用次数。
- AI 被拒绝次数。
- 需要人工确认次数。
- AI 草稿采纳率。

## 当前实现边界

- `public/js/domain/events/domain-events.js` 只负责创建事件对象。
- 当前不写数据库。
- 当前不做实时订阅。
- 当前不新增老板看板页面。

## 后续接 Supabase 建议

1. 新增 `domain_events` 表。
2. 重要业务动作写事件。
3. Supabase Realtime 订阅事件表。
4. 看板只消费聚合结果，不调用报价生成函数。
