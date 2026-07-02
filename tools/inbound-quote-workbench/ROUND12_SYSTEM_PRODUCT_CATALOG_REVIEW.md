# Round 12 系统产品库覆盖与报价调用审查

时间：2026-07-01

## 本轮目标

- 以 `/Users/alic/Downloads/产品库汇总.xlsx` 作为系统产品库真源。
- 启动时清掉旧浏览器产品库缓存，不再让 `youyixing_product_state` 覆盖系统产品库。
- 报价时直接从系统产品库取成本，写入报价明细并汇总。

## 已落地

- 新增系统产品库生成脚本：`scripts/build-system-product-catalog.py`。
- 生成固定系统产品库：`data/products/youyixing-product-catalog.json`。
- 前端启动时优先加载系统产品库，模式为 `system_excel_overwrite`。
- 旧 localStorage 产品库缓存会被忽略并删除。
- 运行时默认产品库不再混入产品库主表，避免旧产品抢匹配。

## 系统产品库数量

| 品类 | 数量 |
|---|---:|
| 线路产品 | 24 |
| 用车 | 940 |
| 特色体验 | 69 |
| 景点门票 | 113 |
| 导游 | 52 |
| 酒店 | 153 |
| 餐厅 | 151 |

## 关键价格断言

| 场景 | 成本 | 卖价 |
|---|---:|---:|
| 北京 / 大兴机场接机 / 7座 | 260 | 460 |
| 重庆 / 接送机 / 7座 | 250 | 450 |
| 重庆 / 武隆包车 / 7座 | 950 | 1250 |
| 重庆 / 市内一日游8小时 / 7座 | 700 | 空 |

## 浏览器对抗验证

- 手动写入坏缓存 `youyixing_product_state` 后刷新页面，系统仍加载 Excel 系统库。
- `badCachePresent=false`。
- `localStorage.getItem("youyixing_product_state") === null`。
- 北京大兴接机 lookup：`cost=260`，`matchStatus=matched`。
- 重庆接机 lookup：`cost=250`，`matchStatus=matched`。
- 重庆 2 天报价链路：
  - Day 1 重庆接机：`unitCost=250`，`sourceName=重庆接送机 接送机 7座`，`supplierName=待绑定供应商`，`matchStatus=matched`。
  - Day 2 重庆市内一日游8小时：`unitCost=700`，`sourceName=重庆包车 市内一日游8小时 7座`，`supplierName=待绑定供应商`，`matchStatus=matched`。
- 浏览器控制台错误：0。

## 验证命令

- `node --check tools/inbound-quote-workbench/app.js`
- `node --check tools/inbound-quote-workbench/server.js`
- `git diff --check`
- `python3 -m json.tool tools/inbound-quote-workbench/data/products/youyixing-product-catalog.json`
- Chrome / Playwright 本机浏览器断言。
