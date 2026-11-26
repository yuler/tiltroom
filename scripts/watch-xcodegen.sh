#!/usr/bin/env bash
# Generate the watchOS Xcode project with injected APP_VERSION and APP_BUILD.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

generate_xcode_project
echo "Generated $WATCH_PROJECT (version=$APP_VERSION, build=$APP_BUILD)"
