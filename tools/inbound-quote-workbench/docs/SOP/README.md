# Youyixing Development SOP

日期：2026-07-05

本文是友易行后续每轮开发的固定流程。任何业务修改、bug 修复、文档整理和交付打包，都必须按本流程执行。

## 1. 开工前

### 必须读取

每轮开工前必须先读：

1. 根目录 `CLAUDE.md`
2. `docs/PROJECT_STATUS.md`
3. `docs/NEXT_ACTIONS.md`
4. `docs/BUG_LOG.md`
5. `docs/FEATURE_MAP.md`
6. `docs/QA_CHECKLIST.md`
7. 本任务相关的代码和测试文件

如果根目录没有 `CLAUDE.md`，停止执行，不写代码。

### 必须扫描代码状态

开工前必须执行或等价检查：

- `git status --short --branch`
- `git log -5 --oneline --decorate`
- 查看本轮涉及目录和文件
- 确认是否有未提交代码
- 确认是否有用户未保存改动
- 确认 `.env`、`.env.supabase.local` 等敏感文件不会提交

### 必须判断当前阶段

每轮必须先回答：

- 当前处于哪个阶段。
- 本轮要推进哪个任务包。
- 本轮不做什么。
- 是否会影响报价主流程。
- 是否需要迁移数据。
- 如何验证。
- 如何回滚。

## 2. 先出方案

没有用户明确批准前，不得直接改代码。

方案必须包含：

- 本轮目标。
- 涉及文件。
- 不允许修改的范围。
- 实施步骤。
- 验收标准。
- 回滚方式。
- 风险。
- 需要用户确认的问题。

用户明确回复“批准执行”“按这个方案执行”或“只执行第 X 部分”后，才可以修改文件。

## 2.1 模块自治执行模式

用户批准的是大模块，不是每个小问题。

模块示例：

- A2 产品库真实数据修复与成本可信化
- A3 一键同步产品库草稿闭环
- B1 订单管理最小闭环
- C1 登录与权限管理最小闭环

模块批准后，AI 可以在任务边界内自行：

- 拆解子任务。
- 修改代码。
- 修复小 bug。
- 补测试。
- 跑验证。
- 更新文档。
- 写 `docs/DEV_LOG.md`。
- 生成压缩包。
- 推荐下一阶段。

遇到以下红线必须停止并询问：

- 修改 `.env`、`.env.*`、`.env.supabase.local`、`runtime-settings.json` 或任何密钥。
- 执行数据库迁移、删除线上数据、改 production 配置或部署 production。
- 改变报价主流程、成本最终来源、权限敏感规则。
- 任务明显超出已批准模块。
- 需要覆盖用户未提交改动或执行破坏性 Git 命令。

## 2.2 AI 协同工作流 v1

本仓库内置 AI 协同中控层：

- `.ai/agents/`：Planner、Coder、Reviewer、QA、Release 的职责说明。
- `.ai/tasks/`：模块任务文件和任务模板。
- `.ai/reports/`：QA、Review、Release 报告输出位置。
- `.ai/state/`：项目状态模板。
- `goals/`：模块目标、验收和报告模板。
- `scripts/ai/`：测试范围、模块验证、下一任务推荐和交付摘要脚本。

标准推进流程：

1. Planner 根据用户反馈和项目文档生成 `.ai/tasks/<id>.yml`。
2. 用户批准模块。
3. Coder 在任务文件允许范围内执行。
4. QA 运行 `node scripts/ai/detect-test-scope.mjs` 并执行测试。
5. Reviewer 审查 diff、红线和验收标准。
6. Release 生成报告、端口、压缩包和下一步建议。

常用命令：

```bash
node scripts/ai/detect-test-scope.mjs
node scripts/ai/verify-module.mjs
node scripts/ai/select-next-task.mjs
node scripts/ai/generate-pr-summary.mjs
```

## 2.3 多 AI 协同流程

Trae、WorkBuddy、Codex、Claude Code 或其他 AI 进入仓库后，必须先确认自己的角色。

### 所有 AI 开工前必须读

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/SOP/README.md`
4. `docs/PROJECT_STATUS.md`
5. `docs/NEXT_ACTIONS.md`
6. 对应角色文件：`.ai/agents/<role>.md`
7. 当前任务文件：`.ai/tasks/<task-id>.yml`

没有任务文件时，默认只能进入 Planner 模式，先拆任务，不直接写业务代码。

### Coder 怎么执行

本项目中，Coder 只能是 Codex。只有 Codex 可以直接写代码、修改业务文件和应用补丁。

Trae、WorkBuddy、Claude Code 或其他 AI 不允许直接写代码；它们可以做 Planner、Reviewer、QA 或 Release，输出任务、审查、验收和交付建议。

Codex 作为 Coder 必须：

- 在任务文件允许范围内修改。
- 保护红线文件。
- 修改后运行 `node scripts/ai/detect-test-scope.mjs`。
- 按测试范围运行验证。
- 更新 `docs/DEV_LOG.md`。
- 输出完成内容、修改文件、未修改内容、验证结果、风险和下一步建议。

### Reviewer 怎么审查

Reviewer 默认只读，不直接改代码。

Reviewer 必须检查：

- `git diff` 是否只包含授权范围。
- 是否违反 `AGENTS.md`、`CLAUDE.md` 和任务红线。
- 是否改了 `.env`、DeepSeek 配置、数据库、production、线上数据。
- 是否破坏报价主流程。
- 是否让缺成本显示成正常 0。
- 是否缺测试、缺 DEV_LOG、缺回滚说明。

Reviewer 输出：通过 / 不通过 / 需要修复项。

### QA 怎么验收

QA 不能只看自动测试通过。

QA 必须站在业务人员角度验证：

- 产品库字段是否清楚。
- 成本是否可信。
- 报价明细是否能直接用。
- 缺成本提示是否明确。
- 客户方案是否隐藏内部成本和供应商敏感信息。
- 成交转订单是否符合业务路径。

QA 输出：可验收 / 不可验收 / 待确认 + 问题清单。

### 什么时候必须停下来问用户

- 需要改 `.env`、`.env.*`、`.env.supabase.local`、`runtime-settings.json`。
- 需要改 DeepSeek 配置。
- 需要执行数据库迁移。
- 需要改 `db/schema.sql` 或线上 Supabase 数据。
- 需要改报价核心公式。
- 需要大规模重构 `app.js`。
- 需要删除大量业务代码。
- 需要部署 production。
- 需要执行破坏性 Git 命令。

### 什么时候不需要问用户

模块已经批准后，以下动作不需要逐项询问：

- 拆解子任务。
- Codex 修授权范围内的小 bug。
- 增加必要测试。
- 调整文档。
- 更新 DEV_LOG。
- 跑验证命令。
- 生成交付压缩包。
- 推荐下一轮任务。

## 3. 执行中

### 范围控制

- 一个窗口只做一个明确任务。
- 不顺手修无关 bug。
- 不重构未授权模块。
- 不删除已有功能。
- 不提交敏感配置。
- 不执行未批准的数据库迁移。

### 代码修改原则

- 优先最小修改。
- 优先使用现有模式。
- 报价主流程改动必须有专项验收。
- 产品库改动必须保留 `rawFields`。
- 空成本不能显示成正常 0。
- AI 不能决定最终成本价。

### 文档同步

只要发生业务或规则变化，就必须同步文档：

- 修 bug：更新 `docs/BUG_LOG.md`。
- 新增或改变功能：更新 `docs/FEATURE_MAP.md`。
- 改交付版本：更新 `docs/RELEASE_NOTES.md`。
- 改数据库设计：更新数据库草案或迁移说明。
- 改产品库导入或报价匹配：更新 `docs/QUOTE_ACCEPTANCE_REPORT.md` 或相关验收文档。

## 4. 每轮结束

每轮结束必须更新 `docs/DEV_LOG.md`，记录：

- 日期。
- 修改目标。
- 修改原因。
- 关联 bug。
- 关联功能。
- 涉及文件。
- 具体改动。
- 验证结果。
- 是否影响旧功能。
- 回退方式。
- 下一步建议。

每轮结束必须写验证结果。没有跑测试也要说明原因。

每轮结束必须写下一步建议，且只能推荐可执行的小任务。

### 固定交付物

每轮执行完毕后必须给出：

- 本地可访问端口和 URL。
- 端口健康检查结果。
- 本轮交付压缩包绝对路径。
- 压缩包排除说明。

压缩包默认放到 `/Users/alic/Downloads/youyixing-builds/`。

压缩包必须排除：

- `.git/`
- `node_modules/`
- `.DS_Store`
- `.env`
- `.env.*`
- `runtime-settings.json`
- 任何包含真实 API Key、数据库密码或 service role key 的文件

如果本轮没有改业务代码，也仍然需要提供当前可运行端口和当前工作区压缩包。

## 5. Bug 处理规则

发现 bug 后必须写入 `docs/BUG_LOG.md`，包含：

- Bug 编号。
- 发现日期。
- 发现来源。
- 问题描述。
- 出现位置。
- 复现步骤。
- 预期结果。
- 实际结果。
- 严重程度。
- 影响范围。
- 可能原因。
- 修复方案。
- 涉及文件。
- 验证步骤。
- 验证结果。
- 当前状态。

没有复现步骤的 bug，不进入修复。

## 6. 功能变更规则

新增功能或改变现有功能时，必须更新 `docs/FEATURE_MAP.md`。

每个功能记录：

- 功能编号。
- 功能名称。
- 功能描述。
- 涉及页面。
- 涉及组件。
- 涉及接口。
- 涉及数据字段。
- 当前状态。
- 风险说明。
- 是否为核心交付功能。

## 7. 验证规则

常规检查优先执行：

- `node --check app.js`
- `node --check server.js`
- `for f in $(find public/js -type f | sort); do node --check "$f" || exit 1; done`
- `node --test tests/*.test.js`

涉及产品库时增加：

- `node --test tests/product-catalog-import.test.js`
- 产品库数量检查。
- 重庆四个用车案例。
- 北京两天案例。

涉及 DeepSeek 时增加：

- `/api/settings`
- `/api/settings/ai/test`
- `/api/agent`
- `/api/translate/segment`

涉及客户方案时增加：

- 生成客户方案。
- 导出图片。
- 下载 PDF。
- 检查客户方案不显示内部成本和供应商联系方式。

## 8. 回滚规则

每轮必须说明回滚方式。

优先级：

1. 文档改动：删除或回退对应文档。
2. 单文件代码改动：回退该文件。
3. 多文件功能改动：用 git revert 回退整次提交。
4. 数据库改动：必须有 down migration 或禁用开关。
5. 云端产品库错误批次：不要删除历史，发布新的正确批次。

禁止未确认就执行 `git reset --hard`。

## 9. 敏感信息规则

以下文件不得提交：

- `.env`
- `.env.*`
- `.env.supabase.local`
- `runtime-settings.json`
- 任何包含 DeepSeek Key、Supabase service role key、数据库密码的文件

提交前必须执行：

- `git status --short`
- 检查 staged files
- 检查是否误加入密钥

## 10. 本阶段优先级

当前优先级：

1. 产品库字段和成本可信度。
2. 报价明细来源和缺成本提示。
3. 客户验收案例稳定。
4. 登录与权限基础。
5. 订单最小可交付。

暂不优先：

- 老板看板。
- 飞书同步。
- 多租户。
- 完整财务。
- 大规模重构。
