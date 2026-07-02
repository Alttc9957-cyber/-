# VERSION_ARCHIVE

友易行历史交付包与相关开发资产索引。

说明：

- 本文件用于把过往压缩包、历史开发版本和相关资产纳入可追踪台账。
- 当前不把 zip 二进制文件复制进源码仓库，避免污染代码历史和增大仓库体积。
- 每个历史包保留本机绝对路径，后续需要审查某一版时，先解压到临时目录对比，不直接覆盖当前仓库。
- 如果某个历史包被确认为正式版本，再在 `docs/RELEASE_NOTES.md` 中补完整版本说明和验收结果。

## 当前基准版本

版本名：v0.1.0-baseline-2026-07-02

Git tag：`v0.1.0-baseline-2026-07-02`

Git commit：`49b2624`

说明：当前仓库真实状态冻结点。该版本作为后续审查、回滚和差异对比基准，不表示所有业务功能已通过验收。

## 友易行历史压缩包

| 序号 | 文件 | 本机路径 | 大小 | 时间 | 初步说明 | 当前处理 |
|---|---|---|---:|---|---|---|
| 1 | youyixing-quote-workbench-v7-p0-20260628-120853.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v7-p0-20260628-120853.zip` | 479K | 2026-06-28 12:10 | v7 P0 版本包 | 已纳入索引，未审查 |
| 2 | youyixing-quote-workbench-v8-p0-20260628-2021.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v8-p0-20260628-2021.zip` | 572K | 2026-06-28 20:32 | v8 P0 版本包 | 已纳入索引，未审查 |
| 3 | youyixing-quote-workbench-v8-main-chain-20260629-174044.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v8-main-chain-20260629-174044.zip` | 672K | 2026-06-29 17:40 | v8 主流程版本包 | 已纳入索引，未审查 |
| 4 | youyixing-quote-workbench-v9-itinerary-import-20260630-163838.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v9-itinerary-import-20260630-163838.zip` | 1.2M | 2026-06-30 16:38 | v9 行程导入版本包 | 已纳入索引，未审查 |
| 5 | youyixing-quote-workbench-v10-closed-main-flow-20260630-230753.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v10-closed-main-flow-20260630-230753.zip` | 1.2M | 2026-06-30 23:07 | v10 主流程闭环版本包 | 已纳入索引，未审查 |
| 6 | youyixing-quote-workbench-v10-product-library-call-fix-20260701-1204.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v10-product-library-call-fix-20260701-1204.zip` | 1.2M | 2026-07-01 12:09 | v10 产品库调用修复版本包 | 已纳入索引，未审查 |
| 7 | youyixing-quote-workbench-v11-product-library-template-import-20260701-1340.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v11-product-library-template-import-20260701-1340.zip` | 1.2M | 2026-07-01 13:40 | v11 产品库模板导入版本包 | 已纳入索引，未审查 |
| 8 | youyixing-quote-workbench-v12-system-product-catalog-20260701-1509.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v12-system-product-catalog-20260701-1509.zip` | 1.3M | 2026-07-01 15:09 | v12 系统产品库版本包 | 已纳入索引，未审查 |
| 9 | youyixing-quote-workbench-v12-product-import-match-fix-20260701.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v12-product-import-match-fix-20260701.zip` | 1.3M | 2026-07-01 16:06 | v12 产品导入和匹配修复版本包 | 已纳入索引，未审查 |
| 10 | youyixing-quote-workbench-v12-quotelegs-vehicle-rows-20260701-2008.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v12-quotelegs-vehicle-rows-20260701-2008.zip` | 1.3M | 2026-07-01 20:09 | v12 quoteLegs 用车行版本包 | 已纳入索引，未审查 |
| 11 | youyixing-quote-workbench-v12-client-test-20260702-2208.zip | `/Users/alic/Downloads/youyixing-builds/youyixing-quote-workbench-v12-client-test-20260702-2208.zip` | 1.3M | 2026-07-02 22:08 | v12 客户测试热修包 | 已纳入索引，未审查 |

## 相关历史资产

| 序号 | 文件或目录 | 本机路径 | 大小 | 时间 | 初步说明 | 当前处理 |
|---|---|---|---:|---|---|---|
| 1 | aicat-template-assets | `/Users/alic/Downloads/youyixing-builds/aicat-template-assets/` | 2 张图片 | 2026-06-29 | AI 猫模板素材，与友易行主报价系统非同一业务模块 | 已纳入索引，暂不进入友易行源码 |
| 2 | enterprise-ai-content-workflow-sop-20260630-110541.zip | `/Users/alic/Downloads/youyixing-builds/enterprise-ai-content-workflow-sop-20260630-110541.zip` | 147K | 2026-06-30 11:05 | 企业 AI 内容工作流 SOP 包，非友易行报价主系统 | 已纳入索引，暂不进入友易行源码 |
| 3 | enterprise-ai-content-workflow-scoring-20260630-111104.zip | `/Users/alic/Downloads/youyixing-builds/enterprise-ai-content-workflow-scoring-20260630-111104.zip` | 152K | 2026-06-30 11:11 | 企业 AI 内容工作流评分包，非友易行报价主系统 | 已纳入索引，暂不进入友易行源码 |

## 后续审查流程

如果要从历史包中找回某个功能或判断 bug 是哪一版引入，按下面流程做：

1. 新建临时目录，例如 `/tmp/youyixing-archive-review/v10-product-library-call-fix/`。
2. 解压目标 zip 到临时目录。
3. 用 `diff -ru` 或 Git 临时分支对比当前 baseline。
4. 只摘取明确需要的最小改动。
5. 在 `docs/DEV_LOG.md` 记录来源包、摘取原因、涉及文件、验证结果和回退方式。
6. 如果发现历史包自身存在问题，登记到 `docs/BUG_LOG.md`。

禁止事项：

- 不直接用历史 zip 覆盖当前仓库。
- 不把不同版本里互相冲突的代码一次性混合进当前版本。
- 不把非友易行业务包当作友易行主系统代码提交。
- 不把 zip 二进制作为常规源码文件提交，除非明确要做离线交付归档。
