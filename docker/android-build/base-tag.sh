#!/usr/bin/env bash
# Sourceable — sets BASE_TAG and BASE_IMAGE based on a hash of native dep versions.
# BASE_TAG changes whenever any tracked dep version or app.json changes.
# Both build-base.sh and build-debug.sh source this to stay in sync.
#
# Usage:
#   source ./docker/android-build/base-tag.sh
#   echo "${BASE_IMAGE}"  # peerpulse-android-base:a3f1c9b2e8d4

# Deps with native Android code — changing any of these requires a base image rebuild.
# Add entries here when new native modules are added to apps/mobile/package.json.
NATIVE_DEPS=(
  expo
  react-native
  expo-build-properties
  expo-camera
  expo-dev-client
  expo-intent-launcher
  expo-sqlite
  react-native-ble-plx
  react-native-get-random-values
  react-native-nitro-modules
  react-native-quick-base64
  react-native-quick-crypto
  react-native-safe-area-context
  react-native-screens
  react-native-tcp-socket
)

_pkg="${REPO_ROOT}/apps/mobile/package.json"
_input=""
for _dep in "${NATIVE_DEPS[@]}"; do
  _ver=$(node -p "require('${_pkg}').dependencies['${_dep}'] || ''" 2>/dev/null)
  _input="${_input}${_dep}@${_ver}"$'\n'
done
# app.json affects expo prebuild output — include its content hash
_input="${_input}app.json:$(md5sum "${REPO_ROOT}/apps/mobile/app.json" | cut -d' ' -f1)"$'\n'

BASE_TAG=$(printf '%s' "${_input}" | md5sum | cut -c1-12)
BASE_IMAGE="peerpulse-android-base:${BASE_TAG}"

unset _pkg _input _dep _ver
