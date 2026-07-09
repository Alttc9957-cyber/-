(function initYouyixingQuoteDisplay(globalScope) {
  function text(value) {
    return String(value ?? "").trim();
  }

  function normalizeStatus(input = {}) {
    const source = text(input.source);
    const reason = text(input.reason || input.matchReason);
    const status = text(input.matchStatus || input.status);
    const combined = `${source} ${reason}`;
    if (status) return status;
    if (/未匹配|不匹配|未找到|NO_PRODUCT|城市不匹配|服务类型不匹配|车型缺失/.test(combined)) return "unmatched";
    if (/待确认|候选|多候选|待选择/.test(combined)) return "need_confirm";
    if (/待补成本|待补价|待询价|缺成本|成本价为空|大交通待录入|手动录入大交通成本/.test(combined)) return "need_price";
    if (source) return "matched";
    return "";
  }

  function compactSourceLabel(input = {}, status = "") {
    const source = text(input.source);
    const sourceType = text(input.sourceType || input.costSource);
    const candidateCount = Array.isArray(input.candidates) ? input.candidates.length : 0;
    if (status === "unmatched") return "未匹配";
    if (status === "need_confirm") return candidateCount ? `待确认 · ${candidateCount} 个候选` : "待确认";
    if (status === "need_price" || input.missingCost) return "待补成本";
    if (/产品库|Excel|云端|系统底库/.test(sourceType) || /产品库|Excel|云端|系统底库/.test(source)) return "产品库成本";
    if (/供应商/.test(sourceType)) return "供应商成本";
    if (/手动/.test(sourceType) || /手动/.test(source)) return "手动录入";
    if (/供应商/.test(source)) return "供应商成本";
    return source ? "已匹配" : "";
  }

  function levelForStatus(status) {
    if (status === "unmatched") return "danger";
    if (status === "need_confirm" || status === "need_price") return "warn";
    return "ok";
  }

  function normalizeSourceDetail(source) {
    return text(source).replace(/待补价|待询价|大交通待录入/g, "待补成本");
  }

  function candidateLabel(candidate = {}) {
    const name = text(candidate.name || candidate.sourceName || candidate.hotelName || candidate.scenicName || candidate.restaurant || candidate.experienceName);
    const spec = text(candidate.ticketType || candidate.model || candidate.roomType || candidate.vehicleType || candidate.serviceType || candidate.language);
    const cost = candidate.cost === "" || candidate.cost == null
      ? "待补成本"
      : `¥${Number(candidate.cost).toLocaleString("zh-CN")}`;
    return [name, spec, cost].filter(Boolean).join(" / ");
  }

  function summarizeQuoteSource(input = {}) {
    const source = normalizeSourceDetail(input.source);
    const reason = text(input.reason || input.matchReason);
    const candidates = Array.isArray(input.candidates) ? input.candidates : [];
    if (!source && !reason && !candidates.length && !input.matchStatus && !input.missingCost) return null;
    const status = normalizeStatus(input);
    const label = compactSourceLabel(input, status);
    const details = [];
    if (source) details.push(`来源：${source}`);
    if (reason) details.push(`原因：${reason}`);
    if (candidates.length) {
      const labels = candidates.slice(0, 6).map(candidateLabel).filter(Boolean);
      details.push(`候选：${labels.join("；")}${candidates.length > 6 ? `；等 ${candidates.length} 条` : ""}`);
    }
    return {
      label,
      status,
      level: levelForStatus(status),
      detail: details.join("\n"),
      candidateCount: candidates.length,
    };
  }

  const api = { summarizeQuoteSource, candidateLabel };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingQuoteDisplay = api;
})(typeof window !== "undefined" ? window : globalThis);
