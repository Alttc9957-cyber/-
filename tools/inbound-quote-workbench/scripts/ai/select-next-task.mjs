#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function read(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function parseSimpleYaml(text) {
  const result = {};
  text.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) return;
    const value = match[2].trim();
    result[match[1]] = value === "true" ? true : value === "false" ? false : value;
  });
  return result;
}

function taskFiles() {
  const dir = ".ai/tasks";
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".yml") && name !== "task-template.yml")
    .map((name) => join(dir, name));
}

const nextActions = read("docs/NEXT_ACTIONS.md");
const projectStatus = read("docs/PROJECT_STATUS.md");
const tasks = taskFiles().map((file) => ({ file, ...parseSimpleYaml(read(file)) }));
const approvedOpenTask = tasks.find((task) => task.approved === true && !/complete|done|closed/i.test(String(task.status || "")));

const reasons = [];
let recommendation = "A2 产品库真实数据修复与成本可信化";

if (approvedOpenTask) {
  recommendation = `${approvedOpenTask.id || approvedOpenTask.file} ${approvedOpenTask.title || ""}`.trim();
  reasons.push("There is an approved task that is not marked complete, so continue the current module first.");
} else {
  reasons.push("No approved open task file was found.");
}

if (/产品库|成本|缺成本|报价/.test(nextActions + projectStatus)) {
  reasons.push("Product catalog and quote cost trust still appear in project planning docs.");
}

reasons.push("Do not enter boss dashboard before quote system and product costs are stable.");
reasons.push("Do not enter the large order loop before product catalog costs are stable.");
reasons.push("After order minimum loop, move to permissions; after permissions, move to boss dashboard.");
reasons.push("Database migration, live cloud data, and secrets require human confirmation.");

console.log(`# Next Task Recommendation\n`);
console.log(`Recommended: ${recommendation}\n`);
console.log(`## Reasons`);
reasons.forEach((reason) => console.log(`- ${reason}`));
console.log(`\n## Candidate Order`);
console.log(`1. A2 产品库真实数据修复与成本可信化`);
console.log(`2. A3 一键同步产品库草稿闭环`);
console.log(`3. B1 订单管理最小闭环`);
console.log(`4. C1 登录与权限管理最小闭环`);
console.log(`5. 老板看板 only after quote, product costs, order minimum loop, and permissions are stable`);
