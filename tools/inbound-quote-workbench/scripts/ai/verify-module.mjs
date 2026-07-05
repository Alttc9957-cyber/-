#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const commands = [
  "git status --short --branch",
  "node --check app.js",
  "node --check server.js",
  "node --test tests/*.test.js",
];

function run(command) {
  console.log(`\n$ ${command}`);
  const result = spawnSync(command, {
    shell: true,
    stdio: "inherit",
  });
  return result.status ?? 1;
}

let failed = false;
for (const command of commands) {
  const status = run(command);
  if (status !== 0) failed = true;
}

console.log("\nService note: start local preview manually with `node server.js` when a browser check is needed. This script does not occupy port 8787.");

if (failed) {
  console.error("\nModule verification failed.");
  process.exit(1);
}

console.log("\nModule verification passed.");
