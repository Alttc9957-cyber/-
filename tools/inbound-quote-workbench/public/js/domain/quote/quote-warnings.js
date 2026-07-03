(function initYouyixingQuoteWarnings(globalScope) {
  const WARNING_CODES = {
    NO_PRODUCT_CANDIDATE: "NO_PRODUCT_CANDIDATE",
    MISSING_COST: "MISSING_COST",
    PRICE_EXPIRED: "PRICE_EXPIRED",
    LOW_MARGIN: "LOW_MARGIN",
    SUPPLIER_UNAVAILABLE: "SUPPLIER_UNAVAILABLE",
    REMARK_CONFLICT: "REMARK_CONFLICT",
  };

  function makeWarning(code, message, target = {}, level = "warning", suggestion = "") {
    return {
      code,
      level,
      message,
      targetType: target.targetType || target.type || "",
      targetId: target.targetId || target.id || "",
      suggestion,
    };
  }

  function uniqueWarnings(warnings = []) {
    const seen = new Set();
    return warnings.filter(Boolean).filter((warning) => {
      const key = [warning.code, warning.targetType, warning.targetId, warning.message].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const api = { WARNING_CODES, makeWarning, uniqueWarnings };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteWarnings = api;
})(typeof window !== "undefined" ? window : globalThis);
