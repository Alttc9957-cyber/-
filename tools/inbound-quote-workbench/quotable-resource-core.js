(function initYouyixingQuotableCore(globalScope) {
  const SUPPLIER_CATEGORIES = ["酒店", "包车", "导游", "门票", "大交通", "餐", "特色体验", "其他"];
  const CATEGORY_TO_TYPE = {
    酒店: "hotel",
    包车: "vehicle",
    用车: "vehicle",
    导游: "guide",
    门票: "ticket",
    景点门票: "ticket",
    大交通: "traffic",
    餐: "meal",
    餐厅: "meal",
    特色体验: "experience",
    其他: "other",
  };
  const TYPE_TO_CATEGORY = {
    hotel: "酒店",
    vehicle: "包车",
    guide: "导游",
    ticket: "门票",
    traffic: "大交通",
    meal: "餐",
    experience: "特色体验",
    other: "其他",
  };
  const COST_ROLES = new Set(["admin", "op", "finance", "owner"]);

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[（）()【】\[\]{}]/g, "");
  }

  function firstPresent(...values) {
    return values.find((value) => value !== "" && value !== undefined && value !== null) ?? "";
  }

  function priceNumber(value) {
    if (value === "" || value === undefined || value === null) return "";
    if (typeof value === "number") return Number.isFinite(value) ? value : "";
    const text = String(value).trim().replace(/[¥￥,\s]/g, "");
    if (!text || /^[-—]+$/.test(text) || /待补|暂无|无|空|null|undefined/i.test(text)) return "";
    const match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) return "";
    const number = Number(match[0]);
    return Number.isFinite(number) ? number : "";
  }

  function normalizeCategory(value) {
    const text = String(value || "");
    if (/车|用车|司机/.test(text)) return "包车";
    if (/景点|门票|票务/.test(text)) return "门票";
    if (/导游/.test(text)) return "导游";
    if (/酒店|住宿|房/.test(text)) return "酒店";
    if (/大交通|机票|火车|高铁|航班/.test(text)) return "大交通";
    if (/餐|饭店|餐厅/.test(text)) return "餐";
    if (/体验|非遗|旅拍|活动/.test(text)) return "特色体验";
    return SUPPLIER_CATEGORIES.includes(text) ? text : "其他";
  }

  function normalizeSupplierStatus(value) {
    const text = String(value || "");
    if (/停|暂停|黑名单|禁用|disable/i.test(text)) return "停用";
    if (/待|缺|补/.test(text)) return "待补资料";
    return "启用";
  }

  function normalizeVehicleType(value, fallback = "包车") {
    const text = String(value || "");
    if (/接送机|接机|送机|机场|大兴|首都|airport/i.test(text)) return "接送机";
    if (/接送站|接站|送站|火车站|高铁|station|train/i.test(text)) return "接送站";
    if (/包车|市区|市内|本地|一日游|8小时|9小时|武隆|全天|半天/.test(text)) return "包车";
    return text || fallback;
  }

  function normalizeVehicleModel(value) {
    const text = String(value || "");
    if (/51|55|大巴/.test(text)) return "51~55座";
    if (/36|37|38/.test(text)) return "36~38座";
    if (/22/.test(text)) return "22座";
    if (/14|15|16|17/.test(text)) return "14座~17座";
    if (/9/.test(text)) return "9座";
    if (/7|8/.test(text)) return "7座";
    if (/5/.test(text)) return "5座";
    return text;
  }

  function normalizeLanguage(value) {
    const text = String(value || "").trim();
    if (!text) return "英语";
    if (/英|english/i.test(text)) return "英语";
    if (/西|spanish|español/i.test(text)) return "西语";
    if (/法|french/i.test(text)) return "法语";
    if (/德|german/i.test(text)) return "德语";
    if (/意|italian/i.test(text)) return "意语";
    if (/日|japanese/i.test(text)) return "日语";
    if (/韩|korean/i.test(text)) return "韩语";
    return text;
  }

  function normalizeContacts(contacts = []) {
    const list = (Array.isArray(contacts) ? contacts : []).map((contact, index) => ({
      name: contact.name || contact.contactName || contact.contact || "",
      role: contact.role || contact.contactRole || "销售",
      phone: contact.phone || contact.mobile || contact.contactPhone || "",
      wechat: contact.wechat || contact.wx || "",
      whatsapp: contact.whatsapp || "",
      email: contact.email || "",
      primary: Boolean(contact.primary || contact.isPrimary || index === 0),
      note: contact.note || contact.remark || "",
    }));
    if (!list.length) list.push({ name: "", role: "销售", phone: "", wechat: "", whatsapp: "", email: "", primary: true, note: "" });
    const primaryIndex = Math.max(0, list.findIndex((contact) => contact.primary));
    return list.map((contact, index) => ({ ...contact, primary: index === primaryIndex }));
  }

  function normalizeServiceDetail(detail = {}, category = "其他") {
    const normalizedCategory = normalizeCategory(category);
    const costPrice = priceNumber(firstPresent(
      detail.costPrice,
      detail.packageCostPrice,
      detail.dailyCostPrice,
      detail.roomCostPrice,
      detail.adultCost,
      detail.perPersonCost,
      detail.cost,
    ));
    const referencePrice = priceNumber(firstPresent(
      detail.referencePrice,
      detail.salePrice,
      detail.referenceSalePrice,
      detail.packageSalePrice,
      detail.adultSale,
      detail.perPersonSale,
    ));
    const base = {
      ...detail,
      category: normalizedCategory,
      serviceDetailType: normalizedCategory,
      costPrice,
      referencePrice,
      salePrice: referencePrice,
      priceValidFrom: detail.priceValidFrom || detail.validFrom || "",
      priceValidUntil: detail.priceValidUntil || detail.validTo || detail.priceValidTo || "",
      validFrom: detail.validFrom || detail.priceValidFrom || "",
      validTo: detail.validTo || detail.priceValidUntil || detail.priceValidTo || "",
    };
    if (normalizedCategory === "包车") {
      base.serviceCategory = normalizeVehicleType(detail.serviceCategory || detail.routeName || detail.name);
      base.vehicleModel = normalizeVehicleModel(detail.vehicleModel || detail.model || "");
      base.packageCostPrice = priceNumber(firstPresent(detail.packageCostPrice, costPrice));
      base.packageSalePrice = priceNumber(firstPresent(detail.packageSalePrice, referencePrice));
      base.costPrice = priceNumber(firstPresent(base.packageCostPrice, costPrice));
      base.referencePrice = priceNumber(firstPresent(base.packageSalePrice, referencePrice));
      base.salePrice = base.referencePrice;
      delete base.crossCityAllowed;
      delete base.canCrossCity;
    }
    if (normalizedCategory === "导游") {
      base.languages = normalizeLanguage(detail.languages || detail.language);
      base.dailyCostPrice = priceNumber(firstPresent(detail.dailyCostPrice, costPrice));
      base.costPrice = priceNumber(firstPresent(base.dailyCostPrice, costPrice));
      base.originalRegistrationFields = detail.originalRegistrationFields || detail.rawFields || detail.raw || {};
    }
    return base;
  }

  function serviceDetailTitle(detail = {}, category = "其他") {
    if (category === "酒店") return detail.roomTypeName || detail.roomType || detail.name || "房型价格";
    if (category === "包车") return detail.routeName || detail.name || [detail.serviceCategory, detail.vehicleModel].filter(Boolean).join(" ") || "包车服务";
    if (category === "导游") return detail.guideName || detail.name || `${normalizeLanguage(detail.languages || detail.language)}导游服务`;
    if (category === "门票") return detail.attractionName || detail.scenicName || detail.name || detail.ticketTypeName || "门票";
    if (category === "大交通") return detail.trafficType || detail.name || "大交通票务服务";
    if (category === "餐") return detail.restaurantName || detail.restaurant || detail.mealStandardName || detail.name || "餐标";
    if (category === "特色体验") return detail.experienceName || detail.name || "体验项目";
    return detail.name || detail.projectName || "其他服务";
  }

  function isoDateOnly(value) {
    if (!value) return "";
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  }

  function daysBetween(from, to) {
    const start = Date.parse(`${isoDateOnly(from) || "1970-01-01"}T00:00:00Z`);
    const end = Date.parse(`${isoDateOnly(to) || "1970-01-01"}T00:00:00Z`);
    return Math.round((end - start) / 86400000);
  }

  function priceStatus(validFrom, validUntil, today = new Date().toISOString().slice(0, 10)) {
    const from = isoDateOnly(validFrom);
    const until = isoDateOnly(validUntil);
    const current = isoDateOnly(today);
    if (!from && !until) return "no_validity";
    if (until && daysBetween(current, until) < 0) return "expired";
    if (until && daysBetween(current, until) <= 30) return "expiring_soon";
    return "valid";
  }

  function contactSummary(contacts = []) {
    const primary = normalizeContacts(contacts).find((contact) => contact.primary) || {};
    const channel = firstPresent(primary.phone, primary.wechat, primary.whatsapp, primary.email);
    return [primary.name || "待补联系人", primary.role || "", channel || "待补联系方式"].filter(Boolean).join(" / ");
  }

  function serviceCity(detail = {}, supplier = {}) {
    return firstPresent(detail.city, detail.fromCity, detail.serviceCities, supplier.city, Array.isArray(supplier.cities) ? supplier.cities[0] : "");
  }

  function serviceArea(detail = {}, supplier = {}) {
    return firstPresent(detail.areaOrScope, detail.toArea, detail.routeName, detail.agentScope, detail.scope, supplier.serviceScope);
  }

  function resourceMatchFields(detail = {}, supplier = {}, category = "其他") {
    const title = serviceDetailTitle(detail, category);
    const fields = {
      category,
      city: serviceCity(detail, supplier),
      keyword: title,
      routeName: detail.routeName || "",
      serviceCategory: detail.serviceCategory || "",
      vehicleModel: detail.vehicleModel || detail.model || "",
      language: detail.languages || detail.language || "",
      roomType: detail.roomTypeName || detail.roomType || "",
      star: detail.star || detail.hotelLevel || "",
      ticketType: detail.ticketTypeName || detail.ticketType || detail.audience || "",
      attractionName: detail.attractionName || detail.scenicName || "",
      minPax: detail.minPax || detail.suggestedPassengers || "",
      maxPax: detail.maxPax || "",
    };
    fields.keywords = Object.values(fields).filter(Boolean).join(" ");
    return fields;
  }

  function supplierServiceDetailToQuotableResource(supplier = {}, detail = {}, options = {}) {
    const category = normalizeCategory(detail.category || supplier.category);
    const supplierStatus = normalizeSupplierStatus(supplier.status);
    if (supplierStatus !== "启用") return null;
    const normalizedDetail = normalizeServiceDetail(detail, category);
    const id = normalizedDetail.id || normalizedDetail.serviceDetailId || `SD-${supplier.id || "SUP"}-${normalizeText(serviceDetailTitle(normalizedDetail, category))}`;
    const validFrom = normalizedDetail.priceValidFrom || normalizedDetail.validFrom || "";
    const validUntil = normalizedDetail.priceValidUntil || normalizedDetail.validTo || "";
    const status = priceStatus(validFrom, validUntil, options.today);
    const cost = priceNumber(firstPresent(normalizedDetail.costPrice, normalizedDetail.packageCostPrice, normalizedDetail.dailyCostPrice));
    const reference = priceNumber(firstPresent(normalizedDetail.referencePrice, normalizedDetail.salePrice, normalizedDetail.packageSalePrice));
    const matchFields = resourceMatchFields(normalizedDetail, supplier, category);
    const title = serviceDetailTitle(normalizedDetail, category);
    const riskFlags = [
      cost === "" && "missing_cost",
      status === "expired" && "price_expired",
      status === "expiring_soon" && "price_expiring_soon",
      status === "no_validity" && "no_price_validity",
      !contactSummary(supplier.contacts || []).includes("/") && "missing_contact",
    ].filter(Boolean);
    return {
      id: `QR-${CATEGORY_TO_TYPE[category] || "other"}-${supplier.id || "SUP"}-${id}`,
      category,
      type: CATEGORY_TO_TYPE[category] || "other",
      supplierId: supplier.id || supplier.supplierId || "",
      supplierName: supplier.name || supplier.supplierName || "待绑定供应商",
      supplierStatus,
      serviceDetailType: category,
      serviceDetailId: id,
      title,
      name: title,
      city: matchFields.city || "",
      areaOrScope: serviceArea(normalizedDetail, supplier),
      matchFields,
      costPrice: cost,
      referencePrice: reference,
      cost,
      salePrice: reference,
      cancellationRule: normalizedDetail.cancelRule || supplier.cancelRule || supplier.cancelPolicy || "",
      priceValidFrom: validFrom,
      priceValidUntil: validUntil,
      validFrom,
      validTo: validUntil,
      priceStatus: status,
      contactSummary: contactSummary(supplier.contacts || []),
      tags: compactUnique([category, normalizedDetail.serviceCategory, normalizedDetail.routeName, normalizedDetail.vehicleModel, normalizedDetail.languages, normalizedDetail.ticketTypeName, supplier.ratingTags, supplier.tags]),
      rating: supplier.rating || supplier.ratingTags || "",
      riskFlags,
      updatedAt: supplier.updatedAt || normalizedDetail.updatedAt || "",
      sourceType: "供应商服务明细",
      sourceResourceId: id,
      sourceProductId: "",
      costSource: "供应商服务明细",
      rawSupplier: supplier,
      rawDetail: normalizedDetail,
      raw: normalizedDetail,
      serviceCategory: normalizedDetail.serviceCategory || "",
      routeName: normalizedDetail.routeName || "",
      route: normalizedDetail.routeName || title,
      vehicleModel: normalizedDetail.vehicleModel || "",
      model: normalizeVehicleModel(normalizedDetail.vehicleModel || normalizedDetail.model || ""),
      language: normalizeLanguage(normalizedDetail.languages || normalizedDetail.language || ""),
      roomType: normalizedDetail.roomTypeName || normalizedDetail.roomType || "",
      star: normalizedDetail.star || normalizedDetail.hotelLevel || "",
      ticketType: normalizedDetail.ticketTypeName || normalizedDetail.ticketType || normalizedDetail.audience || "",
      unit: unitForCategory(category, normalizedDetail),
      status: cost === "" ? "待补成本" : "可用",
    };
  }

  function unitForCategory(category, detail = {}) {
    if (category === "酒店") return "间夜";
    if (category === "包车") return normalizeVehicleType(detail.serviceCategory || detail.routeName).includes("接送") ? "次" : "天";
    if (category === "导游") return "天";
    if (["门票", "餐", "特色体验"].includes(category)) return "人";
    return detail.billingMethod || "次";
  }

  function compactUnique(items = []) {
    const seen = new Set();
    return items.flatMap((item) => Array.isArray(item) ? item : String(item || "").split(/[、,，\s]+/))
      .map((item) => String(item || "").trim())
      .filter((item) => item && !seen.has(item) && seen.add(item));
  }

  function buildQuotableResources({ suppliers = [], productResources = [], resourceSupplierLinks = [], today } = {}) {
    const linkMap = new Map();
    resourceSupplierLinks.forEach((link) => {
      if (!link?.supplierId || !link?.serviceDetailId) return;
      const key = `${link.supplierId}::${link.serviceDetailId}`;
      if (!linkMap.has(key)) linkMap.set(key, []);
      linkMap.get(key).push(link);
    });
    const productMap = new Map(productResources.map((resource) => [resource.id, resource]));
    const resources = [];
    suppliers.forEach((supplier) => {
      if (normalizeSupplierStatus(supplier.status) !== "启用") return;
      (supplier.serviceDetails || []).forEach((detail) => {
        const resource = supplierServiceDetailToQuotableResource(supplier, detail, { today });
        if (!resource) return;
        const links = linkMap.get(`${resource.supplierId}::${resource.serviceDetailId}`) || [];
        resource.resourceSupplierLinks = links;
        resource.productResourceIds = links.map((link) => link.productResourceId).filter(Boolean);
        resource.productResources = resource.productResourceIds.map((id) => productMap.get(id)).filter(Boolean);
        resource.sourceProductId = resource.productResourceIds[0] || "";
        resources.push(resource);
      });
    });
    return resources;
  }

  function queryQuotableResources(params = {}, resources = []) {
    const category = params.category ? normalizeCategory(params.category) : "";
    const city = normalizeText(params.city);
    const keyword = normalizeText(params.keyword);
    const productResourceId = params.productResourceId || "";
    const requirementItemId = params.requirementItemId || "";
    const supplierStatus = params.supplierStatus || "启用";
    const priceStatusFilter = params.priceStatus || "";
    return resources.filter((resource) => {
      if (category && resource.category !== category) return false;
      if (supplierStatus && resource.supplierStatus !== supplierStatus) return false;
      if (priceStatusFilter && resource.priceStatus !== priceStatusFilter) return false;
      if (productResourceId && !(resource.productResourceIds || []).includes(productResourceId)) return false;
      if (requirementItemId && !(resource.productResources || []).some((item) => item.requirementItemId === requirementItemId)) return false;
      if (city && normalizeText(resource.city) !== city && normalizeText(resource.areaOrScope) !== city) return false;
      if (params.language && normalizeLanguage(resource.language || resource.matchFields?.language) !== normalizeLanguage(params.language)) return false;
      if (params.serviceCategory && normalizeVehicleType(resource.serviceCategory || resource.matchFields?.serviceCategory) !== normalizeVehicleType(params.serviceCategory)) return false;
      if (params.routeName && !normalizeText([resource.routeName, resource.route, resource.name, resource.matchFields?.keywords].join(" ")).includes(normalizeText(params.routeName))) return false;
      if (params.minPax && Number(resource.matchFields?.maxPax || 9999) < Number(params.minPax)) return false;
      if (keyword && !normalizeText([resource.title, resource.supplierName, resource.city, resource.areaOrScope, resource.matchFields?.keywords, resource.tags?.join(" ")].join(" ")).includes(keyword)) return false;
      return true;
    }).map((resource) => ({ ...resource, matchScore: scoreQuotableResource(resource, params) }))
      .sort(compareResourceScore);
  }

  function scoreQuotableResource(resource = {}, request = {}) {
    let score = 0;
    const category = request.category ? normalizeCategory(request.category) : "";
    if (category && resource.category === category) score += 40;
    if (request.city && normalizeText(resource.city) === normalizeText(request.city)) score += 20;
    if (request.language && normalizeLanguage(resource.language || resource.matchFields?.language) === normalizeLanguage(request.language)) score += 18;
    if (request.serviceCategory && normalizeVehicleType(resource.serviceCategory || resource.matchFields?.serviceCategory) === normalizeVehicleType(request.serviceCategory)) score += 18;
    if (request.vehicleModel && normalizeVehicleModel(resource.vehicleModel || resource.model || resource.matchFields?.vehicleModel) === normalizeVehicleModel(request.vehicleModel)) score += 18;
    if (request.routeName && normalizeText([resource.routeName, resource.route, resource.title].join(" ")).includes(normalizeText(request.routeName))) score += 12;
    if (request.roomType && normalizeText(resource.roomType || resource.matchFields?.roomType).includes(normalizeText(request.roomType))) score += 12;
    if (request.ticketType && normalizeText(resource.ticketType || resource.matchFields?.ticketType).includes(normalizeText(request.ticketType))) score += 12;
    if (request.keyword && normalizeText([resource.title, resource.matchFields?.keywords].join(" ")).includes(normalizeText(request.keyword))) score += 8;
    if (resource.costPrice !== "") score += 5;
    if (resource.priceStatus === "valid") score += 4;
    if (resource.priceStatus === "expiring_soon") score += 2;
    if (resource.priceStatus === "expired") score -= 20;
    return score;
  }

  function compareResourceScore(a, b) {
    if ((b.matchScore || 0) !== (a.matchScore || 0)) return (b.matchScore || 0) - (a.matchScore || 0);
    if ((a.priceStatus === "expired") !== (b.priceStatus === "expired")) return a.priceStatus === "expired" ? 1 : -1;
    if ((a.costPrice !== "") !== (b.costPrice !== "")) return a.costPrice !== "" ? -1 : 1;
    return Number(a.costPrice || Number.POSITIVE_INFINITY) - Number(b.costPrice || Number.POSITIVE_INFINITY);
  }

  function matchQuotableResources(request = {}, resources = []) {
    const candidates = queryQuotableResources(request, resources);
    if (!candidates.length) {
      return { matchStatus: "unmatched", matchReason: "未找到可报价资源", candidates: [], selected: null, score: 0 };
    }
    const selected = candidates[0];
    const tied = candidates.filter((item) => item.matchScore === selected.matchScore).length;
    let matchStatus = "matched";
    let matchReason = "已命中可报价资源";
    if (selected.priceStatus === "expired") {
      matchStatus = "blocked";
      matchReason = "价格已过期";
    } else if (selected.priceStatus === "no_validity") {
      matchStatus = "need_confirm";
      matchReason = "价格无有效期，需人工确认";
    } else if (selected.costPrice === "") {
      matchStatus = "need_price";
      matchReason = "成本价为空";
    } else if (tied > 1) {
      matchStatus = "need_confirm";
      matchReason = `存在 ${tied} 个同分候选，需人工确认`;
    }
    return { matchStatus, matchReason, candidates, selected, score: selected.matchScore || 0 };
  }

  function createQuoteLineSnapshot(resource = {}, context = {}) {
    const selectedAt = context.selectedAt || new Date().toISOString();
    return {
      category: resource.category || "",
      productResourceId: context.productResourceId || resource.sourceProductId || resource.productResourceIds?.[0] || "",
      supplierId: resource.supplierId || "",
      supplierName: resource.supplierName || "待绑定供应商",
      supplierServiceDetailType: resource.serviceDetailType || resource.category || "",
      supplierServiceDetailId: resource.serviceDetailId || "",
      costPriceSnapshot: resource.costPrice,
      referencePriceSnapshot: resource.referencePrice,
      sellPrice: context.sellPrice ?? resource.referencePrice ?? "",
      cancellationRuleSnapshot: resource.cancellationRule || "",
      priceValidUntilSnapshot: resource.priceValidUntil || resource.validTo || "",
      priceStatusSnapshot: resource.priceStatus || "no_validity",
      selectedBy: context.selectedBy || "OP",
      selectedAt,
      sourceType: "供应商服务明细",
      sourceProductId: context.productResourceId || resource.sourceProductId || "",
      sourceResourceId: resource.id || "",
      serviceDetailId: resource.serviceDetailId || "",
      costSource: "供应商服务明细",
      orderServiceTaskId: null,
      orderStatus: null,
      settlementStatus: null,
      paymentStatus: null,
    };
  }

  function canViewCost(role = "viewer", view = "internal") {
    return view !== "customer" && COST_ROLES.has(role);
  }

  function publicQuoteLineSnapshot(snapshot = {}, role = "viewer", view = "customer") {
    const payload = { ...snapshot };
    if (!canViewCost(role, view)) {
      delete payload.costPriceSnapshot;
      delete payload.costSource;
    }
    return payload;
  }

  const api = {
    SUPPLIER_CATEGORIES,
    CATEGORY_TO_TYPE,
    TYPE_TO_CATEGORY,
    normalizeCategory,
    normalizeSupplierStatus,
    normalizeVehicleType,
    normalizeVehicleModel,
    normalizeLanguage,
    normalizeContacts,
    normalizeServiceDetail,
    priceNumber,
    priceStatus,
    supplierServiceDetailToQuotableResource,
    buildQuotableResources,
    queryQuotableResources,
    scoreQuotableResource,
    matchQuotableResources,
    createQuoteLineSnapshot,
    publicQuoteLineSnapshot,
    canViewCost,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.YouyixingQuotableCore = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
