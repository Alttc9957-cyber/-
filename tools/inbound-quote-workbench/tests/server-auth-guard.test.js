const assert = require("node:assert/strict");
const test = require("node:test");

process.env.VERCEL = "1";
const server = require("../server.js");

function mockResponse() {
  return {
    status: 0,
    body: null,
    writeHead(status) {
      this.status = status;
    },
    end(payload) {
      this.body = payload ? JSON.parse(payload) : null;
    },
  };
}

test("未传角色时服务端守卫拒绝敏感接口", () => {
  const req = { headers: {} };
  const res = mockResponse();

  assert.equal(server.requireApiRole(req, res, ["op"], "product-review:submit"), false);
  assert.equal(res.status, 401);
  assert.equal(res.body.code, "unauthenticated");
});

test("sales 不能审批产品补录", () => {
  const req = { headers: { "x-youyixing-role": "sales", "x-youyixing-user": "S-1" } };
  const res = mockResponse();

  assert.equal(server.requireApiRole(req, res, ["boss", "admin"], "product-review:approve"), false);
  assert.equal(res.status, 403);
  assert.equal(res.body.code, "forbidden");
});

test("boss 可以审批产品补录", () => {
  const req = { headers: { "x-youyixing-role": "boss", "x-youyixing-user": "B-1" } };
  const res = mockResponse();

  assert.equal(server.requireApiRole(req, res, ["boss", "admin"], "product-review:approve"), true);
  assert.equal(req.actor.role, "boss");
  assert.equal(req.actor.userId, "B-1");
});
