const assert = require("node:assert/strict");
const test = require("node:test");

const { createDomainEvent } = require("../public/js/domain/events/domain-events.js");

test("domain event 必须包含 tenantId、actorId、createdAt", () => {
  const event = createDomainEvent("quote.version_created", { quoteId: "Q-1" }, {
    tenantId: "T-1",
    actorId: "U-1",
    actorRole: "sales",
  });
  assert.equal(event.tenantId, "T-1");
  assert.equal(event.actorId, "U-1");
  assert.equal(event.type, "quote.version_created");
  assert.ok(event.createdAt);
});

test("缺 tenantId 或 actorId 会拒绝创建事件", () => {
  assert.throws(() => createDomainEvent("quote.version_created", {}, { actorId: "U-1" }), /tenantId_required/);
  assert.throws(() => createDomainEvent("quote.version_created", {}, { tenantId: "T-1" }), /actorId_required/);
});
