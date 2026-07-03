const assert = require("node:assert/strict");
const test = require("node:test");

const gateway = require("../public/js/agent/agent-gateway.js");
const logger = require("../public/js/agent/agent-logger.js");

function registryWithTools() {
  const registry = gateway.createAgentToolRegistry();
  gateway.registerAgentTool({ name: "searchProducts", permissionLevel: "L0_READ_ONLY", handler: () => ({ rows: [] }) }, registry);
  gateway.registerAgentTool({ name: "buildQuoteCandidates", permissionLevel: "L1_DRAFT", handler: () => ({ candidates: [] }) }, registry);
  gateway.registerAgentTool({ name: "suggestPriceOverride", permissionLevel: "L2_NEEDS_APPROVAL", handler: () => ({ suggestion: "raise price" }) }, registry);
  gateway.registerAgentTool({ name: "publishQuoteVersion", permissionLevel: "L3_HUMAN_CONFIRMED", handler: () => ({ published: true }) }, registry);
  return registry;
}

test("sales 可以调用 L0/L1", async () => {
  logger.clearAgentLogs();
  const registry = registryWithTools();
  const context = { userId: "U-1", role: "sales", tenantId: "T-1" };
  assert.equal((await gateway.executeAgentTool("searchProducts", {}, context, { registry })).status, "ok");
  assert.equal((await gateway.executeAgentTool("buildQuoteCandidates", {}, context, { registry })).status, "ok");
});

test("sales 不能直接调用 L3，L3 永远 approval_required", async () => {
  const registry = registryWithTools();
  const context = { userId: "U-1", role: "sales", tenantId: "T-1" };
  const result = await gateway.executeAgentTool("publishQuoteVersion", {}, context, { registry });
  assert.equal(result.status, "approval_required");
});

test("boss 可以调用 L0/L1/L2", async () => {
  const registry = registryWithTools();
  const context = { userId: "B-1", role: "boss", tenantId: "T-1" };
  assert.equal((await gateway.executeAgentTool("suggestPriceOverride", {}, context, { registry })).status, "ok");
});

test("未传 tenantId 时拒绝执行", async () => {
  const registry = registryWithTools();
  const result = await gateway.executeAgentTool("searchProducts", {}, { userId: "U-1", role: "sales" }, { registry });
  assert.equal(result.status, "rejected");
  assert.equal(result.error, "tenantId_required");
});

test("未注册工具时报错", async () => {
  const registry = registryWithTools();
  await assert.rejects(
    () => gateway.executeAgentTool("missingTool", {}, { userId: "U-1", role: "sales", tenantId: "T-1" }, { registry }),
    /AGENT_TOOL_NOT_REGISTERED/,
  );
});
