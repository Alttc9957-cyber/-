# CHANGELOG

友易行版本变更记录。本文只记录面向版本的用户可见变化、关键修复、数据迁移和风险提示。

## [Unreleased]

### Added

- 新增开发管理文档体系：
  - `docs/DEV_LOG.md`
  - `docs/BUG_LOG.md`
  - `docs/FEATURE_MAP.md`
  - `docs/QA_CHECKLIST.md`
  - `docs/RELEASE_NOTES.md`
  - `docs/VERSION_ARCHIVE.md`
- 新增历史压缩包与相关开发资产索引，覆盖 v7 到 v12 的友易行历史交付包。

### Changed

- 暂无业务功能变更。

### Fixed

- 暂无业务 bug 修复。本次只建立管理机制。

### Known Risks

- 产品库导入、产品匹配、供应商成本回填仍需要完整复测。
- 图片导出和 PDF 下载仍需要复测。
- 运行日志当前不足以完整复盘 AI 原始输出、归一化结果和回退原因。

## [v0.1.0-baseline-2026-07-02] - 2026-07-02

### Baseline

- 冻结当前友易行项目代码状态。
- baseline commit：`49b2624`
- baseline tag：`v0.1.0-baseline-2026-07-02`

### Scope

- 包含报价项目、产品资源库、供应商管理、客户方案、AI 设置、本地数据和当前已有验收报告文件。
- 该版本是审查和回退基准，不代表所有功能已验收通过。

### Known Risks

- 当前业务代码经过多轮快速修改，功能状态不均衡。
- baseline 前的历史 bug 修复记录不完整。
- 后续每次修改必须在 `docs/DEV_LOG.md`、`docs/BUG_LOG.md` 或 `docs/CHANGELOG.md` 中留下可审查记录。
