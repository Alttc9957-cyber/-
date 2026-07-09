#!/usr/bin/env node
import { execFileSync } from "node:child_process";

function git(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch (error) {
    return error.message;
  }
}

const branch = git(["branch", "--show-current"]);
const status = git(["status", "--short", "--branch"]);
const stat = git(["diff", "--stat"]);
const trackedFiles = git(["diff", "--name-only"]);
const untrackedFiles = git(["ls-files", "--others", "--exclude-standard"]);
const files = [trackedFiles, untrackedFiles].filter(Boolean).join("\n");

console.log(`# PR Summary Draft\n`);
console.log(`Branch: ${branch || "(unknown)"}`);
console.log(`\n## Status\n\n\`\`\``);
console.log(status || "(clean)");
console.log(`\`\`\``);
console.log(`\n## Changed Files\n`);
if (files) files.split(/\r?\n/).forEach((file) => console.log(`- ${file}`));
else console.log(`- No tracked diff files.`);
console.log(`\n## Diff Stat\n\n\`\`\``);
console.log(stat || "(no tracked diff)");
console.log(`\`\`\``);
console.log(`\n## Verification\n`);
console.log(`- Run \`node scripts/ai/verify-module.mjs\` before handoff.`);
console.log(`- Run task-specific checks from .ai/tasks/<id>.yml.`);
console.log(`\n## Risk Notes\n`);
console.log(`- Confirm no .env, service role key, runtime settings, or production secret is staged.`);
console.log(`- Confirm database migrations were not executed without explicit approval.`);
