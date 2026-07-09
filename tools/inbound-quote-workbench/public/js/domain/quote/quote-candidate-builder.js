(function initYouyixingQuoteCandidateBuilder(globalScope) {
  const warningsModule = typeof require === "function"
    ? require("./quote-warnings.js")
    : globalScope.YouyixingQuoteWarnings;
  const normalizer = typeof require === "function"
    ? require("./quote-requirement-normalizer.js")
    : globalScope.YouyixingQuoteRequirementNormalizer;
  const typeModule = typeof require === "function"
    ? require("./quote-types.js")
    : globalScope.YouyixingQuoteTypes;

  const { WARNING_CODES, makeWarning, uniqueWarnings } = warningsModule;
  const { normalizeServiceType, normalizeVehicleType, normalizeLanguage } = normalizer;
  const { SERVICE_TYPE_TO_CATEGORY } = typeModule;

  function firstPresent(...values) {
    return values.find((value) => value !== "" && value !== undefined && value !== null) ?? "";
  }

  function priceNumber(value) {
    if (value === "" || value === undefined || value === null) return "";
    if (typeof value === "number") return Number.isFinite(value) ? value : "";
    const text = String(value).trim().replace(/[¥￥,\s]/g, "");
    if (!text || /待补|暂无|null|undefined/i.test(text)) return "";
    const match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) return "";
    const numeric = Number(match[0]);
    return Number.isFinite(numeric) ? numeric : "";
  }

  function normalizeSearch(value) {
    return String(value || "").toLowerCase().replace(/[（）()《》“”"'\s·•]/g, "");
  }

  function productCategory(product = {}) {
    const category = product.category || product.sourceCategory || product.type || "";
    return SERVICE_TYPE_TO_CATEGORY[category] || SERVICE_TYPE_TO_CATEGORY[normalizeServiceType(category)] || category;
  }

  function requirementCategory(requirement = {}) {
    return SERVICE_TYPE_TO_CATEGORY[requirement.serviceType] || SERVICE_TYPE_TO_CATEGORY[normalizeServiceType(requirement.serviceType)] || requirement.serviceType;
  }

  function productTitle(product = {}) {
    return firstPresent(product.name, product.scenicName, product.hotelName, product.restaurant, product.experienceName, product.route, product.title, "未命名产品");
  }

  function productCost(product = {}) {
    return priceNumber(firstPresent(
      product.costPrice,
      product.cost,
      product.adultCost,
      product.lowSeasonCost,
      product.highSeasonCost,
      product.dayCost,
      product.airportTransferCost,
      product.agencyAdult,
      product.minCost,
      product.unitCost,
    ));
  }

  function productSale(product = {}) {
    return priceNumber(firstPresent(product.salePrice, product.referencePrice, product.adultSale, product.suggestedSale, product.minSale));
  }

  function validityEnd(product = {}) {
    return firstPresent(product.validityEnd, product.validTo, product.priceValidUntil, product.valid_until);
  }

  function validityStart(product = {}) {
    return firstPresent(product.validityStart, product.validFrom, product.priceValidFrom, product.valid_from);
  }

  function isExpired(end, date) {
    if (!end || !date) return false;
    const endTime = Date.parse(`${end}T23:59:59`);
    const dateTime = Date.parse(`${date}T00:00:00`);
    return Number.isFinite(endTime) && Number.isFinite(dateTime) && endTime < dateTime;
  }

  function cityMatches(product = {}, city = "") {
    return !city || product.city === city || product.city === "通用";
  }

  function serviceMatches(product = {}, requirement = {}) {
    const reqCategory = requirementCategory(requirement);
    const category = productCategory(product);
    if (reqCategory && category && reqCategory === category) return true;
    const reqType = normalizeServiceType(requirement.serviceType);
    const productType = normalizeServiceType(firstPresent(product.serviceType, product.vehicleType, product.category, product.type));
    return reqType && productType && reqType === productType;
  }

  function softScore(product = {}, requirement = {}) {
    let score = 0;
    const reasons = [];
    if (cityMatches(product, requirement.city)) {
      score += requirement.city ? 25 : 5;
      if (requirement.city) reasons.push(`城市匹配：${requirement.city}`);
    }
    if (serviceMatches(product, requirement)) {
      score += 25;
      reasons.push(`服务类型匹配：${requirement.serviceType}`);
    }
    const reqVehicle = normalizeVehicleType(requirement.vehicleType);
    const productVehicle = normalizeVehicleType(firstPresent(product.model, product.vehicleType, product.vehicleModel));
    if (reqVehicle && productVehicle && reqVehicle === productVehicle) {
      score += 15;
      reasons.push(`车型匹配：${reqVehicle}`);
    }
    const reqLanguage = normalizeLanguage(requirement.language);
    const productLanguage = normalizeLanguage(firstPresent(product.language, product.languages));
    if (reqLanguage && productLanguage && reqLanguage === productLanguage) {
      score += 10;
      reasons.push(`语种匹配：${reqLanguage}`);
    }
    const hotelLevel = normalizeSearch(requirement.hotelLevel);
    const productHotel = normalizeSearch(firstPresent(product.star, product.hotelLevel));
    if (hotelLevel && productHotel && (productHotel.includes(hotelLevel) || hotelLevel.includes(productHotel))) {
      score += 10;
      reasons.push(`酒店等级匹配：${requirement.hotelLevel}`);
    }
    const haystack = normalizeSearch([
      productTitle(product),
      product.route,
      product.ticketType,
      product.roomType,
      product.cuisine,
      product.remark,
    ].filter(Boolean).join(" "));
    (requirement.productHints || []).forEach((hint) => {
      const normalized = normalizeSearch(hint);
      if (normalized && haystack.includes(normalized)) {
        score += 5;
        reasons.push(`关键词命中：${hint}`);
      }
    });
    if (productCost(product) !== "") {
      score += 10;
      reasons.push("成本可用");
    }
    return { score: Math.min(score, 100), reasons };
  }

  function buildQuoteCandidates(requirementItem = {}, products = [], options = {}) {
    const candidates = [];
    const warnings = [];
    const today = options.today || requirementItem.date || new Date().toISOString().slice(0, 10);
    const pool = Array.isArray(products) ? products : [];
    pool.forEach((product, index) => {
      if (!serviceMatches(product, requirementItem)) return;
      if (!cityMatches(product, requirementItem.city)) return;
      const { score, reasons } = softScore(product, requirementItem);
      if (score <= 0) return;
      const cost = productCost(product);
      const candidateWarnings = [];
      const productId = firstPresent(product.id, product.cloudResourceId, product.sourceProductId, `PRODUCT-${index + 1}`);
      if (cost === "") {
        candidateWarnings.push(makeWarning(
          WARNING_CODES.MISSING_COST,
          "候选产品缺成本价",
          { targetType: "product", targetId: productId },
          "warning",
          "补充成本后才能直接生成正式报价行",
        ));
      }
      if (isExpired(validityEnd(product), today)) {
        candidateWarnings.push(makeWarning(
          WARNING_CODES.PRICE_EXPIRED,
          "候选产品价格已过期",
          { targetType: "product", targetId: productId },
          "critical",
          "请更新价格有效期或人工确认",
        ));
      }
      warnings.push(...candidateWarnings);
      candidates.push({
        id: `CAND-${requirementItem.id || "REQ"}-${index + 1}`,
        requirementItemId: requirementItem.id || "",
        productId,
        supplierId: firstPresent(product.supplierId, product.supplier_id),
        supplierServiceId: firstPresent(product.supplierServiceId, product.serviceDetailId, product.supplier_service_id),
        title: productTitle(product),
        serviceType: requirementItem.serviceType || product.category || product.serviceType || "",
        city: product.city || "",
        cost,
        salePrice: productSale(product),
        currency: product.currency || options.currency || "CNY",
        unit: product.pricingUnit || product.unit || "次",
        validityStart: validityStart(product),
        validityEnd: validityEnd(product),
        matchScore: Math.max(0, Math.min(score - (candidateWarnings.some((item) => item.code === WARNING_CODES.PRICE_EXPIRED) ? 15 : 0), 100)),
        matchReasons: reasons,
        warnings: candidateWarnings,
        rawProductSnapshot: JSON.parse(JSON.stringify(product)),
      });
    });
    candidates.sort((a, b) => b.matchScore - a.matchScore);
    if (!candidates.length) {
      warnings.push(makeWarning(
        WARNING_CODES.NO_PRODUCT_CANDIDATE,
        "没有找到可用产品候选",
        { targetType: "requirement", targetId: requirementItem.id || "" },
        "warning",
        "检查城市、服务类型和产品库发布状态",
      ));
    }
    return { candidates, warnings: uniqueWarnings(warnings) };
  }

  const api = { buildQuoteCandidates, priceNumber, productCost, productSale };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteCandidateBuilder = api;
})(typeof window !== "undefined" ? window : globalThis);
