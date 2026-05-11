#!/usr/bin/env bash
# Builds a debug APK using the content-addressed base image.
# If the base image for the current dep hash doesn't exist, builds it first.
# Fast path (base exists): 5–8 min. Full path (base missing): ~30 min.
#
# Usage (from repo root):
#   ./docker/android-build/build-debug.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
source "${REPO_ROOT}/docker/android-build/base-tag.sh"

_ts()   { date '+%H:%M:%S'; }
_step() { echo ""; echo "[$(_ts)] ── $* ──────────────────────────────"; }
_ok()   { echo "[$(_ts)] ✓ $*"; }

OUTPUT_DIR="${REPO_ROOT}/build/apk"
mkdir -p "${OUTPUT_DIR}"

if ! docker image inspect "${BASE_IMAGE}" > /dev/null 2>&1; then
  _step "Base image missing — building it first"
  "${REPO_ROOT}/docker/android-build/build-base.sh"
fi

_step "Building debug APK"
echo "  Base image : ${BASE_IMAGE}"
echo "  Output     : build/apk/peerpulse-dev.apk"
echo "  Mounts     : packages/core/src, apps/mobile/src, apps/mobile/App.js (read-only)"
echo ""

docker run --rm \
  --platform linux/amd64 \
  -e CI=true \
  -v "${REPO_ROOT}/packages/core/src:/workspace/packages/core/src:ro" \
  -v "${REPO_ROOT}/apps/mobile/src:/workspace/apps/mobile/src:ro" \
  -v "${REPO_ROOT}/apps/mobile/App.js:/workspace/apps/mobile/App.js:ro" \
  -v "${OUTPUT_DIR}:/out" \
  "${BASE_IMAGE}" \
  bash -c "
    set -euo pipefail
    echo '[gradlew] Starting assembleDebug...'
    cd apps/mobile/android
    ./gradlew assembleDebug --no-daemon --console=plain 2>&1
    cp app/build/outputs/apk/debug/app-debug.apk /out/peerpulse-dev.apk
    echo '[gradlew] APK copied to /out/peerpulse-dev.apk'
  "

if [ -f "${OUTPUT_DIR}/peerpulse-dev.apk" ]; then
  echo ""
  _ok "APK written to build/apk/peerpulse-dev.apk"
  echo "  Size      : $(du -sh "${OUTPUT_DIR}/peerpulse-dev.apk" | cut -f1)"
  echo "  Base image: ${BASE_IMAGE}"
else
  echo "✗ APK not found — Gradle build failed."
  exit 1
fi
