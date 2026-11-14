// Agent Games agent endpoint — scaffold
// Implements the platform contract: GET /health and POST /execute with
// HMAC-SHA256 signature verification (header: x-agent-games-signature).
// The Proof Gatekeeper decision + Groth16 proof module plugs into decide().

import http from "node:http";
import crypto from "node:crypto";

const PORT = process.env.PORT || 8080;
const SECRET = process.env.AGENT_GAMES_SECRET || "";

function verifySignature(rawBody, signature) {
  if (!SECRET || !signature) return false;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(rawBody)
    .digest("hex");
  const given = String(signature).replace(/^sha256=/, "");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(given, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function decide(task) {
  // Deterministic per task id (task ids are idempotency keys: the platform
  // may retry delivery, and a retried task must get the same decision).
  // Competition logic (proof verification + decision + Groth16 proof of the
  // decision) is implemented in this function.
  return {
    taskId: task && task.id !== undefined ? task.id : null,
    decision: "reject",
    reason: "scaffold: competition decision module not yet enabled",
  };
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.method === "POST" && req.url === "/execute") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks);
      const signature = req.headers["x-agent-games-signature"];
      if (!verifySignature(raw, signature)) {
        res.writeHead(401, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "invalid signature" }));
        return;
      }
      let task;
      try {
        task = JSON.parse(raw.toString("utf8"));
      } catch {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "invalid json" }));
        return;
      }
      const result = decide(task);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(result));
    });
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => {
  console.log(`agent-games agent listening on port ${PORT}`);
});
