(function initYouyixingAgentPermissions(globalScope) {
  const PERMISSION_LEVELS = {
    L0_READ_ONLY: 0,
    L1_DRAFT: 1,
    L2_NEEDS_APPROVAL: 2,
    L3_HUMAN_CONFIRMED: 3,
  };

  const TOOL_LEVELS = {
    searchProducts: "L0_READ_ONLY",
    getProductDetail: "L0_READ_ONLY",
    searchSuppliers: "L0_READ_ONLY",
    getQuoteDraft: "L0_READ_ONLY",
    getOrderStatus: "L0_READ_ONLY",
    createQuoteRequirementDraft: "L1_DRAFT",
    buildQuoteCandidates: "L1_DRAFT",
    draftItinerary: "L1_DRAFT",
    draftCustomerMessage: "L1_DRAFT",
    suggestQuoteLineSelection: "L2_NEEDS_APPROVAL",
    suggestPriceOverride: "L2_NEEDS_APPROVAL",
    suggestOrderConversion: "L2_NEEDS_APPROVAL",
    suggestFinanceWarning: "L2_NEEDS_APPROVAL",
    publishQuoteVersion: "L3_HUMAN_CONFIRMED",
    convertQuoteToOrder: "L3_HUMAN_CONFIRMED",
    createReceivable: "L3_HUMAN_CONFIRMED",
    createPayable: "L3_HUMAN_CONFIRMED",
  };

  const ROLE_MAX_LEVEL = {
    sales: "L1_DRAFT",
    op: "L2_NEEDS_APPROVAL",
    product: "L2_NEEDS_APPROVAL",
    finance: "L2_NEEDS_APPROVAL",
    boss: "L2_NEEDS_APPROVAL",
    owner: "L2_NEEDS_APPROVAL",
    admin: "L2_NEEDS_APPROVAL",
  };

  function levelValue(level) {
    if (typeof level === "number") return level;
    return PERMISSION_LEVELS[level] ?? -1;
  }

  function normalizePermissionLevel(level) {
    if (typeof level === "string" && level in PERMISSION_LEVELS) return level;
    const found = Object.entries(PERMISSION_LEVELS).find(([, value]) => value === level);
    return found ? found[0] : "L0_READ_ONLY";
  }

  function maxLevelForRole(role = "sales") {
    return ROLE_MAX_LEVEL[role] || "L0_READ_ONLY";
  }

  function canExecuteAgentTool(role, permissionLevel) {
    const normalized = normalizePermissionLevel(permissionLevel);
    if (normalized === "L3_HUMAN_CONFIRMED") return false;
    return levelValue(maxLevelForRole(role)) >= levelValue(normalized);
  }

  function validateAgentContext(context = {}) {
    if (!context.userId) return { ok: false, error: "userId_required" };
    if (!context.role) return { ok: false, error: "role_required" };
    if (!context.tenantId) return { ok: false, error: "tenantId_required" };
    return { ok: true, error: "" };
  }

  const api = { PERMISSION_LEVELS, TOOL_LEVELS, ROLE_MAX_LEVEL, normalizePermissionLevel, maxLevelForRole, canExecuteAgentTool, validateAgentContext };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingAgentPermissions = api;
})(typeof window !== "undefined" ? window : globalThis);
