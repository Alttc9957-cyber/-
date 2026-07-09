(function initYouyixingCustomerPreferences(globalScope) {
  const explicitMealPattern = /清真|halal|muslim|穆斯林|素食|vegetarian|vegan|不吃猪|no\s+pork|pork[-\s]?free|餐食|饮食|meal\s+preference|dietary/i;
  const halalPattern = /清真|halal|muslim|穆斯林|不吃猪|no\s+pork|pork[-\s]?free/i;
  const vegetarianPattern = /素食|vegetarian|vegan/i;
  const transferIncludePattern = /接送机|接机|送机|机场接送|arrival\s+transfer|departure\s+transfer|airport\s+transfer/i;
  const transferExcludePattern = /不含接送|不需要接送|无需接送|no\s+transfer|without\s+transfer|exclude\s+transfer/i;

  function asNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function hasExplicitMealPreference(text = "") {
    return explicitMealPattern.test(String(text || ""));
  }

  function mealPreferenceFromText(text = "") {
    const value = String(text || "");
    if (!hasExplicitMealPreference(value)) return "";
    if (halalPattern.test(value)) return "清真餐";
    if (vegetarianPattern.test(value)) return "素食";
    return "";
  }

  function normalizeMealPreference(value = "", rawText = "") {
    const preference = String(value || "").trim();
    if (!preference) return "";
    const source = String(rawText || "");
    if (/清真|halal|muslim|穆斯林/i.test(preference) && !halalPattern.test(source)) return "";
    if (/素食|vegetarian|vegan/i.test(preference) && !vegetarianPattern.test(source)) return "";
    if (!hasExplicitMealPreference(source) && /清真|halal|muslim|穆斯林|素食|vegetarian|vegan|不吃猪/i.test(preference)) return "";
    return preference;
  }

  function shouldDefaultTransferIncluded(input = {}) {
    const text = String(input.rawText || "");
    if (transferExcludePattern.test(text)) return false;
    if (transferIncludePattern.test(text)) return true;
    if (input.services?.transfer === true) return true;
    const serviceDays = asNumber(input.serviceDays);
    const cityCount = Array.isArray(input.cities) ? input.cities.filter(Boolean).length : 0;
    return serviceDays >= 7 || (serviceDays >= 3 && cityCount >= 2);
  }

  function normalizeTransferNeed(value = "", input = {}) {
    const explicit = String(value || "").trim();
    if (explicit) return explicit;
    return shouldDefaultTransferIncluded(input) ? "接送机" : "";
  }

  const api = {
    hasExplicitMealPreference,
    mealPreferenceFromText,
    normalizeMealPreference,
    shouldDefaultTransferIncluded,
    normalizeTransferNeed,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingCustomerPreferences = api;
})(typeof window !== "undefined" ? window : globalThis);
