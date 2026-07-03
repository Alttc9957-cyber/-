(function initYouyixingAgentLogger(globalScope) {
  const memoryLogs = [];

  function summarize(value) {
    if (value === undefined) return "";
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.length > 500 ? `${text.slice(0, 500)}...` : text;
  }

  function createAgentLog(entry = {}) {
    return {
      id: entry.id || `AGLOG-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      runId: entry.runId || `RUN-${Date.now()}`,
      toolName: entry.toolName || "",
      permissionLevel: entry.permissionLevel || "",
      inputSummary: summarize(entry.inputSummary ?? entry.input),
      outputSummary: summarize(entry.outputSummary ?? entry.output),
      status: entry.status || "ok",
      userId: entry.userId || "",
      role: entry.role || "",
      tenantId: entry.tenantId || "",
      createdAt: entry.createdAt || new Date().toISOString(),
      error: entry.error || "",
    };
  }

  function writeAgentLog(entry = {}, options = {}) {
    const log = createAgentLog(entry);
    memoryLogs.push(log);
    if (typeof localStorage !== "undefined") {
      const key = options.storageKey || "youyixing_agent_tool_logs";
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      saved.unshift(log);
      localStorage.setItem(key, JSON.stringify(saved.slice(0, 500)));
    }
    return log;
  }

  function getAgentLogs() {
    if (typeof localStorage !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("youyixing_agent_tool_logs") || "[]");
      } catch {
        return [];
      }
    }
    return memoryLogs.slice();
  }

  function clearAgentLogs() {
    memoryLogs.length = 0;
    if (typeof localStorage !== "undefined") localStorage.removeItem("youyixing_agent_tool_logs");
  }

  const api = { createAgentLog, writeAgentLog, getAgentLogs, clearAgentLogs };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingAgentLogger = api;
})(typeof window !== "undefined" ? window : globalThis);
