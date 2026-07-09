#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

function gitLines(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function gitText(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function normalizeToCurrentProject(file) {
  const prefix = gitText(["rev-parse", "--show-prefix"]);
  if (prefix && file.startsWith(prefix)) return file.slice(prefix.length);
  return file;
}

function collectChangedFiles() {
  return unique([
    ...gitLines(["diff", "--name-only"]),
    ...gitLines(["diff", "--name-only", "--cached"]),
    ...gitLines(["ls-files", "--others", "--exclude-standard"]),
  ].map(normalizeToCurrentProject));
}

function matches(file, pattern) {
  if (typeof pattern === "string") return file === pattern || file.startsWith(pattern.replace(/\*\*$/, ""));
  return pattern.test(file);
}

function addCommand(commands, command) {
  if (!commands.includes(command)) commands.push(command);
}

function detect(files) {
  const commands = [];
  const manualChecks = [];
  const notes = [];
  const blockers = [];
  let riskLevel = "low";

  const hasEnvChange = files.some((file) => /(^|\/)\.env(\.|$)/.test(file) || file === "runtime-settings.json");
  if (hasEnvChange) {
    blockers.push("Sensitive environment file changed. Stop and ask for human confirmation.");
    riskLevel = "blocked";
  }

  if (files.some((file) => matches(file, "app.js"))) {
    addCommand(commands, "node --check app.js");
    addCommand(commands, "node --test tests/*.test.js");
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
  }

  if (files.some((file) => matches(file, "server.js"))) {
    addCommand(commands, "node --check server.js");
    addCommand(commands, "node --test tests/*.test.js");
    manualChecks.push("API smoke: curl -I --max-time 2 http://127.0.0.1:8787/");
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
  }

  if (files.some((file) => file.startsWith("data/products/") || file.startsWith("scripts/build-system-product-catalog"))) {
    addCommand(commands, "node --test tests/product-catalog-import.test.js");
    manualChecks.push("Verify product catalog counts and key city cost cases.");
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
  }

  if (files.some((file) => file.startsWith("tests/"))) {
    addCommand(commands, "node --test tests/*.test.js");
  }

  if (files.some((file) => file.startsWith("public/js/"))) {
    manualChecks.push("Run node --check for changed public/js files.");
    addCommand(commands, "node --test tests/*.test.js");
  }

  if (files.some((file) => file === "db/schema.sql" || file.startsWith("db/migrations/"))) {
    manualChecks.push("Database schema or migration changed. Human approval required before executing any migration.");
    riskLevel = "high";
  }

  if (files.some((file) => file.startsWith("scripts/ai/"))) {
    files.filter((file) => file.startsWith("scripts/ai/") && file.endsWith(".mjs")).forEach((file) => {
      addCommand(commands, `node --check ${file}`);
    });
  }

  const codeLikeFiles = files.filter((file) => /\.(js|mjs|cjs)$/.test(file) && !file.startsWith("node_modules/"));
  codeLikeFiles.forEach((file) => {
    if (existsSync(file) && !commands.includes(`node --check ${file}`) && !file.startsWith("tests/")) {
      addCommand(commands, `node --check ${file}`);
    }
  });

  const docsOnly = files.length > 0 && files.every((file) => (
    file.startsWith("docs/")
    || file.startsWith(".ai/")
    || file.startsWith("goals/")
    || file === "CLAUDE.md"
    || file === "README.md"
  ));

  if (docsOnly) {
    notes.push("Docs/workflow-only change. Business tests are optional unless reviewers request a full regression.");
    manualChecks.push("Confirm all expected docs and workflow files exist.");
  }

  if (!files.length) notes.push("No changed files detected.");

  return {
    changedFiles: files,
    blocked: blockers.length > 0,
    riskLevel,
    requiredCommands: commands,
    manualChecks,
    blockers,
    notes,
  };
}

const result = detect(collectChangedFiles());
console.log(JSON.stringify(result, null, 2));
if (result.blocked) process.exitCode = 2;
