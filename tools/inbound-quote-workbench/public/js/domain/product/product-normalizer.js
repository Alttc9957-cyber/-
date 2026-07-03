(function initYouyixingProductNormalizer(globalScope) {
  const remarkModule = typeof require === "function"
    ? require("./remark-atoms.js")
    : globalScope.YouyixingRemarkAtoms;

  function normalizeProductForQuote(product = {}) {
    const { cleanProduct, remarkAtoms } = remarkModule.normalizeProductRemarks(product);
    return {
      ...cleanProduct,
      remarkAtoms,
      agentContextSummary: [
        cleanProduct.category,
        cleanProduct.city,
        cleanProduct.name || cleanProduct.scenicName || cleanProduct.hotelName || cleanProduct.restaurant,
        cleanProduct.serviceType,
        cleanProduct.model,
        cleanProduct.ticketType,
      ].filter(Boolean).join(" / "),
    };
  }

  const api = { normalizeProductForQuote, normalizeProductRemarks: remarkModule.normalizeProductRemarks };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingProductNormalizer = api;
})(typeof window !== "undefined" ? window : globalThis);
