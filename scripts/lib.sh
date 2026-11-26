#!/usr/bin/env bash
# Shared helpers for Tiltroom watchOS build and release scripts.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WATCH_PROJECT="$ROOT/watch/Tiltroom.xcodeproj"
WATCH_SCHEME="Tiltroom"
WATCH_DERIVED="$ROOT/.build/watch"

export ROOT WATCH_PROJECT WATCH_SCHEME WATCH_DERIVED

load_app_version() {
  APP_VERSION="$("$ROOT/scripts/resolve-version.sh")"
  if [[ ! "$APP_VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
    echo "Invalid resolved version: $APP_VERSION (expected X.Y.Z)" >&2
    return 1
  fi
  local major="${BASH_REMATCH[1]}"
  local minor="${BASH_REMATCH[2]}"
  local patch="${BASH_REMATCH[3]}"
  APP_BUILD=$(( 10#$major * 1000000 + 10#$minor * 1000 + 10#$patch ))
  [[ "$APP_BUILD" -lt 1 ]] && APP_BUILD=1
  export APP_VERSION APP_BUILD
}

generate_xcode_project() {
  load_app_version
  xcodegen generate --spec "$ROOT/watch/project.yml" --project "$ROOT/watch/"
}
