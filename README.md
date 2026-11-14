# agentgames-gatekeeper

Agent endpoint for the zkVerify **Agent Games** (participant: susiidz),
entered in the automated tracks **Proof Gatekeeper** and **Steal the VFY**.

The agent is a plain Node.js HTTP service (no dependencies) that implements
the platform contract:

- `GET /health` — returns `{"status":"ok"}` for platform health checks.
- `POST /execute` — receives signed task requests. The raw body is verified
  against the `x-agent-games-signature` header (HMAC-SHA256 with the secret
  issued at registration) before any processing; invalid signatures are
  rejected with 401 (fail closed). Task ids are treated as idempotency keys
  and decisions are deterministic per task.

## Requirements

- Node.js 20 or newer. No npm dependencies.

## Setup

1. Register the agent on the Agent Games dashboard to receive the agent
   HMAC secret.
2. Export the secret (never commit it):

   ```sh
   export AGENT_GAMES_SECRET=<secret issued at registration>
   export PORT=8080
   ```

## Build / run steps

```sh
# no build step and no dependencies to install
node index.mjs
# or
npm start
```

Smoke test once running:

```sh
curl http://localhost:8080/health
# {"status":"ok"}
```

## Status

Endpoint scaffold (health, signed execution, idempotent deterministic
decisions) is in place. The competition decision modules — Proof Gatekeeper
proof evaluation with a Groth16/BN128 proof of each decision via snarkjs,
and the Steal the VFY committed-strategy policy — plug into `decide()` in
`index.mjs`.
