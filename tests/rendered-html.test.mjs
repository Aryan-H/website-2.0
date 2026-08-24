import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders Aryan's portfolio shell and essential content", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Aryan Hussain — Software Engineer<\/title>/i);
  assert.match(html, /Software engineer building intelligent products/i);
  assert.match(html, /Open to 2027 new-grad software engineering opportunities/i);
  assert.match(html, /Quick View/i);
  assert.match(html, /UofTMarket/i);
  assert.match(html, /My apartment/i);
  assert.match(html, /Shopify office/i);
  assert.match(html, /Harvourfront/i);
  assert.match(html, /aryan-hussain-resume\.pdf/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});
