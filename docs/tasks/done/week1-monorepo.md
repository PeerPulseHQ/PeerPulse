# Task: Monorepo Scaffold Verification + Turbo Dev

**Phase:** Week 1
**Depends on:** Nothing — this is the first task
**Spec refs:** `tabulate/spec-protocol.md §4`

---

## What already exists

The monorepo scaffold is complete. Do not recreate any of this:

- `pnpm-workspace.yaml` — `apps/*` + `packages/*` ✓
- `turbo.json` — `build`, `dev`, `typecheck`, `test` tasks with correct dependency ordering ✓
- `package.json` (root) — `pnpm@10.32.1`, turbo scripts ✓
- `tsconfig.base.json` — base TypeScript config ✓
- All four workspaces present: `apps/mobile`, `apps/node`, `apps/web`, `packages/core` ✓

## What this task does

Verify the full monorepo runs end-to-end with `pnpm dev`. Fix any wiring issues that prevent turbo from orchestrating all workspaces cleanly. Ensure each workspace has the correct `dev` script and turbo can start them all in parallel.

---

## Required changes

### 1. Verify `packages/core` builds first

`packages/core` must build before any app that consumes it. Turbo's `"dependsOn": ["^build"]` handles this, but verify `@peerpulse/core` exports resolve correctly in each consumer.

Run:
```bash
pnpm --filter @peerpulse/core build
```

Confirm `packages/core/dist/` is generated with `.js` and `.d.ts` files for all export paths defined in `package.json`:
- `./` → `dist/index.js`
- `./packets`
- `./crypto`
- `./dispute`
- `./validation`

### 2. Verify `apps/node` dev script

`apps/node` uses `tsx watch src/index.ts`. Confirm:
```bash
pnpm --filter @peerpulse/node dev
```
starts without error and prints relay peer ID.

### 3. Add `dev` script to `apps/web`

`apps/web` currently has `"dev": "vite"`. This will be replaced by the Next.js migration task (`week1-website.md`). For now, leave as-is — turbo will start it but it does not need to be functional until the website task is complete. If `vite` is not installed after the Next.js migration, update this script to `"dev": "next dev"`.

### 4. `apps/mobile` dev script

`apps/mobile` should have:
```json
"dev": "expo start --dev-client",
"android": "expo run:android",
"build:dev": "cd android && ./gradlew assembleDebug"
```

Confirm these exist. If not, add them.

### 5. Root `tsconfig.base.json` — confirm paths

Ensure `tsconfig.base.json` includes the workspace reference so editors resolve `@peerpulse/core` correctly:
```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@peerpulse/core": ["../../packages/core/src/index.ts"],
      "@peerpulse/core/*": ["../../packages/core/src/*"]
    }
  }
}
```

Each app's `tsconfig.json` should extend `../../tsconfig.base.json`.

---

## Acceptance criteria

- [ ] `pnpm install` runs without errors from the repo root
- [ ] `pnpm --filter @peerpulse/core build` produces `packages/core/dist/` with all export files
- [ ] `pnpm --filter @peerpulse/node dev` starts the relay and prints peer ID to stdout
- [ ] `pnpm typecheck` runs `tsc --noEmit` across all workspaces with zero errors
- [ ] `turbo.json` `dev` task starts `apps/node` and `apps/web` in parallel (mobile is started separately via `expo start`)
- [ ] No circular workspace dependencies
