#!/usr/bin/env bash
# Generate the watchOS Xcode project with injected APP_VERSION and APP_BUILD.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

# Ensure Signing.xcconfig exists for unsigned local/CI Simulator builds.
if [[ ! -f "$ROOT/watch/Signing.xcconfig" ]]; then
  : > "$ROOT/watch/Signing.xcconfig"
fi

# Empty when not signing. Release CI exports the real App Store profile UUIDs.
export CONTAINER_PROFILE_UUID="${CONTAINER_PROFILE_UUID:-}"
export WATCH_PROFILE_UUID="${WATCH_PROFILE_UUID:-}"

generate_xcode_project
python3 - "$WATCH_PROJECT/project.pbxproj" <<'PY'
import pathlib, re, sys, uuid

path = pathlib.Path(sys.argv[1])
text = path.read_text()
target = re.search(
    r"\t\t[A-F0-9]{24} /\* TiltroomContainer \*/ = \{\n"
    r"\t\t\tisa = PBXNativeTarget;.*?\n"
    r"\t\t\};",
    text,
    re.S,
)
if not target:
    raise SystemExit("TiltroomContainer target not found")

original = target.group(0)
block = original
sources = re.search(r"\t\t\t\t([A-F0-9]{24}) /\* Sources \*/,\n", block)
if sources:
    source_id = sources.group(1)
    block = block.replace(f"\t\t\t\t{source_id} /* Sources */,\n", "", 1)
    phase = re.compile(
        rf"\t\t{source_id} /\* Sources \*/ = \{{\n"
        rf"\t\t\tisa = PBXSourcesBuildPhase;.*?\n"
        rf"\t\t\}};\n",
        re.S,
    )
    text, removed = phase.subn("", text, count=1)
    if removed != 1:
        raise SystemExit("failed to remove the container Sources build phase")

if "/* Resources */" not in block:
    resource_id = uuid.uuid4().hex[:24].upper()
    block = block.replace(
        "\t\t\tbuildPhases = (\n",
        "\t\t\tbuildPhases = (\n"
        f"\t\t\t\t{resource_id} /* Resources */,\n",
        1,
    )
    resource = (
        f"\t\t{resource_id} /* Resources */ = {{\n"
        "\t\t\tisa = PBXResourcesBuildPhase;\n"
        "\t\t\tbuildActionMask = 2147483647;\n"
        "\t\t\tfiles = (\n"
        "\t\t\t);\n"
        "\t\t\trunOnlyForDeploymentPostprocessing = 0;\n"
        "\t\t};\n"
    )
    marker = "/* End PBXResourcesBuildPhase section */\n"
    if marker not in text:
        raise SystemExit("PBXResourcesBuildPhase section not found")
    text = text.replace(marker, resource + marker, 1)

if block == original:
    raise SystemExit("container build phases were already in the watch-only shape")
text = text.replace(original, block, 1)
path.write_text(text)
PY
echo "Generated $WATCH_PROJECT (version=$APP_VERSION, build=$APP_BUILD)"
