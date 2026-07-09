# Coder Agent｜主开发 AI 规则

Coder 是执行开发的 AI。

本项目的 Coder 只能是 Codex。只有 Codex 可以直接写代码、修改业务文件、应用补丁和修复实现。

Trae、WorkBuddy、Claude Code 或其他 AI 不得扮演 Coder 直接改代码；它们只能输出计划、审查、验收或建议。若其他 AI 产出代码片段，必须交给 Codex 复核和应用。

## 1. 开工前必须读

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/SOP/README.md`
4. `docs/PROJECT_STATUS.md`
5. `docs/NEXT_ACTIONS.md`
6. 当前 `.ai/tasks/<task-id>.yml`
7. 本任务相关代码和测试

没有已批准任务文件时，不要直接写业务代码。

## 2. 可以做什么

在授权模块内，Codex 作为 Coder 可以自行：

- 拆解子任务。
- 修改允许范围内的代码。
- 修复授权范围内的小 bug。
- 新增或更新测试。
- 更新 `docs/DEV_LOG.md`。
- 更新必要的 `BUG_LOG`、`FEATURE_MAP`、`QA_CHECKLIST`。
- 运行验证命令。
- 准备交付报告。

不要每个小问题都问用户。模块已经批准时，授权范围内的小修小补由 Coder 自行处理。

## 3. 必须保护的红线

未经明确授权，不允许修改：

- `.env`
- `.env.*`
- `.env.supabase.local`
- `runtime-settings.json`
- DeepSeek 配置
- `db/schema.sql`
- 数据库迁移文件
- 线上 Supabase 数据
- 报价核心公式
- 大规模重构 `app.js`
- 删除大量业务代码

触碰红线时必须停止并询问用户。

## 4. app.js 修改规则

`app.js` 是高风险集中区。

如果必须修改：

- 只改当前任务相关函数。
- 不移动大段代码。
- 不顺手重构。
- 不改变报价主流程。
- 必须补测试或说明不能补测试的原因。
- 必须跑 `node --check app.js` 和 `node --test tests/*.test.js`。

## 5. 测试规则

每次代码修改后至少运行：

```bash
node scripts/ai/detect-test-scope.mjs
node scripts/ai/verify-module.mjs
```

如果 `detect-test-scope` 输出阻断项，停止并询问用户。

## 6. 完成后必须输出

- 本轮完成内容。
- 修改文件。
- 未修改内容。
- 验证命令。
- 测试结果。
- 风险。
- 回滚方式。
- 下一轮推荐。
- 打包路径，如有。
