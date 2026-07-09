(function initYouyixingQuoteEngineAdapter(globalScope) {
  const quoteDomain = typeof require === "function"
    ? require("../domain/quote/index.js")
    : globalScope.YouyixingQuoteDomain;

  function legacyProductItemsFromState(state = {}) {
    const catalog = state.productCatalog || {};
    return [
      ...(catalog.vehicles || []).map((item) => ({ ...item, category: "用车" })),
      ...(catalog.tickets || []).map((item) => ({ ...item, category: "景点门票", name: item.scenicName || item.name })),
      ...(catalog.guides || []).map((item) => ({ ...item, category: "导游", name: item.name || `${item.language || ""}导游服务` })),
      ...(catalog.hotels || []).map((item) => ({ ...item, category: "酒店", name: item.hotelName || item.name })),
      ...(catalog.meals || []).map((item) => ({ ...item, category: "餐厅", name: item.restaurant || item.name })),
      ...(catalog.experiences || []).map((item) => ({ ...item, category: "特色体验", name: item.experienceName || item.name })),
    ];
  }

  function requirementFromLegacyVehicleRow(row = {}, day = {}, demand = {}) {
    return quoteDomain.normalizeQuoteRequirementItem({
      id: row.quoteLegId || "",
      quoteId: demand.quoteId || "",
      dayIndex: row.dayIndex || 0,
      city: row.city || day.city,
      date: row.date || day.date || demand.startDate,
      serviceType: row.serviceType || "用车",
      serviceSubType: row.legLabel || row.route,
      pax: demand.people || demand.pax || 0,
      vehicleType: row.model || demand.charterVehicleType || demand.transferVehicleType,
      productHints: [row.route, row.legLabel, day.overview, day.detail].filter(Boolean),
      source: "legacy-vehicle-row",
      rawInput: { row, day, demand },
    });
  }

  function buildCandidatesForLegacyRequirement(requirementInput, state = {}, options = {}) {
    const requirement = quoteDomain.normalizeQuoteRequirementItem(requirementInput, options);
    const products = options.products || legacyProductItemsFromState(state);
    return quoteDomain.buildQuoteCandidates(requirement, products, options);
  }

  const api = { legacyProductItemsFromState, requirementFromLegacyVehicleRow, buildCandidatesForLegacyRequirement };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteEngineAdapter = api;
})(typeof window !== "undefined" ? window : globalThis);
