#!/usr/bin/env bash
# Builds the Android base image and tags it with a content hash of native deps.
# Safe to run at any time — skips the build if the image already exists.
# Must be re-run whenever apps/mobile/package.json native deps or app.json change.
#
# Usage (from repo root):
#   ./docker/android-build/build-base.sh           # build if missing
#   ./docker/android-build/build-base.sh --force   # rebuild even if image exists
#   ./docker/android-build/build-base.sh --push    # build + push to registry
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
source "${REPO_ROOT}/docker/android-build/base-tag.sh"

_ts() { date '+%H:%M:%S'; }
_step() { echo ""; echo "[$(_ts)] ── $* ──────────────────────────────"; }
_ok()   { echo "[$(_ts)] ✓ $*"; }

_step "Native dep hash: ${BASE_TAG}"
echo "  Tracked deps: ${NATIVE_DEPS[*]}"

echo ""
echo "  Dep versions included in hash:"
_pkg="${REPO_ROOT}/apps/mobile/package.json"
for _dep in "${NATIVE_DEPS[@]}"; do
  _ver=$(node -p "require('${_pkg}').dependencies['${_dep}'] || 'MISSING'" 2>/dev/null)
  printf "    %-40s %s\n" "${_dep}" "${_ver}"
done
echo "    app.json hash included"
echo ""

if docker image inspect "${BASE_IMAGE}" > /dev/null 2>&1 && [[ "${1:-}" != "--force" ]]; then
  _ok "${BASE_IMAGE} already exists — skipping build."
  echo "  Use --force to rebuild."
  exit 0
fi

_step "Building ${BASE_IMAGE}"
echo "  Stages: system packages → Android SDK → Node+pnpm → Gradle binary"
echo "          → pnpm install → expo prebuild → Gradle dep cache"
echo "  (~25 min first run; subsequent runs use Docker layer cache)"
echo ""

PROGRESS="auto"
[[ -t 1 ]] || PROGRESS="plain"

docker build \
  --platform linux/amd64 \
  --progress="${PROGRESS}" \
  -f "${REPO_ROOT}/docker/android-build/Dockerfile.base" \
  -t "${BASE_IMAGE}" \
  -t "peerpulse-android-base:latest" \
  "${REPO_ROOT}"

echo ""
_ok "Built: ${BASE_IMAGE}"
echo "  Also tagged: peerpulse-android-base:latest"

if [[ "${1:-}" == "--push" ]] || [[ "${2:-}" == "--push" ]]; then
  _step "Pushing ${BASE_IMAGE}"
  docker push "${BASE_IMAGE}"
  docker push "peerpulse-android-base:latest"
  _ok "Pushed"
fi
