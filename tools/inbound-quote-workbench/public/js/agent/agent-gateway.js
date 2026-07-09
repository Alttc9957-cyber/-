(function initYouyixingAgentGateway(globalScope) {
  const registryModule = typeof require === "function"
    ? require("./agent-tool-registry.js")
    : globalScope.YouyixingAgentToolRegistry;
  const permissions = typeof require === "function"
    ? require("./agent-permissions.js")
    : globalScope.YouyixingAgentPermissions;
  const logger = typeof require === "function"
    ? require("./agent-logger.js")
    : globalScope.YouyixingAgentLogger;

  const { registerAgentTool, getAgentTool, createAgentToolRegistry, defaultRegistry } = registryModule;
  const { canExecuteAgentTool, validateAgentContext } = permissions;
  const { writeAgentLog } = logger;

  async function executeAgentTool(toolName, input = {}, context = {}, options = {}) {
    const registry = options.registry || defaultRegistry;
    const runId = context.runId || options.runId || `RUN-${Date.now()}`;
    const tool = getAgentTool(toolName, registry);
    if (!tool) {
      writeAgentLog({ runId, toolName, input, status: "error", userId: context.userId, role: context.role, tenantId: context.tenantId, error: "tool_not_registered" });
      throw new Error(`AGENT_TOOL_NOT_REGISTERED:${toolName}`);
    }
    const contextCheck = validateAgentContext(context);
    if (!contextCheck.ok) {
      const output = { status: "rejected", error: contextCheck.error };
      writeAgentLog({ runId, toolName, permissionLevel: tool.permissionLevel, input, output, status: "rejected", userId: context.userId, role: context.role, tenantId: context.tenantId, error: contextCheck.error });
      return output;
    }
    if (tool.permissionLevel === "L3_HUMAN_CONFIRMED") {
      const output = { status: "approval_required", toolName, permissionLevel: tool.permissionLevel };
      writeAgentLog({ runId, toolName, permissionLevel: tool.permissionLevel, input, output, status: "approval_required", userId: context.userId, role: context.role, tenantId: context.tenantId });
      return output;
    }
    if (!canExecuteAgentTool(context.role, tool.permissionLevel)) {
      const output = { status: "rejected", error: "permission_denied", permissionLevel: tool.permissionLevel };
      writeAgentLog({ runId, toolName, permissionLevel: tool.permissionLevel, input, output, status: "rejected", userId: context.userId, role: context.role, tenantId: context.tenantId, error: "permission_denied" });
      return output;
    }
    try {
      const data = await tool.handler(input, context);
      const output = data && data.status ? data : { status: "ok", data };
      writeAgentLog({ runId, toolName, permissionLevel: tool.permissionLevel, input, output, status: output.status, userId: context.userId, role: context.role, tenantId: context.tenantId });
      return output;
    } catch (error) {
      const output = { status: "error", error: error.message || "tool_error" };
      writeAgentLog({ runId, toolName, permissionLevel: tool.permissionLevel, input, output, status: "error", userId: context.userId, role: context.role, tenantId: context.tenantId, error: output.error });
      return output;
    }
  }

  const api = { registerAgentTool, executeAgentTool, createAgentToolRegistry };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingAgentGateway = api;
})(typeof window !== "undefined" ? window : globalThis);
