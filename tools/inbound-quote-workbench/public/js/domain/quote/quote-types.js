(function initYouyixingQuoteTypes(globalScope) {
  /**
   * @typedef {Object} QuoteRequirementItem
   * @property {string} id
   * @property {string} quoteId
   * @property {number} dayIndex
   * @property {string} city
   * @property {string} date
   * @property {string} serviceType
   * @property {string} serviceSubType
   * @property {number} pax
   * @property {string} language
   * @property {string} vehicleType
   * @property {string} hotelLevel
   * @property {string[]} productHints
   * @property {Object} constraints
   * @property {string} source
   * @property {Object} rawInput
   */

  /**
   * @typedef {Object} QuoteLineCandidate
   * @property {string} id
   * @property {string} requirementItemId
   * @property {string} productId
   * @property {string} supplierId
   * @property {string} supplierServiceId
   * @property {string} title
   * @property {string} serviceType
   * @property {string} city
   * @property {number|string} cost
   * @property {string} currency
   * @property {string} unit
   * @property {string} validityStart
   * @property {string} validityEnd
   * @property {number} matchScore
   * @property {string[]} matchReasons
   * @property {QuoteWarning[]} warnings
   * @property {Object} rawProductSnapshot
   */

  /**
   * @typedef {Object} QuoteLine
   * @property {string} id
   * @property {string} requirementItemId
   * @property {string} selectedCandidateId
   * @property {string} title
   * @property {string} serviceType
   * @property {number|string} cost
   * @property {number|string} salePrice
   * @property {number|string} margin
   * @property {string} currency
   * @property {number} quantity
   * @property {string} customerVisibleNote
   * @property {string} internalNote
   * @property {Object} productSnapshot
   * @property {Object} supplierSnapshot
   * @property {string} createdBy
   * @property {string} confirmedAt
   */

  /**
   * @typedef {Object} QuoteVersion
   * @property {string} id
   * @property {string} quoteId
   * @property {number} versionNo
   * @property {string} status
   * @property {QuoteLine[]} lines
   * @property {Object} totals
   * @property {QuoteWarning[]} warnings
   * @property {string} createdBy
   * @property {string} createdAt
   * @property {string} productCatalogVersion
   */

  /**
   * @typedef {Object} QuoteWarning
   * @property {string} code
   * @property {string} level
   * @property {string} message
   * @property {string} targetType
   * @property {string} targetId
   * @property {string} suggestion
   */

  const SERVICE_TYPE_TO_CATEGORY = {
    vehicle: "用车",
    car: "用车",
    用车: "用车",
    包车: "用车",
    接送机: "用车",
    接送站: "用车",
    hotel: "酒店",
    酒店: "酒店",
    guide: "导游",
    导游: "导游",
    ticket: "景点门票",
    门票: "景点门票",
    景点门票: "景点门票",
    meal: "餐厅",
    餐: "餐厅",
    餐厅: "餐厅",
    experience: "特色体验",
    特色体验: "特色体验",
    traffic: "大交通",
    大交通: "大交通",
    other: "其他",
    其他: "其他",
  };

  const QUOTE_VERSION_STATUSES = ["draft", "submitted", "approved", "sent", "accepted", "archived"];

  const api = { SERVICE_TYPE_TO_CATEGORY, QUOTE_VERSION_STATUSES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteTypes = api;
})(typeof window !== "undefined" ? window : globalThis);
