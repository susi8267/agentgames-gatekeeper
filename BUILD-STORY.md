# Proof Gatekeeper: Building an Agent That Proves Its Decisions

*My entry story for the zkVerify Agent Games — Proof Gatekeeper track. #AgentGames*

## Why I built this

AI agents are starting to move money, release payments, and sign off on conditions. The obvious question is: why should anyone trust an agent's say-so?

I entered the @ZKVProtocol Agent Games with an agent built around the opposite idea — **don't trust the agent, verify the proof**. My agent, Susiidz Gatekeeper, judges whether a payment condition is truly met, and it backs every single verdict with a zero-knowledge proof that anyone can check independently.

## What the agent does

Tasks arrive as signed requests. Each task describes a payment condition: a verification key the proof must match, a minimum balance that must be met, a recipient that must match the condition, an expiry block, and a maximum transfer amount. The agent evaluates the condition and answers APPROVE or REJECT — with a reason, and with a proof.

The checks, in order:

1. **Verification key match** — the proof's key must equal the registered key (VK_SUBSTITUTION trap).
2. **Proof reuse** — a proof seen before is rejected outright (PROOF_REUSED trap).
3. **Balance threshold** — the public balance must reach the required minimum (THRESHOLD_MISMATCH trap).
4. **Recipient match** — the transfer recipient must equal the condition recipient (RECIPIENT_MISMATCH trap).
5. **Expiry** — the current block must be strictly before the expiry block (EXPIRED_CONDITION trap).
6. **Amount cap** — the amount must not exceed the maximum transfer (AMOUNT_OVERFLOW trap).

Every trap maps to a precise REJECT reason code instead of a vague "no", so a rejection is itself auditable information.

## The zero-knowledge core

The decision is encoded as 13 signals and proven with a Groth16 proof on BN128. Twelve signals are public — including a commitment, both verification-key hashes, the threshold, balance, blocks, recipient, amount, the decision itself, and the task id — and one signal, a fresh random salt, stays private.

The part I care most about: **the agent verifies its own proof before answering**. If the proof doesn't verify against the verification key, the answer doesn't ship. No proof, no trust — enforced by the code path, not by policy.

For competition tasks, proofs are submitted on-chain via Kurier to the zkVerify mainnet for finalization. Practice tasks run the exact same code path — proofs are generated and self-verified identically — they just aren't finalized on-chain.

## Keeping it alive

A gatekeeper that sleeps through a task scores worse than one that answers wrong, so uptime was a real design constraint. I learned the hard way that free tunnels expire and free hosts sleep — both cost tasks. The agent now runs 24/7 on a permanent endpoint, answers preflight health checks in about half a second, and returned correct decisions with VERIFIED proofs in roughly 1.4 seconds in practice rounds. Its first scored round ran on 15 November 2026.

## Also in the Games: Contract Guard

For the Wildcard track I built a second, smaller agent: **Contract Guard**, a read-only service that scores any BSC contract address — bytecode present or not, Sourcify verification status, owner and paused state — and returns a 0–100 risk score with explained reasons. Same philosophy, different surface: check before you trust.

- Contract Guard (live): https://susiidz-contract-guard.vercel.app
- Contract Guard source: https://github.com/susi8267/agentgames-contract-guard

## The takeaway

Verifiable agents aren't about smarter models — they're about accountable outputs. A decision you can check beats a decision you have to believe. That's the future @ZKVProtocol is building toward, and it was a pleasure to build in the open for the Agent Games.

— susi (@susiidz), Indonesia
