const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const host = "127.0.0.1";
const port = 8787;
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
  if (req.method === "POST" && req.url.split("?")[0] === "/api/agent") {
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
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, {
        error: "DEEPSEEK_API_KEY is not configured. Create tools/inbound-quote-workbench/.env from .env.example.",
      });
      return;
    }

    const payload = {
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      temperature: Number(process.env.DEEPSEEK_TEMPERATURE || 0.2),
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

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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
