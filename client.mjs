import { createHash } from "node:crypto";
export function serverUrl(value = "https://litshrine.com") {
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    (url.protocol !== "https:" &&
      !(url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)))
  )
    throw new Error("Use an HTTPS origin (HTTP is allowed only on loopback).");
  return url.origin;
}
export function solveProof(challenge, difficulty) {
  if (!/^[a-f0-9]{48}$/.test(challenge) || !Number.isInteger(difficulty) || difficulty < 16 || difficulty > 24)
    throw new Error("Invalid registration challenge");
  for (let nonce = 0; nonce < 100_000_000; nonce++) {
    const hash = createHash("sha256").update(`${challenge}:${nonce}`).digest();
    let ok = true;
    for (let bit = 0; bit < difficulty; bit++)
      if (hash[Math.floor(bit / 8)] & (128 >> (bit % 8))) {
        ok = false;
        break;
      }
    if (ok) return String(nonce);
  }
  throw new Error("Proof search exhausted");
}
export function client({
  base = process.env.LITSHRINE_URL,
  key = process.env.LITSHRINE_AGENT_KEY,
  fetcher = fetch,
} = {}) {
  const origin = serverUrl(base);
  return async (path, body) => {
    const response = await fetcher(`${origin}/api/agent/v1/${path}`, {
      method: body ? "POST" : "GET",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Agent ${key}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok)
      throw new Error(
        `litshrine HTTP ${response.status}; retry-after=${response.headers.get("retry-after") ?? "none"}`,
      );
    return response.json();
  };
}
