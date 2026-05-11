# Task: Git Repository Setup

**Phase:** Week 1
**Depends on:** `week1-monorepo.md` (monorepo scaffold must exist before committing it)
**Spec refs:** `spec-strategy.md §3.1–3.2`

---

## Outcome

The monorepo is committed to a pseudonymous GitHub organisation under an identity that leaves no forensic trace to the founder. All commits use a fixed fake timezone. A pre-commit hook prevents secrets from being accidentally staged. The working tree is clean.

---

## Opsec requirements (non-negotiable)

From `spec-strategy.md §3.2`, git commits are a ranked identity threat vector. The following apply to every commit in this repository, forever:

- **Author identity:** pseudonymous name and `@peerpulse.app` email — never a real name or personal address
- **Timezone:** always `+0000` — stripped from git config so no local timezone leaks via commit timestamps
- **Network:** all `git push` operations over VPN or Tor — never from a residential or identifiable IP
- **GitHub account:** the pushing account must be created pseudonymously, no phone number, over VPN

These are configured once in the local git config and do not appear in any committed file.

---

## Step 1 — Local git config

Run once in the repo root. Do not commit these settings; they are local only.

```bash
git config user.name "PeerPulse contributors"
git config user.email "contributors@peerpulse.app"
git config core.excludesfile .gitignore

# Strip local timezone from all commits
git config --global core.hooksPath .githooks

# Force UTC timestamps — add to shell profile, not git config
# export GIT_COMMITTER_DATE="$(date -u +%Y-%m-%dT%H:%M:%S+0000)"
# Better: set in the pre-commit hook so it's automatic
```

The pre-commit hook (Step 3) sets `GIT_COMMITTER_DATE` and `GIT_AUTHOR_DATE` to UTC automatically on every commit.

---

## Step 2 — .gitignore

Create `.gitignore` at the monorepo root. Must cover:

```gitignore
# Environment and secrets — never committed
.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.jks
*.keystore

# Android signing
apps/mobile/android/app/release/
apps/mobile/android/local.properties

# Build outputs
dist/
.next/
out/
build/
*.apk
*.aab

# Node
node_modules/
.pnpm-store/

# Turbo
.turbo/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/
*.iml

# Logs
*.log
npm-debug.log*

# EAS
.expo/
eas-build-pre-install.js

# Coverage
coverage/
.nyc_output/

# Pinata / IPFS keys
pinata.json
```

Also create `.env.example` at root documenting required variables without values:

```bash
# Relay
RELAY_PORT=9090
RELAY_INFO_PORT=9876
ELECTION_ID=ke-general-2027

# Web (apps/web)
NEXT_PUBLIC_RELAY_URL=ws://localhost:9090

# Pinata (Week 10)
PINATA_API_KEY=
PINATA_SECRET_KEY=
```

---

## Step 3 — Pre-commit hook

Create `.githooks/pre-commit` (executable). The hook does two things: neutralises commit timestamps to UTC and scans staged files for secrets.

```bash
#!/usr/bin/env bash
set -e

# ── Neutralise timestamps ──────────────────────────────────────────────────
NOW_UTC="$(date -u +%Y-%m-%dT%H:%M:%S+0000)"
export GIT_COMMITTER_DATE="$NOW_UTC"
export GIT_AUTHOR_DATE="$NOW_UTC"

# ── Secrets scan ───────────────────────────────────────────────────────────
STAGED=$(git diff --cached --name-only --diff-filter=ACM)

BLOCKED_PATTERNS=(
  "PRIVATE KEY"
  "BEGIN RSA"
  "BEGIN EC"
  "BEGIN OPENSSH"
  "AWS_SECRET"
  "PINATA_SECRET"
  "sk_live_"
  "xoxb-"
  "ghp_"
  "password\s*="
  "secret\s*="
)

for file in $STAGED; do
  # Skip binary files and .env.example
  [[ "$file" == *.example ]] && continue
  [[ "$file" == *.png || "$file" == *.jpg || "$file" == *.apk ]] && continue

  for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if git show ":$file" 2>/dev/null | grep -qi "$pattern"; then
      echo "❌ Possible secret in staged file: $file"
      echo "   Pattern matched: $pattern"
      echo "   Unstage with: git restore --staged $file"
      exit 1
    fi
  done
done

echo "✓ Pre-commit: no secrets detected, timestamps neutralised to UTC"
```

Make it executable:

```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

Commit `.githooks/pre-commit` to the repository so it applies to all contributors automatically (they still need to run `git config core.hooksPath .githooks`, which the monorepo setup task should do on `pnpm install` via a `postinstall` script).

---

## Step 4 — postinstall script (monorepo root package.json)

Add to root `package.json` so the hook is activated for anyone who clones and runs `pnpm install`:

```json
{
  "scripts": {
    "postinstall": "git config core.hooksPath .githooks || true"
  }
}
```

The `|| true` prevents failure in CI environments where `.git` may not be present.

---

## Step 5 — Initial commit

Stage and commit everything in a single initial commit:

```bash
git add .
git commit -m "feat: initial monorepo scaffold

pnpm workspace, turbo, apps/mobile shell, apps/node relay,
apps/web Next.js site, packages/core skeleton.

Week 1 foundation."
```

Verify the commit metadata before pushing:

```bash
git log --format="%H %an <%ae> %ai" -1
# Expected: ... PeerPulse contributors <contributors@peerpulse.app> 2026-... +0000
```

The timezone must be `+0000`. If it shows a local timezone, the hook did not run — check `core.hooksPath`.

---

## Step 6 — GitHub remote

The GitHub organisation must already exist (created pseudonymously over VPN — this is a manual step outside this task). Once it does:

```bash
git remote add origin git@github.com:peerpulse/peerpulse.git
git branch -M main
git push -u origin main
```

Push only over VPN. Verify with `curl ifconfig.me` first.

---

## Step 7 — Branch protection (GitHub UI, manual)

After push, configure via GitHub Settings → Branches → Add rule for `main`:

- [x] Require a pull request before merging
- [x] Require status checks to pass (add when CI is configured)
- [x] Do not allow bypassing the above settings
- [x] Restrict who can push to matching branches (only the pseudonymous org admin)

---

## What is NOT in scope

- GitHub Actions / CI — deferred until identity exposure from Actions runners is assessed. Actions logs can leak IP ranges. Configure CI only after deciding whether self-hosted runners are needed.
- Code signing of git commits (GPG/SSH) — adds an identity vector; omit unless a pseudonymous key is generated specifically for this purpose.
- Branch strategy beyond `main` — contributors work on feature branches and PR; branch naming conventions are informal for now.

---

## Acceptance criteria

- [ ] `git log --format="%ae %ai" -1` shows `contributors@peerpulse.app` and timezone `+0000`
- [ ] `.gitignore` exists and `git check-ignore -v .env` matches
- [ ] `.githooks/pre-commit` is executable and runs on `git commit`
- [ ] Staged file containing the string `PRIVATE KEY` causes pre-commit to exit 1 and block the commit
- [ ] `.env.example` is committed; `.env` is not tracked
- [ ] `git remote -v` shows the pseudonymous GitHub org remote
- [ ] `main` branch is protected — direct push rejected with a non-admin account
