# Task: Docker Android Build Image + Dev APK

**Phase:** Week 1
**Depends on:** `week1-mobile-shell.md` (app must have Android project before Gradle can build)
**Spec refs:** `execution.md §Week 1`, `tabulate/spec-protocol.md §4 (Build row)`

---

## Outcome

Running a single Docker command produces `peerpulse-dev.apk`. This APK is sideloaded onto a physical Android device, replacing Expo Go, enabling Build Gate 0 testing with custom native modules (`react-native-quick-crypto`, `react-native-ble-plx`, etc.).

The same Docker image is reused for all subsequent debug builds (Weeks 2–12) and the production release APK (Week 13).

---

## Why Docker

No EAS cloud account. No code uploaded to third-party services. No identity trail. The APK signing key never leaves the air-gapped machine. Docker provides a reproducible build environment that produces byte-identical outputs across machines and CI runs.

---

## File to create

```
docker/
  android-build/
    Dockerfile
    build-debug.sh    ← convenience wrapper
    build-release.sh  ← Week 13 release build (placeholder for now)
    .dockerignore
```

---

## Note on `apps/mobile/android/`

`apps/mobile/android/` is gitignored (Expo default for generated native directories). The Docker build runs `expo prebuild --platform android` inside the container before Gradle, generating the Android project from `app.json` and the installed Expo modules. The build inputs (`app.json`, `package.json`, `babel.config.js`, `metro.config.js`) are committed — the output (`android/`) is ephemeral and regenerated per build.

This means every Docker build is reproducible given the same committed inputs, without committing generated native code.

---

## `docker/android-build/Dockerfile`

```dockerfile
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_NDK_HOME=/opt/android-sdk/ndk/27.1.12297006
ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/34.0.0:${PATH}"
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# System dependencies
RUN apt-get update && apt-get install -y \
    curl wget unzip git \
    openjdk-17-jdk \
    python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Android command-line tools (pinned version)
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdtools.zip && \
    unzip -q /tmp/cmdtools.zip -d /tmp/cmdtools && \
    mv /tmp/cmdtools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/cmdtools.zip

# Accept licenses and install SDK components
RUN yes | sdkmanager --licenses && \
    sdkmanager \
      "platform-tools" \
      "platforms;android-34" \
      "build-tools;34.0.0" \
      "ndk;27.1.12297006" \
      "cmake;3.22.1"

# Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# pnpm
RUN npm install -g pnpm@10.32.1

WORKDIR /workspace

# Default command: prebuild then build debug APK
CMD ["bash", "-c", "pnpm install --frozen-lockfile && cd apps/mobile && pnpm expo prebuild --platform android --no-install && cd android && ./gradlew assembleDebug --no-daemon"]
```

**Pinned versions — do not change without testing:**
- Ubuntu 22.04 LTS
- OpenJDK 17
- Android SDK cmdline-tools `11076708`
- Android platform-tools + platforms;android-34 + build-tools;34.0.0
- NDK `27.1.12297006` (r27) — required by `react-native-quick-crypto` and `react-native-ble-plx`
- Node.js 22
- pnpm 10.32.1

---

## `docker/android-build/build-debug.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# Run from the monorepo root:
#   ./docker/android-build/build-debug.sh

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IMAGE_NAME="peerpulse-android-build"
OUTPUT_DIR="${REPO_ROOT}/build/apk"

mkdir -p "${OUTPUT_DIR}"

echo "→ Building Docker image..."
docker build \
  --platform linux/amd64 \
  -t "${IMAGE_NAME}" \
  "${REPO_ROOT}/docker/android-build"

echo "→ Running Gradle assembleDebug..."
docker run --rm \
  --platform linux/amd64 \
  -v "${REPO_ROOT}:/workspace" \
  -v "${HOME}/.gradle:/root/.gradle" \
  "${IMAGE_NAME}"

APK_PATH="${REPO_ROOT}/apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "${APK_PATH}" ]; then
  cp "${APK_PATH}" "${OUTPUT_DIR}/peerpulse-dev.apk"
  echo "✓ APK written to build/apk/peerpulse-dev.apk"
  echo "  Size: $(du -sh "${OUTPUT_DIR}/peerpulse-dev.apk" | cut -f1)"
else
  echo "✗ APK not found at expected path"
  exit 1
fi
```

**Notes:**
- `--platform linux/amd64` is required on M-series Macs (arm64 host) to avoid NDK cross-compile issues. Builds are slower on Apple Silicon (~30–40 min first run) but produce correct arm64 Android APKs.
- `~/.gradle` is mounted as a volume to cache Gradle dependencies across runs. First run downloads ~2 GB; subsequent runs are fast.
- Output is copied to `build/apk/peerpulse-dev.apk` at the repo root.

---

## `docker/android-build/build-release.sh`

Placeholder for Week 13. The release build adds:
1. Gradle `assembleRelease` instead of `assembleDebug`
2. Unsigned APK output
3. Offline signing via `apksigner` on the air-gapped machine

```bash
#!/usr/bin/env bash
# Week 13: release build — produces unsigned APK for offline signing
# Usage: ./docker/android-build/build-release.sh
echo "Release build — to be implemented in Week 13"
echo "Requires: air-gapped machine with signing keystore + apksigner"
exit 1
```

---

## `docker/android-build/.dockerignore`

```
node_modules
.git
build
dist
*.apk
*.aab
```

---

## Android project generation

`apps/mobile/android/` is gitignored. The Docker build generates it automatically by running `expo prebuild --platform android --no-install` inside the container before Gradle. No manual setup required — just run `build-debug.sh`.

---

## Sideloading onto a physical Android device

1. Enable "Developer options" on the Android device (Settings → About phone → tap "Build number" 7 times)
2. Enable "USB debugging" and "Install via USB" in Developer options
3. Connect device via USB
4. Run: `adb install build/apk/peerpulse-dev.apk`
5. Or: Transfer APK to device and open with file manager (requires "Install from unknown sources" enabled)

---

## Acceptance criteria

- [ ] `docker/android-build/Dockerfile` builds without errors: `docker build -t peerpulse-android-build ./docker/android-build`
- [ ] `./docker/android-build/build-debug.sh` runs from repo root and produces `build/apk/peerpulse-dev.apk`
- [ ] APK installs on a physical Android device via `adb install`
- [ ] App launches on device — PeerPulse tabs visible
- [ ] `~/.gradle` cache mount works — second build is significantly faster than first
- [ ] `build/apk/` is in `.gitignore` — APK artifacts are not committed
- [ ] `apps/mobile/android/` is gitignored — Docker regenerates it via `expo prebuild` on each build
