# REFACTOR_PLAN_P0_P1

日期：2026-07-03

本计划来自本轮调研文档和现有代码扫描。原则：不推倒重做，不改变现有页面入口，不替换当前报价主流程，只先建立安全边界、测试边界和可逐步接入的域模块。

## P0 目标

1. 保住当前可用报价主流程。
2. 建立独立报价候选、报价行、报价版本纯函数。
3. 建立产品备注结构化清洗函数。
4. 建立 Agent 工具权限和日志骨架，防止 AI 越权改业务数据。
5. 增加测试，防止后续继续靠浏览器手工撞问题。

## P1 目标

1. 梳理数据库目标模型，不立刻迁移全量业务。
2. 梳理老板看板事件模型，不立刻做实时大屏。
3. 逐步把 `app.js` 中可抽离的纯逻辑迁到 `public/js/domain/**`。
4. 报价主流程接入新域函数时，每一步必须保留 fallback。

## 本轮已执行范围

- 新增 quote domain：
  - `quote-types.js`
  - `quote-requirement-normalizer.js`
  - `quote-candidate-builder.js`
  - `quote-line-builder.js`
  - `quote-version-builder.js`
  - `quote-warnings.js`
  - `index.js`
- 新增 product domain：
  - `remark-atoms.js`
  - `product-normalizer.js`
- 新增 agent gateway：
  - `agent-tool-registry.js`
  - `agent-permissions.js`
  - `agent-gateway.js`
  - `agent-logger.js`
- 新增 domain events：
  - `domain-events.js`
- 新增 adapter：
  - `quote-engine-adapter.js`
- 新增测试：
  - `remark-atoms.test.js`
  - `quote-candidate-builder.test.js`
  - `quote-line-version-builder.test.js`
  - `agent-gateway.test.js`
  - `domain-events.test.js`

## 明确不做

- 不重写 `app.js`。
- 不改报价主流程入口。
- 不删除 localStorage 兼容层。
- 不删除 Supabase API fallback。
- 不新增订单系统、权限系统、老板完整看板或 SaaS 多租户。
- 不新增模型调用或复杂 Agent 编排。
- 不让 AI 直接决定成本价。

## 下一轮建议

1. 给 `buildQuote` 外围增加只读诊断日志，记录需求项、候选数量、最终来源、缺成本原因。
2. 选择一个低风险服务项，例如门票或导游，把候选生成改为先调用 `buildQuoteCandidates`，保留旧逻辑 fallback。
3. 供应商服务明细入云端后，扩展候选 builder 的成本来源优先级。
4. 客户方案图片/PDF 下载单独开 bug 修复，不和报价引擎混改。

## 回退方案

```bash
git revert <本次提交哈希>
```

如只需临时停用新增域模块，可从 `index.html` 删除 `public/js/**` 的新增脚本引入；旧 `app.js` 仍保留既有主流程。
