#!/usr/bin/env bash
# Builds an unsigned release APK for offline signing (Week 13).
# Uses the same content-addressed base image as build-debug.sh.
#
# Usage (from repo root):
#   ./docker/android-build/build-release.sh
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

_step "Building release APK (unsigned)"
echo "  Base image : ${BASE_IMAGE}"
echo "  Output     : build/apk/peerpulse-unsigned.apk"
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
    echo '[gradlew] Starting assembleRelease...'
    cd apps/mobile/android
    ./gradlew assembleRelease --no-daemon --console=plain 2>&1
    cp app/build/outputs/apk/release/app-release-unsigned.apk /out/peerpulse-unsigned.apk
    echo '[gradlew] APK copied to /out/peerpulse-unsigned.apk'
  "

if [ -f "${OUTPUT_DIR}/peerpulse-unsigned.apk" ]; then
  echo ""
  _ok "Unsigned APK: build/apk/peerpulse-unsigned.apk"
  echo "  Size      : $(du -sh "${OUTPUT_DIR}/peerpulse-unsigned.apk" | cut -f1)"
  echo "  Base image: ${BASE_IMAGE}"
  echo ""
  echo "  Next: sign on air-gapped machine"
  echo "  apksigner sign --ks peerpulse.keystore --out peerpulse-v1.apk peerpulse-unsigned.apk"
else
  echo "✗ APK not found — Gradle build failed."
  exit 1
fi
