(function initYouyixingQuoteVersionBuilder(globalScope) {
  const warningModule = typeof require === "function"
    ? require("./quote-warnings.js")
    : globalScope.YouyixingQuoteWarnings;
  const typeModule = typeof require === "function"
    ? require("./quote-types.js")
    : globalScope.YouyixingQuoteTypes;
  const { uniqueWarnings } = warningModule;
  const { QUOTE_VERSION_STATUSES } = typeModule;

  function numberOrZero(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function buildQuoteVersion(quoteId, lines = [], context = {}) {
    const totalCost = lines.reduce((sum, line) => sum + numberOrZero(line.totalCost !== undefined ? line.totalCost : numberOrZero(line.cost) * numberOrZero(line.quantity || 1)), 0);
    const totalSale = lines.reduce((sum, line) => sum + numberOrZero(line.totalSale !== undefined ? line.totalSale : numberOrZero(line.salePrice) * numberOrZero(line.quantity || 1)), 0);
    const grossMargin = totalSale ? totalSale - totalCost : 0;
    const status = QUOTE_VERSION_STATUSES.includes(context.status) ? context.status : "draft";
    return {
      id: context.id || `QV-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      quoteId: quoteId || context.quoteId || "",
      versionNo: Number(context.versionNo || 1),
      status,
      lines,
      totals: {
        totalCost,
        totalSale,
        grossMargin,
        grossMarginRate: totalSale ? Number(((grossMargin / totalSale) * 100).toFixed(2)) : 0,
        currency: context.currency || lines[0]?.currency || "CNY",
      },
      warnings: uniqueWarnings(lines.flatMap((line) => line.warnings || []).concat(context.warnings || [])),
      createdBy: context.createdBy || "system",
      createdAt: context.createdAt || new Date().toISOString(),
      productCatalogVersion: context.productCatalogVersion || "",
    };
  }

  const api = { buildQuoteVersion };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteVersionBuilder = api;
})(typeof window !== "undefined" ? window : globalThis);
