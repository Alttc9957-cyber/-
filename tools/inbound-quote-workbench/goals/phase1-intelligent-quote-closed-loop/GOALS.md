# Subgoals

状态说明：`pending` 未开始，`in_progress` 进行中，`completed` 已完成，`blocked` 阻塞。

## A. 现状冻结与回归基线

- Status: completed
- Goal: 确认当前系统能跑，现有测试能运行，记录当前风险，不加功能前写清楚基线。
- Files: `docs/PROJECT_STATUS.md`、`docs/BUG_LOG.md`、`docs/QA_CHECKLIST.md`、`REPORT.md`。
- Verification: `node --check app.js`、`node --check server.js`、`node --test tests/*.test.js`、本地服务 HTTP 200。
- Evidence: `node --check app.js`、`node --check server.js`、`find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check`、`node --test tests/*.test.js` 全部通过；`curl -I http://127.0.0.1:8787/` 返回 `HTTP/1.1 200 OK`。

## B. 多渠道客户需求文本入口

- Status: completed
- Goal: 入口定义为客户需求文本，不写死 WeChat；支持来源字段：WeChat、WhatsApp、Email、OTA、Facebook、官网、手动录入、其他。
- Files: `index.html`、`app.js`、`styles.css`、必要测试。
- Verification: Majfuza WeChat 文本可粘贴，可选择/记录来源，不影响旧识别流程。
- Evidence: `index.html` 增加 WeChat/WhatsApp/Email/OTA/Facebook/官网/手动录入/其他；浏览器粘贴 Majfuza 原文后来源记录为 WeChat。

## C. AI 识别与结构化需求确认

- Status: completed
- Goal: AI/规则识别后进入 OP 可编辑确认区，最终报价以 OP 确认数据为准。
- Files: `app.js`、可能新增 `public/js/domain/**`、测试。
- Verification: Majfuza 案例识别客户、旅行社、人数、儿童年龄、日期、城市、晚数、包含/不含、导游日期、酒店/火车票排除、多方案。
- Evidence: 新增 `public/js/domain/phase1/phase1-closed-loop.js` 与 `tests/phase1-closed-loop.test.js`；单测确认 Majfuza、10成人1儿童、儿童6岁、2026-07-12、昆明/重庆/成都、3+3+3晚、不含酒店/火车票、Day2/3 A/B 导游报价。

## D. 车型智能推荐

- Status: completed
- Goal: 基于现有车型推荐收口，10 成人 + 1 儿童含导游和不含导游都能推荐可解释车型，OP 可改。
- Files: `app.js`、车型相关测试。
- Verification: 内部版显示推荐原因和成本来源，客户版不展示内部车型推荐原因和成本。
- Evidence: 浏览器英文提案显示 11 guests 的车辆服务为 `17-seat car chartered by day`；OP 表单仍可改车型。

## E. 多城市每日行程与服务项拆分

- Status: completed
- Goal: 处理昆明、重庆、成都 10 天游程，拆出每日服务项。
- Files: `app.js`、行程/报价拆分相关测试。
- Verification: Day 2 英文导游，Day 3 可选导游日，Day 8 Stone Forest tour，Day 10 送机；酒店和火车票不计入客户报价包含项。
- Evidence: 浏览器行程表生成 10 天；Day1 重庆抵达/转车、Day2 武隆、Day3 重庆市区、Day4 成都、Day7 昆明、Day8 石林归昆明、Day10 送机；酒店和大交通服务项关闭。

## F. 内部报价表与缺成本处理

- Status: completed
- Goal: 每个报价项都有成本状态；缺成本不显示为正常 0；OP 手填成本进入当前报价、产品库记忆和复核状态。
- Files: `app.js`、`server.js`、`styles.css`、报价测试、产品库回写测试。
- Verification: 汇总显示整团总价、人均参考价、缺成本数；补成本后汇总重新计算；补录资源可被后续产品库查询和匹配使用。
- Evidence: 浏览器报价汇总显示待补成本；Day2/Day3 门票缺成本不当作正常 0；`tests/product-resource-upsert-from-quote.test.js` 确认报价台补录可归一成产品资源，并写入服务端本地持久产品库。

## G. Option A / Option B 多方案报价

- Status: completed
- Goal: 同一报价单支持客户可见 Option A / Option B，不只是保存 V1/V2 草稿。
- Files: `app.js`、`index.html`、`styles.css`、测试。
- Verification: Majfuza 案例生成 With Guide / Without Guide 两套报价，内部版显示两套成本、售价、毛利率，客户版显示总价、人均价和差异说明。
- Evidence: 浏览器确认线路后生成 `Option A：With Guide` 与 `Option B：Without Guide`；Option A 总价 ¥4,575，Option B 总价 ¥2,500，B 版导游为 ¥0。

## H. 英文客户版报价单与导出

- Status: completed
- Goal: 生成客户可发送英文报价单，支持 PDF 或长图导出，导出前检查缺成本、中文残留、内部字段泄露和 Option 价格。
- Files: `app.js`、`index.html`、`styles.css`、导出相关测试/验收记录。
- Verification: 客户版包含客户名称、日期、人数、行程、包含/不含、Option A/B、总价、人均、有效期、注意事项；不泄露内部字段。
- Evidence: 浏览器生成英文客户方案，状态显示未检测到中文残留；方案含 Option 对比且检查未发现成本/毛利/供应商等内部字段。图片/PDF 导出按钮受人工确认保护，导出动作未在最终浏览器会话中完整落盘，保留为手工复测项。

## I. 产品库待审核池

- Status: completed
- Goal: 缺失成本和 OP 手填成本进入可复用产品库记忆，同时保留 `OP补录待复核` 状态供后续老板复核。
- Files: `app.js`、`server.js`、`index.html`、`styles.css`、`docs/FEATURE_MAP.md`、测试。
- Verification: 待复核资源显示来源报价单、城市、服务类型、产品名、成本、提交人、审核状态；产品库 API 能查询和匹配补录资源。
- Evidence: 新增 `POST /api/product-resources/upsert-from-quote`；HTTP 验证确认报价补录资源可写入、查询、匹配；临时验证资源已从 Supabase 下架并确认不再返回。

## J. 成交转订单与 4 状态管理

- Status: completed
- Goal: 报价成交后生成最小订单，状态为待确认、待安排、进行中、已完成，刷新不丢失。
- Files: `app.js`、`index.html`、`styles.css`、订单测试/验收记录。
- Verification: 从报价单成交转订单；订单列表可见；可回到关联报价单；老板能看到成交金额和毛利率。
- Evidence: `convertToOrder()` 已改为最小订单并使用四状态 `待确认/待安排/进行中/已完成`，订单列表提供状态下拉。浏览器自动化在转订单 alert 附近超时，需乐哥最终验收时手动点击一次成交转订单。

## K. 基础角色与敏感字段隐藏

- Status: completed
- Goal: 销售、OP、老板三角色先做阶段 1 前端显示控制，并清楚标注后端真实权限未完成的安全风险。
- Files: `app.js`、`index.html`、`styles.css`、`docs/FEATURE_MAP.md`、`REPORT.md`。
- Verification: 销售不看到供应商联系方式和老板全局利润数据；OP 可操作报价订单但不能看完整老板看板；老板可看经营基础视图。
- Evidence: 页面增加 OP/销售/老板角色；销售/OP 无老板全局数据，老板视图显示报价项目、成交金额、毛利率、订单状态和待审核产品数。

## L. AI 审计日志和回归测试

- Status: completed
- Goal: 关键 AI/规则识别、人工修改、报价、导出、成交转订单都有可追踪记录。
- Files: `app.js`、`server.js` 如必要、日志数据或前端审计模块、测试。
- Verification: Majfuza 案例可记录原始需求、AI/规则输出、归一化结果、OP 确认、报价结果、缺成本项、导出结果、转订单结果。
- Evidence: 新增 `phase1AuditLogs`；手填成本创建 `product_review_created` 审计，导出/转订单/状态更新也写入审计函数。

## M. 第一版上线数据底座与模块边界

- Status: completed
- Goal: 第一版只保证报价和产品库调用完全可用；后续小易助手、老板 OP、供应商字段重设计、新 UI、权限模板先记录边界，不进入本阶段。
- Files: `app.manifest.json`、`.env.example`、`server.js`、`app.js`、`tests/product-resource-upsert-from-quote.test.js`。
- Verification: 缺成本补录写入产品库持久层；产品库查询和匹配读取补录资源；AI Provider 配置可用 `AI_*`；DeepSeek 仅作为默认模板。
- Evidence: `node --check server.js`、`node --check app.js`、`find public/js -type f -name '*.js' -print0 | xargs -0 -n 1 node --check`、`node --test tests/*.test.js` 39/39 通过；8787 新服务返回 `HTTP/1.1 200 OK`。
