(function initYouyixingSupplierListView(globalScope) {
  function defaultEscapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function defaultMoney(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "待补";
    return `¥${numeric.toLocaleString("zh-CN")}`;
  }

  function primaryContact(supplier = {}) {
    const contacts = Array.isArray(supplier.contacts) ? supplier.contacts : [];
    return contacts.find((item) => item.primary) || contacts[0] || {};
  }

  function supplierCitiesText(supplier = {}) {
    if (supplier.serviceScope) return supplier.serviceScope;
    if (Array.isArray(supplier.cities) && supplier.cities.length) return supplier.cities.join("、");
    return supplier.city || "-";
  }

  function renderSupplierListTable(suppliers = [], options = {}) {
    const escapeHtml = options.escapeHtml || defaultEscapeHtml;
    const money = options.money || defaultMoney;
    const minSupplierCost = options.minSupplierCost || (() => "");
    const supplierValidityText = options.supplierValidityText || (() => "价格有效期待补");
    const activeSupplierId = options.activeSupplierId || "";
    const emptyText = options.emptyText || "当前品类下暂无供应商。";
    const rows = suppliers.map((supplier) => {
      const primary = primaryContact(supplier);
      const details = Array.isArray(supplier.serviceDetails) ? supplier.serviceDetails : [];
      const minCost = minSupplierCost(details);
      const statusClass = supplier.status === "启用" ? "ok" : "warn";
      return `<tr class="${supplier.id === activeSupplierId ? "active-row" : ""}">
        <td><strong>${escapeHtml(supplier.name)}</strong><span>${escapeHtml(supplier.id)}</span></td>
        <td>${escapeHtml(supplier.category)}</td>
        <td>${escapeHtml(supplier.sourceType)}</td>
        <td><strong>${escapeHtml(supplier.city || "-")}</strong><span>${escapeHtml(supplierCitiesText(supplier))}</span></td>
        <td>${escapeHtml(primary.name || "待补")}<span>${escapeHtml(primary.role || "")}</span></td>
        <td><span class="resource-status ${statusClass}">${escapeHtml(supplier.status)}</span></td>
        <td>${details.length} 条<span>${minCost === "" ? "缺成本" : `最低 ${money(minCost)}`} · ${escapeHtml(supplierValidityText(details))}</span></td>
        <td class="row-actions">
          <button class="link-btn" data-view-supplier="${escapeHtml(supplier.id)}">详细</button>
          <button class="link-btn" data-edit-supplier="${escapeHtml(supplier.id)}">编辑</button>
          <button class="link-btn" data-toggle-supplier="${escapeHtml(supplier.id)}">${supplier.status === "启用" ? "停用" : "启用"}</button>
        </td>
      </tr>`;
    }).join("");
    return `<div class="supplier-table-wrap">
      <table class="project-table supplier-table wide-supplier-table">
        <thead><tr>${["供应商名称","品类","来源","城市 / 范围","主要联系人","状态","服务明细","操作"].map((header) => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>${rows || `<tr><td colspan="8">${escapeHtml(emptyText)}</td></tr>`}</tbody>
      </table>
    </div>`;
  }

  const api = {
    primaryContact,
    supplierCitiesText,
    renderSupplierListTable,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingSupplierListView = api;
})(typeof window !== "undefined" ? window : globalThis);
