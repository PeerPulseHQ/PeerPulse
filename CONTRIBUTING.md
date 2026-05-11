# Contributing to PeerPulse

Thanks for picking this up. PeerPulse is election-integrity software shipping to contested environments — code review here is closer to *security review* than typical open-source. The bar is high and intentional. This document is the practical operating manual that complements [`README.md`](./README.md) (project overview) and [`AGENTS.md`](./AGENTS.md) (rules for AI coding agents).

## What you're getting into

PeerPulse runs on volunteer phones in Kenya, Nigeria, DRC, the Philippines, and elsewhere — on election day, in jurisdictions where party agents, security services, or aligned groups may try to interfere. The threat model is real. A bug here is not "users get a worse experience"; a bug here can be the difference between a credible parallel count and a discredited one.

Three things follow:

1. **Correctness over speed.** Don't ship a half-implemented protocol change.
2. **Pseudonymity is operational, not cosmetic.** Treat it like a security control, not a project quirk.
3. **Cryptographic primitives are not negotiable.** No "for now we'll skip signature verification." If something can't be done right, document why and gate it behind a feature flag.

## Choosing an identity

On your first `pnpm install`, the postinstall script asks you to choose one of two contributor identities:

| Path | Pick this if |
|---|---|
| **Pseudonym** (default, recommended) | You live in or near a target jurisdiction (Kenya, Nigeria, DRC, Uganda, Philippines, Indonesia), you're in a profession that could be pressured (lawyer, government employee, election official), you have family in any of those places, or you simply prefer privacy. |
| **Named contributor** (opt-in) | You're outside target jurisdictions, you're not professionally at risk, and you're comfortable that public association with PeerPulse may attract attention from hostile state actors or press in the future. You're trading some risk for the credibility your name lends to the project. |

**Both paths are first-class.** The project's *collective* identity is always "PeerPulse contributors" (press releases, external docs, anything attributed at the project level). The two paths only differ in how *your individual commits* appear in the git history.

Whichever you pick is persisted to `~/.peerpulse-persona.json`. Back this file up to keep the same identity across machines; delete it to be asked again on the next install.

**Important: named is a one-way door.** Once your real name appears in commit history, it stays there. You can't retroactively rewrite published history without coordinating a force-push with every other contributor. If you're uncertain, pick pseudonym; you can always re-engage under your real name on a separate machine later.

If the script doesn't ask (CI, sandbox, non-interactive shell) it silently defaults to pseudonym. To run the prompt yourself: `rm ~/.peerpulse-persona.json && node scripts/postinstall.mjs`.

### What the postinstall sets up

For pseudonym contributors:

- A generated persona at `~/.peerpulse-persona.json` (e.g. *Slick Cipher*)
- Local `git user.name` / `user.email` set to the persona
- An SSH key at `~/.ssh/id_peerpulse` and a `Host github-peerpulse` entry in `~/.ssh/config`
- The `origin` remote rewritten to use the pseudonymous host alias

For named contributors:

- The chosen real name + email persisted at `~/.peerpulse-persona.json`
- Local `git user.name` / `user.email` set to those values
- **No** pseudonymous SSH key, **no** alias, **no** remote rewrite — use your existing GitHub auth to push

If a named contributor later wants the pseudonymous SSH alias too (e.g. to push as a different identity for a specific commit set), they can run `pnpm run setup:contributor` standalone.

**Before you commit anything**, run `git config --local --get user.email` and confirm it shows what you expect. If it doesn't match your chosen identity, invoke the postinstall explicitly: `node scripts/postinstall.mjs`.

## Pseudonym discipline (pseudonymous contributors only)

If you chose the pseudonym path, the rest of this section applies. *Named contributors can skim it; the rules around AI attribution and credentials still apply to you, but the identity-leak considerations don't.*

Your individual identity is the persona. Your real name appears nowhere in the public repo or any external communication on the project's behalf.

| Surface | Show |
|---|---|
| Git commit author | Persona only |
| Git commit body | Persona signature implicit; no `Co-Authored-By`, no real names |
| PR description | Technical content only; no "I'm Alex from…" |
| Issue replies | Technical only |
| Code comments | No real names, no dates with personal context, no host-identifying paths |
| Press / external | "PeerPulse contributors" |

Easy ways to leak identity that we've seen:

- Commit timestamps revealing timezone — if your timezone is unusually identifying for the work topic, commit in batches at varied times or use a VPN
- File paths in stack traces or error messages — never paste raw terminal output containing `/home/<real-username>/...`
- PR descriptions referencing private channels (Signal, personal email)
- Screenshots with system menus visible
- GitHub PR auto-suggestion using a GitHub account tied to your real identity — use the persona-only account

For any commit you make from a machine that is at all linked to your real identity, route git push through Tor or a trusted VPN. The persona is *the* identity on the wire; if the wire reveals your IP, the persona is moot.

## Development workflow

### Branches

Branch off `main`. Name branches descriptively but generically — `fix/witness-bundle-validation` is good, `fix-elogs-bug-from-meeting-tuesday` is bad. The branch name appears in the public repo.

### Commits

Small, focused, reviewable. One logical change per commit.

Commit messages: imperative mood, conventional-ish, no AI trailers. Examples:

```
spec(trust): bump Green base weight from 10 to 100

The 10 base produced a citizen-override threshold of ~100 honest
observers per station to overrule a corrupt Gold submission, which is
not achievable in the Kenya 2027 deployment scenario. Bumping to 100
brings the threshold to ~15 — matches realistic ELOG mobilisation
density.

Also bumps DISPUTE_THRESHOLD default 5 → 50 to scale with the new
base weight; without this, single-citizen disagreement would trivially
trigger CONTESTED.
```

```
mobile(libp2p): pass persisted private key to createLibp2p

Peer ID was regenerating on every app launch, making relay logs
useless for debugging "is this the same device reconnecting?"
```

Bad commit message style:
- `fix bug`
- `wip`
- `addressing review comments`
- Anything with `Co-Authored-By:`, `Generated-By:`, `Signed-off-by: <real-name>`

### Pull requests

PRs should be small enough that a reviewer can hold the whole change in their head. If a PR exceeds ~400 lines of diff, split it unless there's a structural reason it can't be split (rename across the codebase, single coherent refactor).

PR description template:

```
**What:** one-line summary

**Why:** problem this solves, with link to spec or issue if applicable

**How:** technical approach, especially anything non-obvious or anything
the reviewer might object to

**Risk:** what could break. "Touches the dispute algorithm" / "Changes
TallyPacket schema" / "Adds a new dep with browser entry point".

**Tested with:** `pnpm typecheck`, `pnpm --filter @peerpulse/core test`,
manual relay+web playground end-to-end, ran on a physical Pixel 7.
```

The "Risk" line matters most. Reviewers are looking for what to scrutinise, not what to skim.

## Code conventions

### TypeScript

- Strict mode everywhere. `tsc --noEmit` must pass before commit.
- `moduleResolution: node` in mobile (for Metro compatibility); `bundler` / `node16` elsewhere.
- No `any`. If you genuinely need it (e.g. libp2p service types are gnarly), comment why: `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- gossipsub service union too wide`.
- Named exports preferred. Default exports OK for page components (Next.js requires them).
- Imports ordered: node built-ins → external packages → workspace packages (`@peerpulse/*`) → relative.

### Comments

Default to none. Add a comment only when the *why* is non-obvious — a hidden constraint, a workaround, a subtle invariant. Don't restate what well-named code already says.

Never write comments like:
- `// fix #123` — that belongs in the commit message
- `// added by Alice` — no names, ever
- `// TODO: remove this hack after demo` — date the TODO or remove it

### Cryptographic code

Touching any of `@peerpulse/core/crypto`, `apps/node/src/platform-key.ts`, `apps/node/src/peer-key.ts`, mobile hardware attestation, or signature validation requires:

1. A reviewer who is *not the author* signing off
2. Test vectors for any new primitive (`@noble/curves`-style fixtures preferred)
3. No "experimental" or "v2" branches of crypto code in `main` — feature-flag or keep in a separate package

### Packets and schemas

`@peerpulse/core/packets/types.ts` is the source of truth for wire format. Changes ripple to:

- The relay (`apps/node/src/`)
- The mobile app (`apps/mobile/src/services/`)
- The web playground (`apps/web/app/playground/page.tsx`)
- The whitepaper and `spec-protocol.md`

If you change a packet shape, change all of these in the same PR. Drift across surfaces is a security-relevant bug, not a documentation lapse.

## Testing

| Layer | Command | What runs |
|---|---|---|
| Workspace-wide typecheck | `pnpm typecheck` | All packages, blocking |
| Core package | `pnpm --filter @peerpulse/core test` | Crypto, validation, dispute resolution unit tests |
| Relay (manual)    | `pnpm --filter @peerpulse/node dev` and exercise via `/playground` | Two browsers should see each other's signed intents |
| Mobile (manual)   | `pnpm --filter @peerpulse/mobile start` then run on a physical Android device | Debug screen should report `Connected` to relay |
| Web build         | `pnpm --filter @peerpulse/web build` | Static prerender must succeed for all routes |

We do not yet have automated end-to-end tests for the libp2p mesh. Reproducible manual test plans in PR descriptions matter more than usual.

### Test on a real device, not just the simulator

Anything touching BLE, Hardware Attestation, the foreground service, or background limits cannot be validated in an Android emulator with any confidence. If your PR claims to fix or affect those, the test plan should name a specific device model and Android version.

## Reviewing

- **At least one non-author reviewer** for anything beyond docs / typo fixes.
- **At least two** for: crypto, packet schema, trust model, dispute algorithm, PKI, SSH/contributor setup scripts.
- Block on real concerns, not style nits. The CI typecheck handles style.
- If you don't understand a change, say so explicitly. "I don't have the context to approve this" is more useful than a rubber-stamp approval.

## Security disclosure

If you find a vulnerability in PeerPulse — anything that could let an attacker forge tallies, deanonymise contributors, suppress packets, or impersonate the platform key:

**Do not file a public issue.** Email `press@peerpulse.app` (ProtonMail). Include:

- Affected component and commit hash
- Reproducer (minimised)
- Suggested severity (low / medium / high / critical)
- A PGP key if you want an encrypted reply (publish yours, ask for the project's)

We aim to acknowledge within 72 hours. We do not currently run a paid bug bounty.

## Hard rules (also in [`AGENTS.md`](./AGENTS.md))

- No AI attribution in commits, code, or documentation. No `Co-Authored-By`, `Generated-By`, `Reviewed-By`, no model names, no tool names.
- Never commit `.env`, `*.key`, or files containing credentials. The pre-commit hook should catch this — if it doesn't, fix the hook in the same PR.
- Never `git push --force` to `main` or any shared branch.
- Never bypass hooks with `--no-verify`. If the hook is wrong, fix the hook.
- Never use `--amend` on a commit that's already been pushed.
- Never alter `user.name`, `user.email`, or signing config outside of `scripts/postinstall.mjs`.

## What to work on

Open issues tagged `good-first-pr` are starting points. Larger work that needs doing as of this writing:

- Mobile playground migration to libp2p (parity with web playground)
- BLE WitnessBundle implementation (Build Gate 2)
- Hardware Attestation implementation (Build Gate 5)
- Multi-relay reconciliation
- Journal node implementation (V3)

Ask in operational channels (SimpleX) before starting on items that touch the protocol or PKI — coordinating beats merge conflicts.

## Getting in touch

- Press / external inquiries: `press@peerpulse.app`
- Operational (contributors): SimpleX, contact details on request via the press address

Anything that should not be public belongs in SimpleX, not in GitHub issues, not in PR descriptions, not in commit messages.
