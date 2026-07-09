(function initYouyixingDomainEvents(globalScope) {
  const DOMAIN_EVENT_TYPES = [
    "quote.requirement_created",
    "quote.candidates_built",
    "quote.line_confirmed",
    "quote.version_created",
    "quote.submitted",
    "quote.low_margin_detected",
    "quote.missing_cost_detected",
    "quote.price_expired_detected",
    "order.converted",
    "op.task.created",
    "finance.receivable_due",
    "finance.payment_received",
    "supplier.price_expiring",
    "agent.tool_called",
    "agent.action_needs_approval",
  ];

  function createDomainEvent(type, payload = {}, context = {}) {
    if (!DOMAIN_EVENT_TYPES.includes(type)) throw new Error(`UNKNOWN_DOMAIN_EVENT:${type}`);
    if (!context.tenantId) throw new Error("tenantId_required");
    if (!context.actorId) throw new Error("actorId_required");
    return {
      id: context.id || `EVT-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      payload,
      tenantId: context.tenantId,
      actorId: context.actorId,
      actorRole: context.actorRole || context.role || "",
      createdAt: context.createdAt || new Date().toISOString(),
      source: context.source || "youyixing-workbench",
    };
  }

  const api = { DOMAIN_EVENT_TYPES, createDomainEvent };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingDomainEvents = api;
})(typeof window !== "undefined" ? window : globalThis);
