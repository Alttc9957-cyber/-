# DEV_LOG

友易行开发日志。从 2026-07-02 起，任何业务修改、修复、上线、回退、测试补丁都必须登记到本文件。

## 记录规则

每次修改必须记录：

- 日期：
- 修改目标：
- 修改原因：
- 关联 bug：
- 关联功能：
- 涉及文件：
- 具体改动：
- 验证结果：
- 是否影响旧功能：
- 回退方式：
- 下一步建议：

要求：

- 先写清楚为什么改，再改代码。
- 一个提交只解决一个明确目标。
- 不允许把业务修复、UI 调整、数据迁移混在一个无法审查的提交里。
- 如果发现新问题，必须同步登记到 `docs/BUG_LOG.md`。
- 如果改变用户可见功能，必须同步登记到 `docs/CHANGELOG.md`。
- 如果改变交付版本，必须同步登记到 `docs/RELEASE_NOTES.md`。
- 如果影响核心流程，必须按 `docs/QA_CHECKLIST.md` 跑回归。

## 2026-07-02

日期：2026-07-02

修改目标：冻结当前友易行项目状态，建立可追踪、可回溯、可审查的开发管理机制。

修改原因：项目已经经历多轮修改，存在版本混乱、bug 修复记录不清、功能变更不可追踪的问题；当前阶段需要先建立基准版本和管理文档，不继续扩大业务改动。

关联 bug：

- BUG-20260702-001 产品库导入和报价匹配仍需重新验收。
- BUG-20260702-003 图片和 PDF 导出失败需复测。
- BUG-20260702-004 运行日志缺少关键识别上下文。

关联功能：

- F-001 报价项目列表与项目状态
- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填
- F-007 客户方案生成与导出
- F-015 本地服务、AI 接口与运行日志

涉及文件：

- `docs/DEV_LOG.md`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/FEATURE_MAP.md`
- `docs/QA_CHECKLIST.md`
- `docs/RELEASE_NOTES.md`
- `docs/VERSION_ARCHIVE.md`

具体改动：

- 创建当前代码基准提交。
- 创建 tag：`v0.1.0-baseline-2026-07-02`。
- 新增开发日志、版本变更、bug 管理、功能地图、QA 清单、发布说明文档。
- 初步登记当前主要功能模块和已知风险。
- 新增历史版本资产索引，把 `/Users/alic/Downloads/youyixing-builds/` 下 v7 到 v12 的友易行压缩包、企业 AI 内容工作流包和 AI 猫素材目录纳入追踪。

验证结果：

- 已确认仓库处于 Git 管理。
- 已创建 baseline commit 和 tag。
- 本次文档提交后需确认 `git status --short` 为空。

是否影响旧功能：否。本次只新增文档和 Git 版本记录，不修改业务逻辑。

回退方式：

- 只查看 baseline：`git switch --detach v0.1.0-baseline-2026-07-02`
- 需要把当前分支回退到 baseline 时，先确认无未保存改动，再执行：`git reset --hard v0.1.0-baseline-2026-07-02`

下一步建议：

- 下一阶段不要直接修多个 bug。
- 先按 `docs/BUG_LOG.md` 逐条登记复现路径。
- 优先做产品库导入与报价成本回填的最小闭环验收。
- 若需要从历史包找回功能，先按 `docs/VERSION_ARCHIVE.md` 解压到临时目录对比，不直接覆盖当前仓库。

## 2026-07-03

日期：2026-07-03

修改目标：用真实《产品库汇总.xlsx》重建系统产品库，修复模板导入漏行、错列和原始字段丢失问题。

修改原因：产品库是报价成本的来源；旧构建脚本会把特色体验、门票里票种为空但有价格的有效行跳过，并且部分 Sheet 的备注 / 建议价列错位，导致成本或辅助字段进库前已经丢失。

关联 bug：

- BUG-20260702-001
- BUG-20260703-003

关联功能：

- F-004 产品资源库导入与清洗
- F-005 产品资源匹配与报价成本回填

涉及文件：

- `app.js`
- `scripts/build-system-product-catalog.py`
- `data/products/youyixing-product-catalog.json`
- `tests/product-catalog-import.test.js`
- `docs/acceptance-product-catalog-20260703.md`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/DEV_LOG.md`

具体改动：

- `rawFields` 保留标准字段名，同时补充 Excel 列坐标和多行表头组合名。
- 特色体验中票种为空但有体验名称和价格的行导入为 `ticketType=体验项目`。
- 门票中票种为空但有景点名称和价格的行不再跳过，优先用类型补票种。
- 修正系统产品库构建脚本中 `特色体验价` M 列备注、`餐` K/L 列建议价和加价信息的保存。
- 用 `/Users/alic/Downloads/产品库汇总.xlsx` 重新生成 `youyixing-product-catalog.json`。
- 新增产品库导入回归测试，锁住重庆 / 北京关键成本点和空成本规则。

验证结果：

- `node --check app.js` 通过。
- `python3 -m py_compile scripts/build-system-product-catalog.py` 通过。
- `node --test tests/product-catalog-import.test.js` 4 项通过。
- `node --test tests/quotable-resource-core.test.js` 6 项通过。
- 本地 `http://127.0.0.1:8787/` 返回 `HTTP/1.1 200 OK`。
- 产品库 JSON 返回 `HTTP/1.1 200 OK`，且重庆接送机 7 座成本为 250。

是否影响旧功能：影响产品库模板导入和系统底库数据；不改变报价主流程，不新增业务模块。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`。
- 若只回退系统产品库数据，可恢复上一版 `data/products/youyixing-product-catalog.json` 并重新加载页面。

下一步建议：

- 在浏览器清除本地产品库覆盖层后，用重庆和北京客户案例跑完整报价明细。
- 单独修复客户方案图片和 PDF 下载。

---

日期：2026-07-03

修改目标：修复供应商管理 V1.3 验收风险，并新增 V1.4 可报价资源查询与报价行成本快照能力。

修改原因：客户反馈 API/调用出口缺失，供应商服务明细无法稳定进入报价明细，导致产品资源、供应商成本和报价行之间不可追溯。

关联 bug：

- BUG-20260703-001
- BUG-20260703-002

关联功能：

- F-005 产品资源匹配与报价成本回填
- F-009 供应商管理与服务明细
- F-010 本地数据加载与持久化

涉及文件：

- `quotable-resource-core.js`
- `app.js`
- `index.html`
- `styles.css`
- `tests/quotable-resource-core.test.js`
- `docs/acceptance-v1.4.md`
- `docs/data-flow-v1.4.md`
- `docs/CHANGELOG.md`
- `docs/BUG_LOG.md`
- `docs/FEATURE_MAP.md`
- `docs/QA_CHECKLIST.md`

具体改动：

- 新增 `QuotableResource` 纯函数 core，支持供应商明细归一化、价格状态、查询、匹配、报价行快照和客户视图成本脱敏。
- 新增浏览器内查询服务 `window.YouyixingServices.queryQuotableResources`。
- 新增产品资源和供应商服务明细关联层。
- 产品资源库新增“供应商资源”入口。
- 供应商详情新增服务明细关联产品资源数量和报价调用次数。
- 报价行新增“从资源库选择供应商资源”入口，选中后回填成本、供应商、服务明细和 `quoteLineSnapshot`。
- 供应商联系人归一化为唯一主联系人。
- 包车服务明细统一使用包车价成本和包车价参考售价。
- 停用供应商排除在可报价资源之外。
- 初始化完成后再写入验收探针。

验证结果：

- `node --check app.js` 通过。
- `node --check server.js` 通过。
- `node --check quotable-resource-core.js` 通过。
- `node --test tests/quotable-resource-core.test.js` 6 项通过。
- `PORT=8799 node server.js` 启动成功。
- `curl -I --max-time 3 http://127.0.0.1:8799/` 返回 `HTTP/1.1 200 OK`。
- `/api/settings` 返回 `hasApiKey=true`，完整 Key 未返回前端。
- 浏览器烟测打开页面成功，业务控制台未捕获 error。

是否影响旧功能：影响报价行操作区、产品资源库行操作、供应商详情展示；未重写报价主流程，未删除已有功能。

回退方式：

- 回退本次提交：`git revert <本次提交哈希>`
- 临时禁用 V1.4 查询入口：恢复 `index.html` 中 `quotable-resource-core.js` script 引用和 `app.js` 中新增的 `YouyixingServices`、报价行选择入口。

下一步建议：

- 用真实《产品库汇总.xlsx》重新导入后，手工关联供应商服务明细并验证报价行选择。
- 继续单独修复客户方案图片和 PDF 下载问题。
