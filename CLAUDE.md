# CLAUDE.md

See **AGENTS.md** for attribution and confidentiality rules. They apply to every Claude Code session.

## Project

PeerPulse: decentralised parallel vote tabulation for Android. Citizens photograph, sign, and publish polling station results on election day without trusting any central authority.

First deployment: **Kenya General Election, August 10, 2027.**
Hard deadline: signed APK in civil society hands by **October 2026.**

## Monorepo layout

```
apps/mobile/          Expo / React Native 0.79 (Android-only)
apps/node/            Sovereign relay — Node.js + libp2p
apps/web/             Public website — Next.js 15 App Router
packages/core/        Shared types, packet definitions, validation
packages/crypto/      Ed25519 signing primitives
docker/android-build/ Docker image for APK builds — no EAS cloud
docs/                 Specs, product docs, outreach
spec-v6.md            Canonical protocol specification
```

## Tech stack

| Layer | Tech |
|---|---|
| Mobile | Expo / React Native 0.79, Android-only |
| P2P | libp2p v3, GossipSub, Circuit Relay v2 |
| Crypto | Ed25519 via @noble/curves, SHA-256 |
| Relay | Node.js, libp2p, SQLite (better-sqlite3) |
| Website | Next.js 15 App Router, Tailwind |
| Build | pnpm workspaces, Turborepo |
| TypeScript | strict mode, `moduleResolution: node` in mobile |

## Commands

```bash
pnpm install                           # install all workspaces
pnpm turbo run typecheck               # typecheck all packages
pnpm --filter @peerpulse/node dev      # relay on :9876
pnpm --filter @peerpulse/mobile start  # expo start
pnpm --filter @peerpulse/web dev       # next dev on :3000
```

## Build gates (current priority order)

| Gate | Week | Status | What it proves |
|---|---|---|---|
| Gate 0 | 1 | Done | Physical Android device connects to relay |
| Gate 1 | 4 | Next | Two phones gossip over local Wi-Fi, no internet |
| Gate 5 | 6 | — | TEE hardware attestation on physical device |
| Gate 2 | 7 | — | Two phones BLE-attest each other at a station |
| Gate 3 | 9 | — | Full tally on IPFS, visible on relay |

## Key constraints

- No EAS cloud. Android builds use Docker only (`docker/android-build/`).
- No Google Play. Distribution via F-Droid and direct APK.
- App must work with no internet — Bluetooth + local Wi-Fi gossip only.
- Pseudonymous operation. No public attribution through first election.

