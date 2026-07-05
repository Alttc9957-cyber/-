# AGENTS.md｜友易行 AI 协同开发总说明

本文件是给 Trae、WorkBuddy、Codex、Claude Code 和其他进入本仓库的 AI 工程助手看的总说明书。

进入仓库后，先读本文件，再读 `CLAUDE.md`、`docs/SOP/README.md`、`docs/PROJECT_STATUS.md`、`docs/NEXT_ACTIONS.md` 和当前 `.ai/tasks/<task-id>.yml`。

## 1. 项目定位

本项目是“友易行入境游旅行社内部工作台”，不是单一报价页面。

核心模块包括：

- 智能报价系统
- 产品库
- 订单管理
- 供应商管理
- 登录与权限
- 老板看板
- OP 任务提醒

当前交付重点是让旅行社内部员工能稳定完成：客户需求录入、行程识别、产品库成本调用、报价明细生成、缺成本提示、方案输出、成交转订单和后续 OP 执行。

## 2. 当前阶段

当前处于阶段 0 / 阶段 1 过渡期：

- 阶段 0：智能报价系统稳定化。
- 阶段 1：产品库成本可信化、订单/权限最小闭环准备。

当前优先级：

1. 稳定智能报价系统。
2. 修复产品库字段、成本、供应商成本回填。
3. 确保缺成本不会显示成正常 0。
4. 再推进订单管理最小闭环。
5. 再推进登录与权限。
6. 最后再做老板看板。

## 3. AI 角色分工

### Planner

Planner 负责拆任务和维护 `docs/NEXT_ACTIONS.md`。

- 把用户口语反馈整理成模块任务。
- 生成 `.ai/tasks/<task-id>.yml`。
- 每次只推荐一个最优先阶段。
- 不直接写业务代码。

### Coder

Coder 负责开发。

在本项目中，Coder 只能是 Codex。只有 Codex 可以直接修改代码和业务文件。

Trae、WorkBuddy、Claude Code 或其他 AI 不能直接写代码；它们只能做 Planner、Reviewer、QA 或 Release 角色，输出任务、审查意见、验收报告或交付建议。若其他 AI 给出补丁，必须由 Codex 复核后再决定是否手工应用。

- 在已批准模块范围内修改代码。
- 可以自行修授权范围内的小 bug。
- 必须补测试、跑测试、更新 `docs/DEV_LOG.md`。
- 完成后输出交付报告。

### Reviewer

Reviewer 负责代码质量审查。

- 默认只读。
- 重点看 git diff、红线、验收标准和测试覆盖。
- 输出“通过 / 不通过 / 需要修复项”。

### QA

QA 负责需求验收测试。

- 站在旅行社业务人员角度模拟真实操作。
- 不只看测试命令通过，还要看功能是否真的好用。
- 输出“可验收 / 不可验收 / 问题清单”。

### Release

Release 负责打包与交付报告。

- 测试和审查通过后打包。
- 输出交付报告、压缩包路径和下一轮建议。
- 不直接部署 production。

## 4. 文件红线

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

必须停止并询问用户的情况：

- 需要改密钥、环境变量或 production 配置。
- 需要执行数据库迁移。
- 需要删除云端数据。
- 需要改变报价成本来源规则。
- 需要改变权限红线。
- 需要执行 `git reset --hard` 或覆盖用户未提交改动。

## 5. 当前 app.js 风险

`app.js` 很大，产品库、报价、供应商、订单、客户方案等逻辑集中在里面。

多个 AI 不允许同时大改 `app.js`。

如果必须修改 `app.js`：

- 先确认当前任务文件允许修改。
- 只改本任务相关函数。
- 不做顺手重构。
- 不移动大段代码。
- 不重写报价主流程。
- 必须补测试或说明无法补测试的原因。
- 必须跑 `node --check app.js` 和 `node --test tests/*.test.js`。

## 6. 分支建议

建议分支策略：

- `main`：稳定版本，不直接开发。
- `staging`：阶段验收版本。
- `feature/<task-id>`：开发分支。
- `review/<task-id>`：审查修复分支，如需要。

如果当前仓库没有按此分支结构执行，不要擅自重置分支。先读取 `git status --short --branch`，再按用户当前指令执行。

## 7. 标准工作流

每个任务必须按照：

1. 任务文件
2. 执行
3. 测试
4. 审查
5. 修复
6. 报告
7. 推荐下一步

推荐命令：

```bash
node scripts/ai/detect-test-scope.mjs
node scripts/ai/verify-module.mjs
node scripts/ai/select-next-task.mjs
node scripts/ai/generate-pr-summary.mjs
```

## 8. 提交报告格式

每轮必须输出：

- 本轮完成内容
- 修改文件
- 未修改内容
- 验证命令
- 测试结果
- 风险
- 下一轮推荐
- 打包路径，如有

## 9. 不同 AI 接入方式

Trae、WorkBuddy 或其他 AI 进入仓库后：

1. 先读 `AGENTS.md`。
2. 再读 `CLAUDE.md`。
3. 再读 `.ai/agents/<role>.md`。
4. 再读当前任务文件。
5. 没有任务文件时，只能做 Planner 角色，先生成任务包，不直接写业务代码。
6. 如果不是 Codex，不允许直接修改代码、提交代码或执行写入型修复。

## 10. 最重要原则

- AI 不能决定最终成本价。
- 成本必须来自产品库或供应商服务明细。
- 缺成本不能显示成正常 0。
- 客户方案不能暴露内部成本和供应商敏感信息。
- 不要为了“看起来进度快”破坏报价主链路。
