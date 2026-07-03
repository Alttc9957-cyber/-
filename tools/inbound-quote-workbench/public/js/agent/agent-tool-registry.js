(function initYouyixingAgentToolRegistry(globalScope) {
  const permissions = typeof require === "function"
    ? require("./agent-permissions.js")
    : globalScope.YouyixingAgentPermissions;
  const { TOOL_LEVELS, normalizePermissionLevel } = permissions;

  const defaultRegistry = new Map();

  function normalizeToolDefinition(toolDefinition = {}) {
    if (!toolDefinition.name) throw new Error("tool_name_required");
    return {
      name: toolDefinition.name,
      description: toolDefinition.description || "",
      permissionLevel: normalizePermissionLevel(toolDefinition.permissionLevel || TOOL_LEVELS[toolDefinition.name] || "L0_READ_ONLY"),
      handler: typeof toolDefinition.handler === "function" ? toolDefinition.handler : async () => ({ ok: true }),
      inputSchema: toolDefinition.inputSchema || null,
    };
  }

  function registerAgentTool(toolDefinition, registry = defaultRegistry) {
    const normalized = normalizeToolDefinition(toolDefinition);
    registry.set(normalized.name, normalized);
    return normalized;
  }

  function getAgentTool(toolName, registry = defaultRegistry) {
    return registry.get(toolName) || null;
  }

  function listAgentTools(registry = defaultRegistry) {
    return Array.from(registry.values()).map(({ handler, ...tool }) => tool);
  }

  function createAgentToolRegistry() {
    return new Map();
  }

  const api = { registerAgentTool, getAgentTool, listAgentTools, createAgentToolRegistry, defaultRegistry };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingAgentToolRegistry = api;
})(typeof window !== "undefined" ? window : globalThis);
