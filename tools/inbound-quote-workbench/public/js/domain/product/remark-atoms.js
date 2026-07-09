(function initYouyixingRemarkAtoms(globalScope) {
  const REMARK_FIELDS = [
    "remark",
    "remarks",
    "notes",
    "internalNotes",
    "internalNote",
    "freePolicy",
    "guaranteePolicy",
    "bookingPolicy",
    "cancellationPolicy",
    "supplierNote",
    "customerNote",
  ];

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function hashText(value) {
    let hash = 0;
    const text = normalizeText(value);
    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function splitRemarkText(value) {
    return normalizeText(value)
      .split(/\n|；|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function classifyRemark(text, sourceField = "") {
    const body = `${sourceField} ${text}`;
    let type = "unknown";
    let visibility = "internal";
    let severity = "info";
    let confidence = 0.55;
    if (/取消|退改|不可退|退款/.test(body)) {
      type = "cancellation_policy";
      visibility = "sales";
      confidence = 0.9;
    } else if (/保证|保留|占位|保票|保房/.test(body)) {
      type = "guarantee_policy";
      visibility = "op";
      confidence = 0.85;
    } else if (/提前|预约|预订|确认|下单|实名/.test(body)) {
      type = "booking_policy";
      visibility = "op";
      confidence = 0.85;
    } else if (/涨价|节假日|旺季|淡季|另询|单询|加价/.test(body)) {
      type = /另询|涨价|单询/.test(body) ? "risk" : "price_policy";
      visibility = "sales";
      severity = /另询|涨价|单询/.test(body) ? "warning" : "info";
      confidence = 0.82;
    } else if (/内部|不要给客人|仅后台|不可对客/.test(body)) {
      type = "internal_note";
      visibility = "internal";
      severity = "warning";
      confidence = 0.95;
    } else if (/客人可见|展示给客户|对客|客户/.test(body)) {
      type = "customer_note";
      visibility = "customer";
      confidence = 0.9;
    } else if (/供应商|联系人|电话|微信|渠道/.test(body)) {
      type = "supplier_note";
      visibility = "internal";
      severity = "warning";
      confidence = 0.78;
    } else if (/操作|OP|司机|导游|排团/.test(body)) {
      type = "operation_note";
      visibility = "op";
      confidence = 0.72;
    }
    if (/风险|不保证|可能|注意|异常/.test(body)) {
      severity = severity === "info" ? "warning" : severity;
      if (type === "unknown") type = "risk";
    }
    return { type, visibility, severity, status: "draft", confidence };
  }

  function collectRemarkSources(product = {}) {
    const rows = [];
    REMARK_FIELDS.forEach((field) => {
      if (product[field] !== "" && product[field] != null) rows.push({ sourceField: field, value: product[field] });
    });
    const raw = product.rawFields || {};
    if (raw && typeof raw === "object") {
      Object.entries(raw).forEach(([field, value]) => {
        if (/备注|说明|政策|保票|免费|取消|预订|预约|联系人|电话/.test(field) && value !== "" && value != null) {
          rows.push({ sourceField: `rawFields.${field}`, value });
        }
      });
    }
    return rows;
  }

  function createRemarkAtom(product, text, sourceField, index) {
    const meta = classifyRemark(text, sourceField);
    const productId = product.id || product.cloudResourceId || product.sourceProductId || "";
    return {
      id: `RA-${productId || "PRODUCT"}-${hashText(`${sourceField}:${text}`)}-${index}`,
      productId,
      ...meta,
      text,
      sourceField,
    };
  }

  function normalizeProductRemarks(product = {}) {
    const cleanProduct = { ...product };
    const sources = collectRemarkSources(product);
    const rawRemark = sources.map((item) => `${item.sourceField}: ${normalizeText(item.value)}`).join("\n");
    const remarkAtoms = [];
    sources.forEach(({ sourceField, value }) => {
      splitRemarkText(value).forEach((text) => {
        if (!text) return;
        remarkAtoms.push(createRemarkAtom(product, text, sourceField, remarkAtoms.length + 1));
      });
    });
    REMARK_FIELDS.forEach((field) => {
      if (field in cleanProduct) delete cleanProduct[field];
    });
    cleanProduct.rawRemark = rawRemark;
    cleanProduct.rawFields = product.rawFields || {};
    cleanProduct.customerVisibleRemarks = remarkAtoms
      .filter((atom) => atom.visibility === "customer")
      .map((atom) => atom.text);
    return { cleanProduct, remarkAtoms };
  }

  const api = { normalizeProductRemarks, classifyRemark, collectRemarkSources };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalScope.YouyixingRemarkAtoms = api;
})(typeof window !== "undefined" ? window : globalThis);
