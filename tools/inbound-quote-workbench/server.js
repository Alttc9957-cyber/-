const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const host = "127.0.0.1";
const port = 8787;
const runtimeSettingsPath = path.join(root, "runtime-settings.json");
loadLocalEnv(path.join(root, ".env"));

const types = {
  ".html": "text/html;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".js": "application/javascript;charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const server = http.createServer(async (req, res) => {
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

  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.resolve(root, `.${urlPath}`);
  if (!filePath.startsWith(root)) {
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
});

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
      sendJson(res, 400, { error: "请先到系统设置配置 API Key" });
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
      sendJson(res, response.status, { error: result.error?.message || "DeepSeek request failed", raw: result });
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

function defaultAiSettings() {
  return {
    provider: "deepseek",
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
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    temperature: Number(process.env.DEEPSEEK_TEMPERATURE || 0.2),
    provider: "deepseek",
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
  const source = runtime.apiKey ? "runtime-settings" : (process.env.DEEPSEEK_API_KEY ? ".env" : "missing");
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

function maskApiKey(apiKey) {
  if (!apiKey) return "";
  const tail = apiKey.slice(-4);
  return `sk-****${tail}`;
}

function sanitizeAiInput(input = {}) {
  return {
    provider: "deepseek",
    apiKey: String(input.apiKey || "").trim(),
    baseUrl: String(input.baseUrl || "https://api.deepseek.com").trim().replace(/\/$/, ""),
    model: String(input.model || "deepseek-chat").trim(),
    temperature: Math.min(Math.max(Number(input.temperature ?? 0.2), 0), 1),
  };
}

function handleGetSettings(res) {
  sendJson(res, 200, { ai: publicAiConfig() });
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
    if (!next.apiKey && !process.env.DEEPSEEK_API_KEY) {
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
