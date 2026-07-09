(function initYouyixingQuoteRequirementNormalizer(globalScope) {
  function normalizeText(value) {
    return String(value || "").trim();
  }

  function normalizeServiceType(value) {
    const text = normalizeText(value);
    if (/接送机|接机|送机|机场|airport/i.test(text)) return "接送机";
    if (/接送站|接站|送站|高铁|火车站|station|train/i.test(text)) return "接送站";
    if (/包车|用车|市内|市区|本地游|一日游|8小时|9小时|武隆/.test(text)) return "包车";
    if (/酒店|住宿/.test(text)) return "酒店";
    if (/导游|语种/.test(text)) return "导游";
    if (/门票|景点|票/.test(text)) return "景点门票";
    if (/餐|饭店|餐厅/.test(text)) return "餐厅";
    if (/体验/.test(text)) return "特色体验";
    return text || "其他";
  }

  function normalizeVehicleType(value) {
    const text = normalizeText(value).replace(/车/g, "");
    if (/14|15|16|17/.test(text)) return "14座~17座";
    if (/36|37|38/.test(text)) return "36~38座";
    if (/51|55|大巴/.test(text)) return "51~55座";
    if (/22/.test(text)) return "22座";
    if (/9/.test(text)) return "9座";
    if (/7|8/.test(text)) return "7座";
    if (/5/.test(text)) return "5座";
    return text;
  }

  function normalizeLanguage(value) {
    const text = normalizeText(value);
    if (!text) return "";
    if (/英|english/i.test(text)) return "英语";
    if (/西|spanish|español/i.test(text)) return "西语";
    if (/法|french/i.test(text)) return "法语";
    if (/德|german/i.test(text)) return "德语";
    if (/意|italian/i.test(text)) return "意语";
    if (/日|japanese/i.test(text)) return "日语";
    if (/韩|korean/i.test(text)) return "韩语";
    return text;
  }

  function normalizeQuoteRequirementItem(input = {}, context = {}) {
    const productHints = input.productHints || input.hints || [];
    return {
      id: input.id || `REQ-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      quoteId: input.quoteId || context.quoteId || "",
      dayIndex: Number.isFinite(Number(input.dayIndex)) ? Number(input.dayIndex) : 0,
      city: normalizeText(input.city || context.city),
      date: normalizeText(input.date || context.date),
      serviceType: normalizeServiceType(input.serviceType || input.category || input.type),
      serviceSubType: normalizeServiceType(input.serviceSubType || input.serviceCategory || input.route || input.serviceType),
      pax: Number(input.pax || input.people || context.pax || context.people || 0),
      language: normalizeLanguage(input.language || input.guideLang || context.language),
      vehicleType: normalizeVehicleType(input.vehicleType || input.vehicleModel || input.model),
      hotelLevel: normalizeText(input.hotelLevel || input.star || input.hotelStar),
      productHints: Array.isArray(productHints) ? productHints.filter(Boolean).map(String) : String(productHints || "").split(/[、,，/]/).filter(Boolean),
      constraints: input.constraints || {},
      source: input.source || context.source || "legacy-workbench",
      rawInput: input.rawInput || input,
    };
  }

  const api = { normalizeQuoteRequirementItem, normalizeServiceType, normalizeVehicleType, normalizeLanguage };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteRequirementNormalizer = api;
})(typeof window !== "undefined" ? window : globalThis);
