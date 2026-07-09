(function initYouyixingProductTableView(globalScope) {
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

  function ticketGroupCountBadge(entry = {}) {
    const count = entry.items?.length || 0;
    return count > 1 ? ` <span class="small-badge">${count}个票种</span>` : "";
  }

  function productPriceRangeDisplay(values = [], items = [], emptyHtml = `<span class="product-price-missing">待补成本</span>`, helpers = {}) {
    const money = helpers.money || defaultMoney;
    const numeric = values
      .map((value) => (value === "" || value == null ? null : Number(value)))
      .filter((value) => Number.isFinite(value));
    if (!numeric.length) {
      const hasFree = items.some((item) => item?.isFree === true);
      return hasFree ? `<span class="product-price-free">${money(0)}</span>` : emptyHtml;
    }
    const min = Math.min(...numeric);
    const max = Math.max(...numeric);
    const text = min === max ? money(min) : `${money(min)}-${money(max)}`;
    return `<span class="product-price-value">${text}</span>`;
  }

  function renderTicketGroupSpecs(entry = {}, helpers = {}) {
    const escapeHtml = helpers.escapeHtml || defaultEscapeHtml;
    const productSpecValue = helpers.productSpecValue || ((item) => item?.spec || item?.ticketType || "");
    const productServiceValue = helpers.productServiceValue || ((item) => item?.serviceType || item?.service || "");
    const productCostValue = helpers.productCostValue || ((item) => item?.cost ?? item?.costPrice ?? "");
    const productSaleValue = helpers.productSaleValue || ((item) => item?.sale ?? item?.salePrice ?? "");
    const productCostDisplay = helpers.productCostDisplay || ((value, item) => productPriceRangeDisplay([value], [item], `<span class="product-price-missing">待补成本</span>`, helpers));
    const productPriceDisplay = helpers.productPriceDisplay || ((value) => productPriceRangeDisplay([value], [], `<span class="muted-dash">-</span>`, helpers));
    const productSupplierName = helpers.productSupplierName || ((item) => item?.supplierName || item?.supplier || "");
    const pendingSupplier = helpers.pendingSupplier || "待绑定供应商";
    const items = entry.items || [];
    const specs = [...new Set(items.map((item) => productSpecValue(item, entry.category) || productServiceValue(item, entry.category) || "景区门票").filter(Boolean))];
    if (!specs.length) return "-";
    const summary = specs.slice(0, 3).map((spec) => `<span class="small-badge">${escapeHtml(spec)}</span>`).join("")
      + (specs.length > 3 ? `<span class="small-badge">+${specs.length - 3}</span>` : "");
    if (items.length <= 1) return summary;
    const rows = items.map((item) => {
      const spec = productSpecValue(item, entry.category) || productServiceValue(item, entry.category) || "景区门票";
      return `<tr>
        <td>${escapeHtml(spec)}</td>
        <td>${productCostDisplay(productCostValue(item, entry.category), item)}</td>
        <td>${productPriceDisplay(productSaleValue(item, entry.category))}</td>
        <td>${escapeHtml(productSupplierName(item) || pendingSupplier)}</td>
      </tr>`;
    }).join("");
    return `<details class="ticket-spec-details">
      <summary>${summary}<span class="ticket-detail-hint">展开价格明细</span></summary>
      <table class="mini-spec-table">
        <thead><tr><th>票种/规格</th><th>成本</th><th>参考售价</th><th>供应商</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </details>`;
  }

  const api = {
    ticketGroupCountBadge,
    renderTicketGroupSpecs,
    productPriceRangeDisplay,
    priceRangeDisplay: productPriceRangeDisplay,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingProductTableView = api;
})(typeof window !== "undefined" ? window : globalThis);
