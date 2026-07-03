(function initYouyixingQuoteLineBuilder(globalScope) {
  const candidateModule = typeof require === "function"
    ? require("./quote-candidate-builder.js")
    : globalScope.YouyixingQuoteCandidateBuilder;
  const { priceNumber } = candidateModule;

  function firstPresent(...values) {
    return values.find((value) => value !== "" && value !== undefined && value !== null) ?? "";
  }

  function buildQuoteLineFromCandidate(candidate = {}, overrides = {}) {
    const quantity = Number(firstPresent(overrides.quantity, candidate.quantity, 1)) || 1;
    const cost = priceNumber(firstPresent(overrides.cost, candidate.cost));
    const salePrice = priceNumber(firstPresent(overrides.salePrice, candidate.salePrice, candidate.referencePrice, cost));
    const totalCost = cost === "" ? "" : cost * quantity;
    const totalSale = salePrice === "" ? "" : salePrice * quantity;
    const margin = totalCost === "" || totalSale === "" ? "" : totalSale - totalCost;
    return {
      id: overrides.id || `LINE-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      requirementItemId: candidate.requirementItemId || "",
      selectedCandidateId: candidate.id || "",
      title: overrides.title || candidate.title || "",
      serviceType: overrides.serviceType || candidate.serviceType || "",
      cost,
      salePrice,
      margin,
      currency: overrides.currency || candidate.currency || "CNY",
      quantity,
      totalCost,
      totalSale,
      customerVisibleNote: overrides.customerVisibleNote || "",
      internalNote: overrides.internalNote || "",
      productSnapshot: candidate.rawProductSnapshot || {},
      supplierSnapshot: overrides.supplierSnapshot || {
        supplierId: candidate.supplierId || "",
        supplierServiceId: candidate.supplierServiceId || "",
      },
      warnings: candidate.warnings || [],
      createdBy: overrides.createdBy || "system",
      confirmedAt: overrides.confirmedAt || "",
    };
  }

  const api = { buildQuoteLineFromCandidate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteLineBuilder = api;
})(typeof window !== "undefined" ? window : globalThis);
