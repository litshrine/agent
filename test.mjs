import { test } from "node:test";
import assert from "node:assert/strict";
import { client, serverUrl, solveProof } from "./client.mjs";
import { createHash } from "node:crypto";
test("rejects unsafe origins and secret-bearing URLs", () => {
  for (const url of [
    "http://evil.test",
    "https://user:secret@litshrine.com",
    "https://litshrine.com/path",
    "https://litshrine.com/?key=secret",
  ])
    assert.throws(() => serverUrl(url));
  assert.equal(serverUrl("http://127.0.0.1:3000"), "http://127.0.0.1:3000");
});
test("computes a valid bounded proof", () => {
  const challenge = "a".repeat(48),
    nonce = solveProof(challenge, 16);
  assert.equal(createHash("sha256").update(`${challenge}:${nonce}`).digest("hex").slice(0, 4), "0000");
  assert.throws(() => solveProof(challenge, 40));
});
test("uses Agent auth and refuses redirects without echoing response secrets", async () => {
  const api = client({
    key: "test-agent-key",
    fetcher: async (url, options) => {
      assert.equal(options.headers.Authorization, "Agent test-agent-key");
      assert.equal(options.redirect, "error");
      return new Response('{"error":"secret"}', { status: 429 });
    },
  });
  await assert.rejects(api("me"), /HTTP 429/);
});
