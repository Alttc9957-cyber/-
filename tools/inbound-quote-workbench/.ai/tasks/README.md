# AI Task Files

Each approved module should have one task file in this directory.

Workflow:

1. Planner creates `.ai/tasks/<id>.yml` from user feedback and docs.
2. User approves the module, not every small subtask.
3. Coder works inside the task boundary.
4. QA runs required verification.
5. Reviewer checks diff and redlines.
6. Release writes the handoff report and package.

Use `task-template.yml` as the starting point.

Do not store secrets or API keys in task files.
