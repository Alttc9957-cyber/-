const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

const root = path.resolve(__dirname, "..");
loadLocalEnv(path.join(root, ".env"));
loadLocalEnv(path.join(root, ".env.supabase.local"));

const catalogPath = path.resolve(process.argv[2] || path.join(root, "data/products/youyixing-product-catalog.json"));
const sourceExcelPath = process.argv[3] || "/Users/alic/Downloads/产品库汇总.xlsx";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL. Put it in .env.supabase.local or export it before running.");
  process.exit(1);
}

function loadLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

function stableHash(filePath, fallbackText = "") {
  const hash = crypto.createHash("sha256");
  if (fs.existsSync(filePath)) hash.update(fs.readFileSync(filePath));
  else hash.update(fallbackText);
  return hash.digest("hex");
}

function numberOrNull(value) {
  if (value === "" || value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value).trim().replace(/[¥￥,\s]/g, "");
  return /^-?\d+(?:\.\d+)?$/.test(text) ? Number(text) : null;
}

function textOrNull(value) {
  if (value === "" || value == null) return null;
  return String(value);
}

function firstNumberOrNull(...values) {
  for (const value of values) {
    const number = numberOrNull(value);
    if (number != null) return number;
  }
  return null;
}

function resourceName(item) {
  return item.name || item.scenicName || item.experienceName || item.hotelName || item.restaurant || "";
}

function resourceSpec(item) {
  return item.spec || item.ticketType || item.language || item.roomType || item.star || "";
}

function sourceKey(item, category, index) {
  return [
    category,
    item.sourceSheet || "",
    item.sourceRow || "",
    item.model || "",
    item.ticketType || "",
    item.language || "",
    item.roomType || "",
    resourceName(item),
    index,
  ].join("|");
}

function flattenCatalog(productCatalog = {}) {
  const categoryMap = {
    routes: "线路产品",
    vehicles: "用车",
    experiences: "特色体验",
    tickets: "景点门票",
    guides: "导游",
    hotels: "酒店",
    meals: "餐厅",
    transports: "大交通",
    others: "其他",
  };
  return Object.entries(categoryMap).flatMap(([key, category]) => (
    Array.isArray(productCatalog[key])
      ? productCatalog[key].map((item, index) => ({ key, category, item, index }))
      : []
  ));
}

function costValue(item) {
  return numberOrNull(item.costPrice ?? item.lowSeasonCost ?? item.adultCost ?? item.minCost);
}

function nonEmptyRawCount(item) {
  return Object.entries(item.rawFields || {})
    .filter(([key, value]) => !key.includes("列 /") && value !== "" && value != null)
    .length;
}

function buildQualityReport(payload) {
  const rows = flattenCatalog(payload.productCatalog);
  const byCategory = {};
  rows.forEach(({ category, item }) => {
    const bucket = byCategory[category] || (byCategory[category] = {
      total: 0,
      missingCost: 0,
      zeroCost: 0,
      missingCity: 0,
      rawMissing: 0,
    });
    bucket.total += 1;
    if (costValue(item) == null) bucket.missingCost += 1;
    if (costValue(item) === 0) bucket.zeroCost += 1;
    if (!item.city) bucket.missingCity += 1;
    if (!item.rawFields || !Object.keys(item.rawFields).length) bucket.rawMissing += 1;
  });

  const duplicateKeys = new Map();
  rows.forEach(({ category, item }) => {
    const key = [category, item.city || "", resourceName(item), item.serviceType || "", item.route || "", item.model || "", item.ticketType || "", item.language || ""].join("|");
    duplicateKeys.set(key, (duplicateKeys.get(key) || 0) + 1);
  });

  const suspiciousRows = rows
    .filter(({ item }) => nonEmptyRawCount(item) === 0 && costValue(item) == null && numberOrNull(item.salePrice) == null)
    .map(({ category, item }) => ({
      category,
      sourceSheet: item.sourceSheet,
      sourceRow: item.sourceRow,
      city: item.city || "",
      name: resourceName(item),
    }));

  const productCatalog = payload.productCatalog || {};
  const checks = [
    {
      name: "重庆接送机7座",
      pass: Boolean((productCatalog.vehicles || []).find((item) => item.city === "重庆" && item.serviceType === "接送机" && item.model === "7座" && numberOrNull(item.costPrice) === 250)),
    },
    {
      name: "重庆武隆14座",
      pass: Boolean((productCatalog.vehicles || []).find((item) => item.city === "重庆" && item.serviceType === "包车" && /武隆/.test(item.route || "") && item.model === "14座~17座" && numberOrNull(item.costPrice) === 1500)),
    },
    {
      name: "北京大兴7座",
      pass: Boolean((productCatalog.vehicles || []).find((item) => item.city === "北京" && item.serviceType === "接送机" && /大兴/.test(item.route || "") && item.model === "7座" && numberOrNull(item.costPrice) === 260)),
    },
    {
      name: "故宫门票",
      pass: Boolean((productCatalog.tickets || []).find((item) => item.city === "北京" && /故宫/.test(item.scenicName || "") && numberOrNull(item.costPrice) === 60)),
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    sourceFile: payload.meta?.sourceFile || "",
    sourceVersion: payload.meta?.version || "",
    counts: Object.fromEntries(Object.entries(productCatalog).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    byCategory,
    suspiciousRows,
    duplicateKeys: [...duplicateKeys.entries()].filter(([, count]) => count > 1).slice(0, 50).map(([key, count]) => ({ key, count })),
    checks,
    pass: suspiciousRows.length === 0 && checks.every((item) => item.pass),
  };
}

function qualityFlags(item) {
  const flags = [];
  if (costValue(item) == null) flags.push("missing_cost");
  if (!item.city) flags.push("missing_city");
  if (!item.supplierName || item.supplierName === "待绑定供应商") flags.push("pending_supplier");
  if (nonEmptyRawCount(item) === 0) flags.push("raw_fields_empty");
  return flags;
}

async function insertRows(client, table, columns, rows, chunkSize = 100) {
  if (!rows.length) return;
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    const values = [];
    const groups = chunk.map((row, rowIndex) => {
      const placeholders = columns.map((_, columnIndex) => {
        values.push(row[columnIndex]);
        return `$${rowIndex * columns.length + columnIndex + 1}`;
      });
      return `(${placeholders.join(",")})`;
    });
    await client.query(
      `insert into ${table} (${columns.join(",")}) values ${groups.join(",")}`,
      values,
    );
  }
}

async function main() {
  const payload = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const report = buildQualityReport(payload);
  const sourceHash = stableHash(sourceExcelPath, JSON.stringify(payload));
  const sourceVersion = payload.meta?.version || `product-catalog-${new Date().toISOString().slice(0, 10)}`;
  const rows = flattenCatalog(payload.productCatalog);

  if (!report.pass) {
    console.error(JSON.stringify({ message: "Quality gate failed", report }, null, 2));
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  try {
    await client.query("begin");
    const batchResult = await client.query(
      `insert into product_import_batches (source_file, source_hash, source_version, status, counts, quality_report)
       values ($1, $2, $3, 'importing', $4::jsonb, $5::jsonb)
       returning id`,
      [
        payload.meta?.sourceFile || sourceExcelPath,
        sourceHash,
        sourceVersion,
        JSON.stringify(report.counts),
        JSON.stringify(report),
      ],
    );
    const batchId = batchResult.rows[0].id;

    const importRowRows = [];
    const resourceRows = [];
    const tierRows = [];

    for (const { category, item, index } of rows) {
      const flags = qualityFlags(item);
      const resourceId = crypto.randomUUID();
      importRowRows.push([
        batchId,
        item.sourceSheet || "",
        Number(item.sourceRow) || 0,
        category,
        JSON.stringify(item.rawFields || {}),
        JSON.stringify(item),
        JSON.stringify(flags),
      ]);

      resourceRows.push([
        resourceId,
        batchId,
        sourceKey(item, category, index),
        category,
        textOrNull(item.city),
        textOrNull(resourceName(item)),
        textOrNull(item.serviceType || item.vehicleType),
        textOrNull(item.route),
        textOrNull(item.model),
        textOrNull(resourceSpec(item)),
        textOrNull(item.supplierName || "待绑定供应商"),
        costValue(item),
        firstNumberOrNull(item.salePrice, item.adultSale, item.lowSeasonSale),
        numberOrNull(item.lowSeasonCost),
        numberOrNull(item.highSeasonCost),
        firstNumberOrNull(item.adultCost, item.agencyAdult, item.peakAdult, item.offAdult),
        firstNumberOrNull(item.childCost, item.agencyChild, item.peakChild, item.offChild),
        textOrNull(item.pricingUnit),
        textOrNull(item.status || (costValue(item) == null ? "待补成本" : "可报价")),
        textOrNull(item.source || "Excel系统产品库"),
        textOrNull(item.sourceSheet),
        Number(item.sourceRow) || null,
        JSON.stringify(item.rawFields || {}),
        JSON.stringify(item.extraFields || {}),
        JSON.stringify(flags),
        sourceVersion,
        true,
      ]);

      const tiers = item.priceTiers || {};
      for (const [tierGroup, values] of Object.entries(tiers)) {
        if (!values || typeof values !== "object") continue;
        for (const [tierName, tierValue] of Object.entries(values)) {
          tierRows.push([
            resourceId,
            tierGroup,
            tierName,
            tierGroup === "cost" ? numberOrNull(tierValue) : null,
            tierGroup === "cost" ? null : numberOrNull(tierValue),
            JSON.stringify({ tierGroup, tierName, value: tierValue }),
          ]);
        }
      }
    }

    await insertRows(client, "product_import_rows", [
      "import_batch_id",
      "source_sheet",
      "source_row",
      "category",
      "raw_fields",
      "normalized_fields",
      "quality_flags",
    ], importRowRows, 200);

    await insertRows(client, "product_resources", [
      "id",
      "import_batch_id",
      "source_key",
      "category",
      "city",
      "name",
      "service_type",
      "route",
      "model",
      "spec",
      "supplier_name",
      "cost_price",
      "sale_price",
      "low_season_cost",
      "high_season_cost",
      "adult_cost",
      "child_cost",
      "pricing_unit",
      "status",
      "source",
      "source_sheet",
      "source_row",
      "raw_fields",
      "extra_fields",
      "quality_flags",
      "published_version",
      "is_published",
    ], resourceRows, 100);

    await insertRows(client, "product_price_tiers", [
      "product_resource_id",
      "tier_group",
      "tier_name",
      "cost_price",
      "sale_price",
      "raw_fields",
    ], tierRows, 200);

    await client.query(`update product_resources set is_published = false where import_batch_id <> $1`, [batchId]);

    for (const check of report.checks) {
      await client.query(
        `insert into product_quality_checks (import_batch_id, check_name, severity, status, message, evidence)
         values ($1,$2,$3,$4,$5,$6::jsonb)`,
        [
          batchId,
          check.name,
          check.pass ? "info" : "high",
          check.pass ? "pass" : "fail",
          check.pass ? `${check.name} 命中` : `${check.name} 未命中`,
          JSON.stringify(check),
        ],
      );
    }

    Object.entries(report.byCategory).forEach(([category, stats]) => {
      if (stats.missingCost > 0) {
        report.checks.push({
          name: `${category} 缺成本`,
          pass: true,
          warning: true,
          missingCost: stats.missingCost,
          total: stats.total,
        });
      }
    });

    await client.query(
      `update product_import_batches
       set status = 'published', quality_report = $2::jsonb, published_at = now(), updated_at = now()
       where id = $1`,
      [batchId, JSON.stringify(report)],
    );

    await client.query("commit");
    console.log(JSON.stringify({
      batchId,
      sourceVersion,
      counts: report.counts,
      pass: report.pass,
      warnings: Object.entries(report.byCategory)
        .filter(([, stats]) => stats.missingCost > 0)
        .map(([category, stats]) => ({ category, missingCost: stats.missingCost, total: stats.total })),
    }, null, 2));
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
