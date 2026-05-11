# Fast APK build image.
# Source files are bind-mounted at runtime — this Dockerfile just records the pattern.
# See build-debug.sh and build-release.sh for the actual docker run commands.
#
# If your CI system requires a concrete image (not a docker run command), use this:
#   docker build --build-arg BASE_TAG=expo55-rn079 -t peerpulse-android-build .
#   docker run --rm -e CI=true -v $(pwd)/build/apk:/out peerpulse-android-build

ARG BASE_TAG=latest
FROM peerpulse-android-base:${BASE_TAG}

COPY packages/core/src/ packages/core/src/
COPY apps/mobile/src/   apps/mobile/src/
COPY apps/mobile/App.js apps/mobile/App.js

CMD ["bash", "-c", "cd apps/mobile/android && ./gradlew assembleDebug --no-daemon && cp app/build/outputs/apk/debug/app-debug.apk /out/peerpulse-dev.apk"]
