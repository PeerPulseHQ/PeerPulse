<p align="center">
  <img src="brand/logo/peerpulse-lockup.svg" alt="PeerPulse" width="380">
</p>

# PeerPulse

Decentralised election verification for Android. Citizens use their phones to independently count, sign, and publish polling station results without trusting any government, corporation, or central server.

On election day, the app uses Bluetooth Low Energy to cryptographically attest co-presence of other citizens at the same polling station, photographs the official results sheet, and submits a signed tally over libp2p. The network aggregates thousands of these in real time. When the parallel count matches the official result, the win is unimpeachable. When it doesn't, the world knows.

First deployment: **Kenya General Election, 10 August 2027.**

## The four pillars

| Pillar | What it does |
|---|---|
| **Elections** | Citizens independently count and co-sign official tallies at polling stations |
| **Surveys**   | Governments and accredited organisations publish targeted opinion surveys to opted-in citizens |
| **Journal**   | AI-extracted neutral summaries of parliamentary debates, court rulings, executive orders, and budgets — with citations to primary sources |
| **Learn**     | Civic education modules and quizzes — know your rights, understand parliamentary process |

Elections is the launch pillar; the rest layer in across V2–V4. See [`docs/product/product-overview.md`](./docs/product/product-overview.md) for the full breakdown.

## Repository layout

```
apps/mobile/          Expo / React Native 0.79 (Android)
apps/node/            Sovereign Relay — Node.js + libp2p + HTTP/SSE gateway
apps/web/             Public website + protocol playground — Next.js 15
packages/core/        Shared types, packet schema, validation, dispute resolution
docker/android-build/ Docker image for reproducible APK builds (no EAS, no cloud)
docs/                 Protocol specs, product docs, outreach
scripts/              Pseudonymous contributor setup (persona + SSH)
```

## Building

Requirements: Node 22, pnpm 10.32.1, Docker (for Android builds).

```bash
pnpm install                            # install all workspaces + generate persona
pnpm typecheck                          # typecheck everything
pnpm --filter @peerpulse/node dev       # relay on :9090 (libp2p WS) + :9876 (HTTP)
pnpm --filter @peerpulse/web dev        # website + playground on :3000
pnpm --filter @peerpulse/mobile start   # Expo dev server
```

Build a debug APK (no EAS, no cloud):

```bash
./docker/android-build/build-debug.sh
# → build/apk/peerpulse-dev.apk
```

## Tech stack

| Layer | Technology |
|---|---|
| Mobile     | Expo / React Native 0.79, Android-only (`minSdkVersion 24`) |
| P2P        | libp2p v3, GossipSub, Circuit Relay v2, mDNS |
| Crypto     | Ed25519 (`@noble/curves`), SHA-256, Android Keystore TEE attestation |
| Relay      | Node.js 22, libp2p, SQLite (`better-sqlite3`), HTTP info + SSE gateway |
| Website    | Next.js 15 App Router, marked + mermaid for the whitepaper, `marked` v16 |
| Build      | pnpm workspaces, Turborepo, Docker (Android SDK + NDK r25c) |
| TypeScript | 5.x strict, `moduleResolution: node` in mobile, ES2022 elsewhere |

## Protocol playground

`/playground` on the website is a working libp2p peer in the browser. Run the relay locally, open the page in two browsers (or laptop + phone on the same Wi-Fi), and watch signed `IntentPacket`s gossip across the mesh in real time. See [`apps/web/app/playground/page.tsx`](./apps/web/app/playground/page.tsx) for a reference implementation of a minimal libp2p client.

Mobile has a parallel playground screen that uses the relay's HTTP API (lighter than the full libp2p stack for demo purposes).

## Trust model snapshot

| Tier | Base weight | Who |
|---:|---:|---|
| 🥇 Gold        | 1000 | Electoral commissions, official state bodies |
| 🔵 Organisation | 500 | NGOs, accredited media, registered political parties |
| 🟢 Green       |  100 | Citizens with a valid BLE WitnessBundle (scales with co-witness count) |
| 🟡 Yellow      |    1 | Citizens with no BLE attestation |

15 honest TEE-attested citizens can decisively override a contradicting Gold submission via `CITIZEN-CONFIRMED`. See [`docs/product/tabulate/spec-trust.md`](./docs/product/tabulate/spec-trust.md) for the full weight formula, dispute algorithm, and confirmation state machine.

## Contributing

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full guide (workflow, code style, security disclosure, hard rules) and [`AGENTS.md`](./AGENTS.md) for AI-agent-specific rules before opening a PR.

On your first `pnpm install`, the postinstall script asks how you'd like to identify in commits:

- **Pseudonym** (default, recommended) — a per-machine identity is generated for you (e.g. *Slick Cipher*, *Lucky Hash*). The right choice if you live in or near a target jurisdiction (Kenya, Nigeria, DRC, Uganda, Philippines, Indonesia), if you're in a profession that could be pressured, or if you prefer privacy. The script also sets up a dedicated SSH key at `~/.ssh/id_peerpulse`, adds a `Host github-peerpulse` alias to `~/.ssh/config`, and rewrites the `origin` remote to use it.
- **Named contributor** (opt-in) — you commit under your real name and email. The right choice if you're outside target jurisdictions, not professionally at risk, and accept that public association with PeerPulse may attract attention from hostile state actors or press. No pseudonymous SSH key is set up — use your existing GitHub auth.

Whichever you pick is saved to `~/.peerpulse-persona.json`. Back it up to keep the same identity across machines; delete it to be asked again. Non-interactive shells (CI, sandboxes) silently default to pseudonym.

The project's *collective* identity is always "PeerPulse contributors" (press, external docs, anything attributed at the project level), regardless of how individual contributors identify in commits.

To re-run the SSH/remote setup standalone (new machine, lost key, or to add the pseudonymous alias as a named contributor):

```bash
pnpm run setup:contributor
```

**Hard rules** (also in `AGENTS.md`):

- No AI attribution in commit messages or code. No `Co-Authored-By`, `Generated-By`, or similar trailers.
- Do not commit anything containing credentials (`.env`, key material, ProtonMail tokens).
- Named contribution is a one-way door — once your real name is in the git history, it stays there. If uncertain, pick pseudonym.

## Documentation

### Protocol & trust
- [`docs/product/whitepaper.md`](./docs/product/whitepaper.md) — v7.0 whitepaper (high-level overview, suitable for press / funders)
- [`docs/product/tabulate/spec-protocol.md`](./docs/product/tabulate/spec-protocol.md) — packet formats, topics, BLE ceremony, hardware attestation
- [`docs/product/tabulate/spec-trust.md`](./docs/product/tabulate/spec-trust.md) — trust tiers, PKI, dispute algorithm, confirmation state machine

### Product
- [`docs/product/product-overview.md`](./docs/product/product-overview.md) — four-pillar overview, tab order, build sequence
- [`docs/product/journal/spec-journal.md`](./docs/product/journal/spec-journal.md) — Journal (government proceedings extraction)
- [`docs/product/surveys/spec-surveys.md`](./docs/product/surveys/spec-surveys.md) — Surveys (targeted opinion polling)
- [`docs/product/spec-operations.md`](./docs/product/spec-operations.md) — election lifecycle, organisation onboarding, war-room SLAs
- [`docs/product/spec-strategy.md`](./docs/product/spec-strategy.md) — GTM, legal structure, operational security
- [`docs/product/spec-resilience.md`](./docs/product/spec-resilience.md) — legitimacy inversion, shutdown boomerang, ban resistance
- [`docs/product/elections-pipeline.md`](./docs/product/elections-pipeline.md) — seeded election calendar through 2031

## License

[MIT](./LICENSE). The protocol specification, application source code, and whitepaper are published for public review and independent implementation. No entity controls the network.

## Contact

`press@peerpulse.app` (ProtonMail). SimpleX for operational discussion — contact details on request.
