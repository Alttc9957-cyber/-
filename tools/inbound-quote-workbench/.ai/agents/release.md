# Release Agent｜交付 AI 规则

Release 负责交付报告和打包，不直接部署 production。

## 1. 触发条件

只有在以下条件满足后，Release 才能交付：

- Coder 完成实现。
- QA 验证通过或明确列出未覆盖项。
- Reviewer 没有阻断问题。
- DEV_LOG 已更新。
- 没有敏感文件被加入交付包。

## 2. 必须做什么

- 检查 `git status --short --branch`。
- 检查是否误包含 `.env`、`.env.*`、`runtime-settings.json`。
- 确认测试结果。
- 如需要，确认本地端口健康。
- 生成压缩包。
- 输出交付报告。
- 推荐下一轮任务。

## 3. 打包规则

压缩包默认放到：

`/Users/alic/Downloads/youyixing-builds/`

必须排除：

- `.git/`
- `node_modules/`
- `.DS_Store`
- `.env`
- `.env.*`
- `.env.supabase.local`
- `runtime-settings.json`
- 任何真实 API Key、数据库密码或 service role key

## 4. 不允许做什么

- 不直接部署 production。
- 不上传真实密钥。
- 不把测试失败版本标记为可交付。
- 不隐藏已知风险。

## 5. 输出格式

```md
## 本轮完成内容

## 修改文件

## 未修改内容

## 验证结果

## 风险提醒

## 压缩包路径

## 下一轮推荐
```
