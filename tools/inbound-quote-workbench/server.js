const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const host = "127.0.0.1";
const port = Number(process.env.PORT || 8787);
const runtimeSettingsPath = path.join(root, "runtime-settings.json");
const operationLogPath = path.join(root, "data", "agent-operation-log.json");
const manualProductResourcesPath = process.env.MANUAL_PRODUCT_RESOURCES_PATH || path.join(root, "data", "manual-product-resources.json");
loadLocalEnv(path.join(root, ".env"));
loadLocalEnv(path.join(root, ".env.supabase.local"));

const types = {
  ".html": "text/html;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".js": "application/javascript;charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

async function requestHandler(req, res) {
  const route = req.url.split("?")[0];
  if (req.method === "GET" && route === "/api/settings") {
    handleGetSettings(res);
    return;
  }

  if (req.method === "POST" && route === "/api/settings/ai") {
    await handleSaveAiSettings(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/settings/ai/test") {
    await handleTestAiSettings(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/agent") {
    await handleAgentRequest(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/agent/chat") {
    await handleAgentChatRequest(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/agent/action") {
    await handleAgentActionRequest(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/agent/suggestions") {
    await handleAgentSuggestionsRequest(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/agent/apply") {
    await handleAgentApplyRequest(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/translate") {
    await handleTranslateRequest(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/translate/segment") {
    await handleTranslateSegmentRequest(req, res);
    return;
  }

  if (req.method === "GET" && route === "/api/product-imports/latest/report") {
    await handleLatestProductImportReport(req, res);
    return;
  }

  if (req.method === "GET" && route === "/api/product-resources") {
    await handleProductResources(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/product-resources/match") {
    await handleProductResourceMatch(req, res);
    return;
  }

  if (req.method === "POST" && route === "/api/product-resources/upsert-from-quote") {
    await handleUpsertProductResourceFromQuote(req, res);
    return;
  }

  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.resolve(root, `.${urlPath}`);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (isBlockedStaticPath(filePath)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer(requestHandler);

function isBlockedStaticPath(filePath) {
  const relative = path.relative(root, filePath);
  const parts = relative.split(path.sep);
  if (parts.some((part) => part.startsWith(".") && part !== ".well-known")) return true;
  return [
    "runtime-settings.json",
    path.join("data", "agent-operation-log.json"),
    path.join("data", "manual-product-resources.json"),
  ].includes(relative);
}

function loadLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

async function handleAgentRequest(req, res) {
  try {
    const body = await readJsonBody(req);
    const aiConfig = readAiConfig();
    if (!aiConfig.apiKey) {
      sendMissingAiConfig(res, "AI Agent");
      return;
    }

    const payload = {
      model: aiConfig.model,
      temperature: Number(aiConfig.temperature),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "你是入境游报价工作台的右侧 AI Agent。",
            "你只负责需求理解、缺失信息、线路草稿、报价项识别和客户版英文文案。",
            "你不能编造最终价格，价格由系统根据产品资源库和报价规则计算。",
            "所有回复必须是 JSON，不要输出 Markdown。",
          ].join("\n"),
        },
        ...(Array.isArray(body.messages) ? body.messages : []),
      ],
    };

    const response = await fetch(`${aiConfig.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      sendJson(res, response.status, { error: result.error?.message || "AI provider request failed", raw: result });
      return;
    }

    const content = result.choices?.[0]?.message?.content || "{}";
    sendJson(res, 200, {
      content,
      usage: result.usage || null,
      model: result.model || payload.model,
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Agent request failed" });
  }
}

async function handleAgentChatRequest(req, res) {
  try {
    const body = await readJsonBody(req);
    const aiConfig = readAiConfig();
    if (!aiConfig.apiKey) {
      sendMissingAiConfig(res, "小易 Agent");
      return;
    }

    const payload = {
      model: aiConfig.model,
      temperature: Number(aiConfig.temperature),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "你是友易行智能报价系统的小易，一个聊天式 Agent 工作流助手。",
            "你要识别用户意图，并返回结构化 JSON。不要直接修改正式数据。",
            "可用 intent：extract_customer_info, update_customer_info, generate_itinerary, optimize_itinerary, extract_quote_items, check_missing_costs, generate_quote_proposal, generate_english_proposal, translate_proposal, check_english_chinese_residue, generate_poster, classify_project_images, save_memory, search_memory, confirm_apply。",
            "返回格式必须是：{reply,intent,suggestions,actions,attachments,memory_suggestions}。",
            "suggestions 每项包含 type, summary, before, after, reason。actions 每项包含 id,label,requiresConfirmation。",
            "涉及更新客户、行程、报价、图片分类、提案、记忆时，action 必须 requiresConfirmation=true。",
            "不要编造最终价格，报价计算由系统后端完成。",
          ].join("\n"),
        },
        {
          role: "user",
          content: JSON.stringify({
            message: body.message || "",
            projectId: body.projectId || "",
            context: body.context || {},
            attachments: body.attachments || [],
          }),
        },
      ],
    };

    const response = await fetch(`${aiConfig.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      sendJson(res, response.status, { error: result.error?.message || "AI provider request failed", raw: result });
      return;
    }

    const content = result.choices?.[0]?.message?.content || "{}";
    const parsed = parseModelJson(content);
    sendJson(res, 200, normalizeAgentChatResponse(parsed, result, payload.model));
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Agent chat request failed" });
  }
}

function parseModelJson(content) {
  if (typeof content !== "string") return content || {};
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return { reply: content, intent: "free_chat", suggestions: [], actions: [], attachments: [], memory_suggestions: [] };
    return JSON.parse(match[0]);
  }
}

function normalizeAgentChatResponse(data, result, model) {
  return {
    reply: data.reply || "我已理解你的需求。",
    intent: data.intent || "free_chat",
    context: data.context || {},
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    requiredFields: Array.isArray(data.requiredFields) ? data.requiredFields : [],
    actions: Array.isArray(data.actions) ? data.actions : [],
    draft: data.draft || null,
    canApply: Boolean(data.canApply),
    nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
    memory_suggestions: Array.isArray(data.memory_suggestions) ? data.memory_suggestions : [],
    usage: result.usage || null,
    model: result.model || model,
  };
}

async function handleAgentActionRequest(req, res) {
  try {
    const body = await readJsonBody(req);
    sendJson(res, 200, localAgentResponse({ ...body, message: body.message || body.action || "" }));
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Agent action failed" });
  }
}

async function handleTranslateRequest(req, res) {
  try {
    const body = await readJsonBody(req);
    const aiConfig = readAiConfig();
    if (!aiConfig.apiKey) {
      sendJson(res, 503, { error: "未配置真实翻译 API Key。请先在系统设置里配置 AI 模型接口。" });
      return;
    }
    const source = body.source || {};
    const targetLanguage = body.targetLanguage || "English";
    const payload = {
      model: aiConfig.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "你是入境游报价方案专业翻译。",
            "只翻译用户提供的完整中文方案，不要新增未提供的服务或价格。",
            "保留 Day 1 / Day 2 结构、日期、城市、酒店名、景点名、价格、费用包含和不包含。",
            "返回 JSON：{title,kicker,meta,itinerary:[{day,date,city,overview,detail}], inclusions:[], exclusions:[], payment, notes:[]}",
            "不要输出 Markdown。",
          ].join("\n"),
        },
        {
          role: "user",
          content: JSON.stringify({ targetLanguage, source }),
        },
      ],
    };
    const response = await fetch(`${aiConfig.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      sendJson(res, response.status, { error: result.error?.message || "Translate request failed", raw: result });
      return;
    }
    const content = result.choices?.[0]?.message?.content || "{}";
    sendJson(res, 200, { translation: parseModelJson(content), usage: result.usage || null, model: result.model || payload.model });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Translate request failed" });
  }
}

async function handleTranslateSegmentRequest(req, res) {
  try {
    const body = await readJsonBody(req);
    const aiConfig = readAiConfig();
    if (!aiConfig.apiKey) {
      sendJson(res, 503, { error: "未配置真实翻译 API Key。请先在系统设置里配置 AI 模型接口。" });
      return;
    }
    const text = String(body.text || "").trim();
    if (!text) {
      sendJson(res, 400, { error: "缺少需要翻译的中文片段。" });
      return;
    }
    const targetLanguage = body.targetLanguage || "English";
    const context = body.context || {};
    const payload = {
      model: aiConfig.model,
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "你是入境游报价方案的局部翻译器。",
            "只翻译用户提供的 text，不新增原文没有的信息。",
            "保留酒店名、城市名、景点名、日期、价格、Day 编号和专有名词。",
            "结合 context 理解语境，但不要把 context 中其他内容扩写进译文。",
            "返回 JSON：{translatedText:\"...\"}。",
            "不要输出 Markdown。",
          ].join("\n"),
        },
        {
          role: "user",
          content: JSON.stringify({ targetLanguage, text, context }),
        },
      ],
    };
    const response = await fetch(`${aiConfig.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      sendJson(res, response.status, { error: result.error?.message || "Translate segment request failed", raw: result });
      return;
    }
    const content = result.choices?.[0]?.message?.content || "{}";
    const parsed = parseModelJson(content);
    sendJson(res, 200, {
      translatedText: String(parsed.translatedText || "").trim(),
      usage: result.usage || null,
      model: result.model || payload.model,
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Translate segment request failed" });
  }
}

async function handleAgentSuggestionsRequest(req, res) {
  try {
    const body = await readJsonBody(req);
    sendJson(res, 200, localAgentSuggestions(body));
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Agent suggestions failed" });
  }
}

async function handleAgentApplyRequest(req, res) {
  try {
    const body = await readJsonBody(req);
    const entry = {
      id: `op_${Date.now()}`,
      projectId: body.projectId || "",
      intent: body.intent || body.actionId || "",
      actionId: body.actionId || "",
      draft: body.draft || null,
      status: body.confirmed === false ? "draft" : "applied",
      createdAt: new Date().toISOString(),
    };
    appendOperationLog(entry);
    sendJson(res, 200, {
      reply: entry.status === "applied" ? "已记录确认应用动作，前端可安全写入对应表格。" : "已记录为草稿，等待用户确认。",
      intent: entry.intent,
      context: { projectId: entry.projectId },
      suggestions: [],
      requiredFields: [],
      actions: [],
      draft: entry.draft,
      canApply: entry.status !== "applied",
      nextSteps: entry.status === "applied" ? ["刷新表格", "记录操作日志"] : ["继续修改草稿", "确认后应用"],
      operation: entry,
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Agent apply failed" });
  }
}

function localAgentResponse(body = {}) {
  const message = String(body.message || "").trim();
  const context = body.context || {};
  const intent = inferBackendIntent(message);
  const draft = buildBackendDraft(intent, message, context);
  return {
    reply: backendReply(intent, draft),
    intent,
    context: {
      projectId: body.projectId || "",
      module: context.module || context.action || "quote",
      knownFields: Object.keys(context || {}),
    },
    suggestions: [{
      type: intent,
      summary: backendSuggestionSummary(intent),
      before: context.current || null,
      after: draft,
      reason: "由后端读取当前项目上下文和用户消息生成草稿，需用户确认后应用。",
    }],
    requiredFields: requiredFieldsForIntent(intent, draft),
    actions: [{ id: actionIdForIntent(intent), label: actionLabelForIntent(intent), requiresConfirmation: true }],
    draft,
    canApply: true,
    nextSteps: ["检查草稿", "需要时打回重改", "确认后应用到表格"],
    attachments: body.attachments || [],
    memory_suggestions: [],
    model: "local-agent-engine",
  };
}

function inferBackendIntent(message) {
  if (/残留中文|中文残留|英文|翻译|translation/i.test(message)) return "check_english_chinese_residue";
  if (/报价项|成本|匹配产品|重新计算|补价|补录/i.test(message)) return "extract_quote_items";
  if (/行程|线路|route|itinerary|优化/i.test(message)) return /优化/.test(message) ? "optimize_itinerary" : "generate_itinerary";
  if (/图片|素材|海报|封面/i.test(message)) return "classify_project_images";
  if (/确认|应用|apply/i.test(message)) return "confirm_apply";
  return "extract_customer_info";
}

function buildBackendDraft(intent, message, context) {
  if (intent === "check_english_chinese_residue") {
    return { task: "translation_residue_check", source: "proposal", instruction: message };
  }
  if (intent === "extract_quote_items") {
    return { quoteItems: [], instruction: message, costPolicy: "manual_cost_first_then_product_rematch" };
  }
  if (intent === "generate_itinerary" || intent === "optimize_itinerary") {
    return { route: { days: context.itinerary || [] }, instruction: message };
  }
  return { customer: context.customer || {}, instruction: message };
}

function backendReply(intent) {
  const map = {
    extract_customer_info: "我会先整理客户资料草稿，不直接覆盖正式字段。",
    generate_itinerary: "我会生成线路草稿，等待你确认后写入行程表。",
    optimize_itinerary: "我会按修改意见重排行程草稿，确认后才应用。",
    extract_quote_items: "我会识别报价项并准备产品库匹配草稿，手动成本优先保留。",
    check_english_chinese_residue: "我会调用同一套英文残留检查和局部修正流程。",
    classify_project_images: "我会生成图片分类草稿，确认后同步素材池。",
    confirm_apply: "收到确认，我会记录应用动作并由前端写入对应表格。",
  };
  return map[intent] || "我已生成待确认草稿。";
}

function backendSuggestionSummary(intent) {
  return {
    extract_customer_info: "客户资料草稿",
    generate_itinerary: "线路草稿",
    optimize_itinerary: "线路优化草稿",
    extract_quote_items: "报价项草稿",
    check_english_chinese_residue: "英文残留处理草稿",
  }[intent] || "Agent 草稿";
}

function requiredFieldsForIntent(intent, draft) {
  if (intent === "extract_customer_info") return ["成人数", "儿童数", "出行日期", "目的地城市"].filter((field) => !JSON.stringify(draft).includes(field));
  if (intent === "extract_quote_items") return ["成本价", "供应商", "报价品类"];
  if (intent === "check_english_chinese_residue") return ["中文源文", "当前英文预览"];
  return [];
}

function actionIdForIntent(intent) {
  return {
    extract_customer_info: "apply_customer_info",
    generate_itinerary: "apply_itinerary",
    optimize_itinerary: "apply_itinerary",
    extract_quote_items: "apply_quote_items",
    check_english_chinese_residue: "apply_partial_translation_fix",
    classify_project_images: "apply_image_classification",
    confirm_apply: "confirm_apply",
  }[intent] || "confirm_apply";
}

function actionLabelForIntent(intent) {
  return {
    extract_customer_info: "应用客户资料",
    generate_itinerary: "应用到行程",
    optimize_itinerary: "应用优化行程",
    extract_quote_items: "应用到报价明细",
    check_english_chinese_residue: "应用局部修正",
    classify_project_images: "应用图片分类",
    confirm_apply: "确认应用",
  }[intent] || "确认应用";
}

function localAgentSuggestions(body = {}) {
  const context = body.context || {};
  const suggestions = [
    { id: "recognize_customer", label: "识别需求", module: "customer", reason: "客户资料仍需确认" },
    { id: "generate_itinerary", label: "生成线路草稿", module: "itinerary", reason: "行程为空或需优化" },
    { id: "match_products", label: "匹配产品库", module: "quote", reason: "报价项需追溯成本来源" },
    { id: "check_translation", label: "检查中文残留", module: "proposal", reason: "英文提案需确认无中文残留" },
  ].filter((item) => !context.module || item.module === context.module || context.module === "chat");
  return {
    reply: "已根据当前模块生成建议动作。",
    intent: "suggestions",
    context,
    suggestions,
    requiredFields: [],
    actions: suggestions.map((item) => ({ id: item.id, label: item.label, requiresConfirmation: true })),
    draft: null,
    canApply: false,
    nextSteps: suggestions.map((item) => item.label),
  };
}

function appendOperationLog(entry) {
  let rows = [];
  try {
    rows = fs.existsSync(operationLogPath) ? JSON.parse(fs.readFileSync(operationLogPath, "utf8")) : [];
  } catch {
    rows = [];
  }
  rows.unshift(entry);
  fs.mkdirSync(path.dirname(operationLogPath), { recursive: true });
  fs.writeFileSync(operationLogPath, JSON.stringify(rows.slice(0, 200), null, 2));
}

function defaultAiSettings() {
  return {
    provider: "openai-compatible",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
    temperature: 0.2,
    apiKey: "",
  };
}

function readRuntimeSettings() {
  if (!fs.existsSync(runtimeSettingsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(runtimeSettingsPath, "utf8")) || {};
  } catch {
    return {};
  }
}

function writeRuntimeSettings(settings) {
  fs.writeFileSync(runtimeSettingsPath, JSON.stringify(settings, null, 2));
}

function readAiConfig() {
  const saved = readRuntimeSettings().ai || {};
  const fallback = {
    apiKey: process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || "",
    baseUrl: process.env.AI_BASE_URL || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model: process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || "deepseek-chat",
    temperature: Number(process.env.AI_TEMPERATURE || process.env.DEEPSEEK_TEMPERATURE || 0.2),
    provider: process.env.AI_PROVIDER || "openai-compatible",
  };
  return {
    ...defaultAiSettings(),
    ...fallback,
    ...saved,
    apiKey: saved.apiKey || fallback.apiKey,
  };
}

function publicAiConfig() {
  const runtime = readRuntimeSettings().ai || {};
  const config = readAiConfig();
  const source = runtime.apiKey ? "runtime-settings" : ((process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY) ? ".env" : "missing");
  return {
    provider: config.provider,
    baseUrl: config.baseUrl,
    model: config.model,
    temperature: Number(config.temperature),
    hasApiKey: Boolean(config.apiKey),
    apiKeyMasked: maskApiKey(config.apiKey),
    source,
  };
}

function sendMissingAiConfig(res, feature = "AI 模型接口") {
  sendJson(res, 503, {
    error: `${feature} 未配置 API Key，测试模式不允许降级到本地规则。请在系统设置中配置 AI 模型接口后重试。`,
    code: "AI_PROVIDER_REQUIRED",
    hasApiKey: false,
    source: "missing",
  });
}

function maskApiKey(apiKey) {
  if (!apiKey) return "";
  const tail = apiKey.slice(-4);
  return `sk-****${tail}`;
}

function sanitizeAiInput(input = {}) {
  return {
    provider: String(input.provider || "openai-compatible").trim() || "openai-compatible",
    apiKey: String(input.apiKey || "").trim(),
    baseUrl: String(input.baseUrl || "https://api.deepseek.com").trim().replace(/\/$/, ""),
    model: String(input.model || "deepseek-chat").trim(),
    temperature: Math.min(Math.max(Number(input.temperature ?? 0.2), 0), 1),
  };
}

function handleGetSettings(res) {
  sendJson(res, 200, { ai: publicAiConfig() });
}

function readSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || "";
  return { url, serviceKey };
}

function hasSupabaseConfig() {
  const { url, serviceKey } = readSupabaseConfig();
  return Boolean(url && serviceKey);
}

async function supabaseFetch(pathname, options = {}) {
  const { url, serviceKey } = readSupabaseConfig();
  if (!url || !serviceKey) throw new Error("Supabase 未配置");
  const method = options.method || "GET";
  const params = options.params || {};
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value != null) query.set(key, value);
  });
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: options.prefer || (method === "GET" ? "count=exact" : "return=representation"),
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${url}/rest/v1/${pathname}${query.size ? `?${query}` : ""}`, {
    method,
    headers: {
      ...headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase ${response.status}`);
  return { data, count: response.headers.get("content-range") || "" };
}

async function supabaseRest(pathname, params = {}) {
  return supabaseFetch(pathname, { params });
}

function productResourceSelectFields() {
  return "id,source_key,category,city,name,service_type,route,model,spec,supplier_name,cost_price,sale_price,low_season_cost,high_season_cost,adult_cost,child_cost,pricing_unit,status,source,source_sheet,source_row,raw_fields,extra_fields,quality_flags,published_version";
}

async function handleLatestProductImportReport(req, res) {
  try {
    const result = await supabaseRest("product_import_batches", {
      select: "id,source_file,source_version,status,counts,quality_report,published_at,created_at",
      order: "created_at.desc",
      limit: "1",
    });
    sendJson(res, 200, { batch: result.data?.[0] ? normalizeProductImportBatchApiFields(result.data[0]) : null });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "读取产品库导入报告失败" });
  }
}

async function handleProductResources(req, res) {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);
    const localResources = filterManualProductResources(readManualProductResources(), {
      category: url.searchParams.get("category") || "",
      city: url.searchParams.get("city") || "",
      serviceType: url.searchParams.get("serviceType") || url.searchParams.get("service_type") || "",
      model: url.searchParams.get("model") || "",
      status: url.searchParams.get("status") || "",
      q: url.searchParams.get("q") || "",
    });
    if (!hasSupabaseConfig()) {
      sendJson(res, 200, { resources: localResources.map(normalizeProductResourceApiFields), count: `${localResources.length}`, storage: "local-json" });
      return;
    }
    const params = {
      select: productResourceSelectFields(),
      is_published: "eq.true",
      order: "category.asc,city.asc,name.asc",
      limit: String(Math.min(Number(url.searchParams.get("limit") || 100), 5000)),
    };
    const exactFilters = {
      category: "category",
      city: "city",
      serviceType: "service_type",
      service_type: "service_type",
      model: "model",
      status: "status",
    };
    Object.entries(exactFilters).forEach(([queryKey, column]) => {
      const value = url.searchParams.get(queryKey);
      if (value) params[column] = `eq.${value}`;
    });
    const q = normalizeApiSearchText(url.searchParams.get("q") || "");
    if (q) params.or = `(name.ilike.*${q}*,route.ilike.*${q}*,spec.ilike.*${q}*)`;
    const result = await supabaseRest("product_resources", params);
    const resources = [...(result.data || []), ...localResources];
    sendJson(res, 200, { resources: resources.map(normalizeProductResourceApiFields), count: result.count || `${resources.length}`, storage: "supabase+local-json" });
  } catch (error) {
    const localResources = filterManualProductResources(readManualProductResources(), {});
    if (localResources.length) {
      sendJson(res, 200, { resources: localResources.map(normalizeProductResourceApiFields), count: `${localResources.length}`, storage: "local-json", warning: error.message || "云端产品库读取失败，已使用本地持久补录库" });
      return;
    }
    sendJson(res, 500, { error: error.message || "查询产品资源失败" });
  }
}

async function handleProductResourceMatch(req, res) {
  try {
    const body = await readJsonBody(req);
    const category = body.category || body.sourceCategory || "";
    const city = body.city || "";
    let resources = filterManualProductResources(readManualProductResources(), {
      category,
      city,
      serviceType: body.serviceType || "",
      model: body.model || "",
    });
    if (hasSupabaseConfig()) {
      const params = {
        select: productResourceSelectFields(),
        is_published: "eq.true",
        limit: "300",
      };
      if (category) params.category = `eq.${category}`;
      if (city) params.city = `eq.${city}`;
      const result = await supabaseRest("product_resources", params);
      resources = [...(result.data || []), ...resources];
    }
    const candidates = resources.map((resource) => ({
      ...resource,
      score: productResourceMatchScore(resource, body),
    })).filter((resource) => resource.score > 0).sort((a, b) => b.score - a.score);
    const best = candidates[0] || null;
    const diagnostics = {
      cityCandidateCount: resources.filter((resource) => !city || resource.city === city).length,
      typeCandidateCount: candidates.filter((resource) => !body.serviceType || resource.service_type === body.serviceType).length,
      modelCandidateCount: candidates.filter((resource) => !body.model || resource.model === body.model).length,
      finalCandidateCount: candidates.length,
    };
    const cost = best?.cost_price == null ? null : Number(best.cost_price);
    const matchStatus = !best ? "unmatched" : cost == null ? "need_confirm" : best.score >= 80 ? "matched" : "need_confirm";
    sendJson(res, 200, {
      matchStatus,
      matchReason: productResourceMatchReason(matchStatus, best, body),
      resource: best ? normalizeProductResourceApiFields(best) : null,
      candidates: candidates.slice(0, 10).map(normalizeProductResourceApiFields),
      diagnostics,
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "匹配产品资源失败" });
  }
}

async function handleUpsertProductResourceFromQuote(req, res) {
  try {
    const body = await readJsonBody(req);
    const resource = normalizeQuoteProductResourcePayload(body);
    if (!resource.category || !resource.name) {
      sendJson(res, 400, { error: "产品资源缺少品类或名称，不能写入产品库" });
      return;
    }
    if (resource.cost_price == null) {
      sendJson(res, 400, { error: "补录成本为空，不能写入可报价产品库" });
      return;
    }
    const warnings = [];
    let storage = "local-json";
    let saved = null;
    if (hasSupabaseConfig()) {
      try {
        saved = await upsertSupabaseProductResource(resource);
        storage = "supabase";
      } catch (error) {
        warnings.push(`Supabase 写入失败，已落本地持久库：${error.message || error}`);
      }
    }
    if (!saved) saved = upsertManualProductResource(resource);
    sendJson(res, 200, {
      ok: true,
      storage,
      resource: normalizeProductResourceApiFields(saved),
      sourceKey: resource.source_key,
      warnings,
      message: storage === "supabase" ? "已写入云端产品库，可被后续报价匹配" : "已写入服务端本地持久产品库，可被后续报价匹配",
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "报价补录资源写入产品库失败" });
  }
}

function readManualProductResources() {
  try {
    if (!fs.existsSync(manualProductResourcesPath)) return [];
    const payload = JSON.parse(fs.readFileSync(manualProductResourcesPath, "utf8"));
    return Array.isArray(payload.resources) ? payload.resources : Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

function writeManualProductResources(resources = []) {
  fs.mkdirSync(path.dirname(manualProductResourcesPath), { recursive: true });
  fs.writeFileSync(manualProductResourcesPath, JSON.stringify({
    version: 1,
    updatedAt: new Date().toISOString(),
    resources,
  }, null, 2));
}

function filterManualProductResources(resources = [], filters = {}) {
  const q = compactApiMatchText(filters.q || "");
  return (Array.isArray(resources) ? resources : []).filter((resource) => {
    if (resource.is_published === false) return false;
    if (filters.category && resource.category !== filters.category) return false;
    if (filters.city && resource.city !== filters.city) return false;
    if (filters.serviceType && resource.service_type !== filters.serviceType) return false;
    if (filters.model && resource.model !== filters.model) return false;
    if (filters.status && resource.status !== filters.status) return false;
    if (q) {
      const body = compactApiMatchText([resource.name, resource.route, resource.spec, resource.service_type, resource.model].filter(Boolean).join(" "));
      if (!body.includes(q)) return false;
    }
    return true;
  });
}

function upsertManualProductResource(resource = {}) {
  const rows = readManualProductResources();
  const now = new Date().toISOString();
  const index = rows.findIndex((item) => item.source_key === resource.source_key || (resource.id && item.id === resource.id));
  const existing = index >= 0 ? rows[index] : {};
  const next = {
    ...existing,
    ...resource,
    id: existing.id || resource.id || `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: existing.created_at || now,
    updated_at: now,
  };
  if (index >= 0) rows[index] = next;
  else rows.unshift(next);
  writeManualProductResources(rows.slice(0, 2000));
  return next;
}

async function upsertSupabaseProductResource(resource = {}) {
  const lookup = await supabaseRest("product_resources", {
    select: "id,source_key,created_at",
    source_key: `eq.${resource.source_key}`,
    limit: "1",
  });
  const existing = lookup.data?.[0] || null;
  const payload = { ...resource };
  delete payload.id;
  if (existing?.id) {
    const result = await supabaseFetch("product_resources", {
      method: "PATCH",
      params: { id: `eq.${existing.id}` },
      body: payload,
      prefer: "return=representation",
    });
    return result.data?.[0] || { ...resource, id: existing.id };
  }
  const result = await supabaseFetch("product_resources", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });
  return result.data?.[0] || resource;
}

function firstPresent(...values) {
  return values.find((value) => value !== "" && value !== undefined && value !== null) ?? "";
}

function numberOrNull(value) {
  if (value === "" || value === undefined || value === null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = String(value).replace(/[¥￥,\s]/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const numeric = Number(match[0]);
  return Number.isFinite(numeric) ? numeric : null;
}

function quoteProductName(category, item = {}, quoteRow = {}) {
  if (category === "用车") return firstPresent(item.name, item.productName, quoteRow.productName, item.route, quoteRow.legLabel, `${item.city || quoteRow.city || ""}${item.serviceType || quoteRow.serviceType || "用车"}${item.model || quoteRow.model || ""}`);
  if (category === "导游") return firstPresent(item.name, quoteRow.sourceName, `${item.city || quoteRow.city || ""}${item.language || "英语"}导游`);
  if (category === "景点门票" || category === "门票") return firstPresent(item.scenicName, item.name, quoteRow.name, quoteRow.sourceName, "报价台门票");
  if (category === "酒店") return firstPresent(item.hotelName, item.name, quoteRow.hotelName, quoteRow.sourceName, `${item.city || quoteRow.city || ""}参考酒店`);
  if (category === "餐厅" || category === "餐") return firstPresent(item.restaurant, item.name, quoteRow.sourceName, `${item.city || quoteRow.city || ""}餐食`);
  if (category === "大交通") return firstPresent(item.name_cn, item.name, quoteRow.info, "大交通");
  return firstPresent(item.name, item.sourceName, quoteRow.sourceName, "报价台其他项目");
}

function quoteProductServiceType(category, item = {}, quoteRow = {}) {
  if (category === "用车") return firstPresent(item.serviceType, item.vehicleType, quoteRow.serviceType, "包车");
  if (category === "导游") return firstPresent(item.guideType, quoteRow.serviceType, "地陪");
  if (category === "景点门票" || category === "门票") return firstPresent(item.ticketType, "景区门票");
  if (category === "酒店") return firstPresent(item.roomType, quoteRow.roomType, "房型");
  if (category === "餐厅" || category === "餐") return firstPresent(item.cuisine, quoteRow.meals, "餐食");
  if (category === "大交通") return firstPresent(item.type, quoteRow.type, "大交通");
  return firstPresent(item.serviceType, quoteRow.serviceType, category);
}

function stableSourceKey(parts = []) {
  return parts
    .map((part) => String(part || "").trim().toLowerCase().replace(/\s+/g, ""))
    .filter(Boolean)
    .join("|")
    .slice(0, 220);
}

function normalizeQuoteProductResourcePayload(body = {}) {
  const item = body.item || body.product?.item || {};
  const quoteRow = body.quoteRow || body.row || {};
  const category = body.category || body.product?.category || item.category || quoteRow.category || "其他";
  const name = quoteProductName(category, item, quoteRow);
  const serviceType = quoteProductServiceType(category, item, quoteRow);
  const city = firstPresent(item.city, quoteRow.city, body.city);
  const route = firstPresent(item.route, item.routeName, quoteRow.route, quoteRow.legLabel, quoteRow.info);
  const model = firstPresent(item.model, item.vehicleModel, quoteRow.model);
  const spec = firstPresent(item.spec, item.roomType, item.ticketType, quoteRow.roomType, quoteRow.ticketType);
  const costPrice = numberOrNull(firstPresent(
    item.costPrice,
    item.manualCost,
    item.agencyAdult,
    item.adultCost,
    item.fullDayCost,
    item.agreementCost,
    item.perPersonCost,
    quoteRow.unitCost,
    quoteRow.charterCost,
    quoteRow.serviceCost,
    quoteRow.adultCost,
    quoteRow.unitCost,
    quoteRow.perPersonCost,
    quoteRow.routeProductUnitCost,
  ));
  const salePrice = numberOrNull(firstPresent(item.salePrice, item.referencePrice, item.minSale, quoteRow.salePrice));
  const adultCost = numberOrNull(firstPresent(item.adultCost, item.agencyAdult, quoteRow.adultCost, costPrice));
  const childCost = numberOrNull(firstPresent(item.childCost, item.agencyDiscount, quoteRow.childCost));
  const sourceKey = body.sourceKey || stableSourceKey(["quote-manual", category, city, name, serviceType, route, model, spec]);
  const now = new Date().toISOString();
  return {
    source_key: sourceKey,
    category,
    city,
    name,
    service_type: serviceType,
    route,
    model,
    spec,
    supplier_name: firstPresent(item.supplierName, quoteRow.supplierName, "待绑定供应商"),
    cost_price: costPrice,
    sale_price: salePrice,
    low_season_cost: numberOrNull(firstPresent(item.lowSeasonCost, quoteRow.lowSeasonCost)),
    high_season_cost: numberOrNull(firstPresent(item.highSeasonCost, quoteRow.highSeasonCost)),
    adult_cost: adultCost,
    child_cost: childCost,
    pricing_unit: firstPresent(item.pricingUnit, quoteRow.pricingUnit, category === "酒店" ? "间夜" : category === "餐厅" || category === "餐" ? "人" : "次"),
    status: body.status || (costPrice == null ? "待补成本" : "OP补录待复核"),
    source: "报价台补录",
    source_sheet: "quote-workbench",
    source_row: null,
    raw_fields: {
      quoteItem: item,
      quoteRow,
    },
    extra_fields: {
      createdFrom: "quote_missing_cost",
      actor: body.actor || "",
      projectId: body.projectId || "",
      quoteService: body.service || "",
      quoteRowIndex: body.index ?? "",
      reviewStatus: "op_submitted",
      note: body.note || "",
    },
    quality_flags: [],
    published_version: "quote-manual-v1",
    is_published: true,
    updated_at: now,
  };
}

function normalizeApiSearchText(value) {
  return String(value || "").trim().replace(/[(),]/g, " ").replace(/\s+/g, " ");
}

function productResourceMatchScore(resource = {}, query = {}) {
  let score = 0;
  const routeText = normalizeApiSearchText(query.route || query.name || query.productName || "");
  const routeMatch = productResourceRouteMatch(resource, routeText);
  if (query.city && resource.city === query.city) score += 30;
  if (query.category && resource.category === query.category) score += 20;
  if (query.serviceType && resource.service_type === query.serviceType) score += 20;
  if (query.model && resource.model === query.model) score += 15;
  if (routeMatch.hasRoute && routeMatch.matched) score += routeMatch.score;
  if (routeMatch.hasRoute && !routeMatch.matched) score = Math.min(score, 79);
  if (!routeMatch.hasRoute && score > 0) score += 5;
  return Math.min(score, 100);
}

function compactApiMatchText(value) {
  return normalizeApiSearchText(value).toLowerCase().replace(/\s+/g, "");
}

function routeFamiliesFromText(value) {
  const text = compactApiMatchText(value);
  const families = new Set();
  if (/机场|airport|接机|送机|接送机|大兴|首都/.test(text)) families.add("airport");
  if (/高铁|火车站|station|接站|送站|接送站/.test(text)) families.add("station");
  if (/市内|市区|本地游|一日游|8小时|八小时|9小时|九小时/.test(text)) families.add("city_day");
  if (/武隆/.test(text)) families.add("wulong");
  return families;
}

function hasRouteFamilyOverlap(left, right) {
  const leftFamilies = routeFamiliesFromText(left);
  const rightFamilies = routeFamiliesFromText(right);
  for (const family of leftFamilies) {
    if (rightFamilies.has(family)) return true;
  }
  return false;
}

function productResourceRouteMatch(resource = {}, routeText = "") {
  const queryRoute = compactApiMatchText(routeText);
  if (!queryRoute) return { hasRoute: false, matched: true, score: 0 };
  const resourceRoute = compactApiMatchText(resource.route || "");
  const resourceText = compactApiMatchText([resource.name, resource.route, resource.spec].filter(Boolean).join(" "));
  if (resourceText.includes(queryRoute) || (resourceRoute && queryRoute.includes(resourceRoute))) {
    return { hasRoute: true, matched: true, score: 25 };
  }
  if (hasRouteFamilyOverlap(queryRoute, resourceText)) {
    return { hasRoute: true, matched: true, score: 18 };
  }
  return { hasRoute: true, matched: false, score: 0 };
}

function productResourceMatchReason(status, resource, query) {
  if (status === "unmatched") return "云端产品库无匹配资源";
  if (status === "need_confirm" && resource?.cost_price == null) return "命中候选资源，但成本为空";
  if (status === "need_confirm") return "命中候选资源，但路线或规格需要确认";
  return `命中云端产品库：${resource?.name || query.name || ""}`;
}

function normalizeProductResourceApiFields(resource = {}) {
  return {
    ...resource,
    sourceKey: resource.source_key ?? resource.sourceKey ?? "",
    serviceType: resource.service_type ?? resource.serviceType ?? "",
    supplierName: resource.supplier_name ?? resource.supplierName ?? "",
    costPrice: resource.cost_price ?? resource.costPrice ?? null,
    salePrice: resource.sale_price ?? resource.salePrice ?? null,
    lowSeasonCost: resource.low_season_cost ?? resource.lowSeasonCost ?? null,
    highSeasonCost: resource.high_season_cost ?? resource.highSeasonCost ?? null,
    adultCost: resource.adult_cost ?? resource.adultCost ?? null,
    childCost: resource.child_cost ?? resource.childCost ?? null,
    pricingUnit: resource.pricing_unit ?? resource.pricingUnit ?? "",
    sourceSheet: resource.source_sheet ?? resource.sourceSheet ?? "",
    sourceRow: resource.source_row ?? resource.sourceRow ?? null,
    rawFields: resource.raw_fields ?? resource.rawFields ?? {},
    extraFields: resource.extra_fields ?? resource.extraFields ?? {},
    qualityFlags: resource.quality_flags ?? resource.qualityFlags ?? [],
    publishedVersion: resource.published_version ?? resource.publishedVersion ?? "",
  };
}

function normalizeProductImportBatchApiFields(batch = {}) {
  return {
    ...batch,
    sourceFile: batch.source_file ?? batch.sourceFile ?? "",
    sourceVersion: batch.source_version ?? batch.sourceVersion ?? "",
    qualityReport: batch.quality_report ?? batch.qualityReport ?? null,
    publishedAt: batch.published_at ?? batch.publishedAt ?? null,
    createdAt: batch.created_at ?? batch.createdAt ?? null,
  };
}

async function handleSaveAiSettings(req, res) {
  try {
    const body = await readJsonBody(req);
    const current = readRuntimeSettings();
    if (body.clear) {
      delete current.ai;
      writeRuntimeSettings(current);
      sendJson(res, 200, { ai: publicAiConfig(), message: "AI 配置已清除" });
      return;
    }
    const next = sanitizeAiInput(body);
    if (!next.apiKey && current.ai?.apiKey) next.apiKey = current.ai.apiKey;
    if (!next.apiKey && !process.env.AI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
      sendJson(res, 400, { error: "请填写 API Key" });
      return;
    }
    current.ai = next;
    writeRuntimeSettings(current);
    sendJson(res, 200, { ai: publicAiConfig(), message: "AI 配置已保存" });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "保存 AI 配置失败" });
  }
}

async function handleTestAiSettings(req, res) {
  try {
    const body = await readJsonBody(req);
    const saved = readAiConfig();
    const candidate = sanitizeAiInput({ ...saved, ...body, apiKey: body.apiKey || saved.apiKey });
    if (!candidate.apiKey) {
      sendJson(res, 400, { error: "请先到系统设置配置 API Key" });
      return;
    }
    const response = await fetch(`${candidate.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidate.apiKey}`,
      },
      body: JSON.stringify({
        model: candidate.model,
        temperature: Number(candidate.temperature),
        messages: [
          { role: "system", content: "You are a connection test assistant. Reply with OK." },
          { role: "user", content: "Connection test. Reply OK only." },
        ],
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      sendJson(res, response.status, { error: result.error?.message || "模型连接测试失败" });
      return;
    }
    sendJson(res, 200, { ok: true, model: result.model || candidate.model, message: "模型连接正常" });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "模型连接测试失败" });
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json;charset=utf-8" });
  res.end(JSON.stringify(data));
}

if (!process.env.VERCEL) {
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the other process and try again.`);
    } else {
      console.error(error);
    }

    process.exit(1);
  });

  server.listen(port, host, () => {
    console.log(`Travel workbench running at http://${host}:${port}`);
  });
}

requestHandler.productResourceMatchScore = productResourceMatchScore;
requestHandler.productResourceRouteMatch = productResourceRouteMatch;
requestHandler.productResourceMatchReason = productResourceMatchReason;
requestHandler.normalizeQuoteProductResourcePayload = normalizeQuoteProductResourcePayload;
requestHandler.upsertManualProductResource = upsertManualProductResource;
requestHandler.readManualProductResources = readManualProductResources;
requestHandler.filterManualProductResources = filterManualProductResources;

module.exports = requestHandler;
