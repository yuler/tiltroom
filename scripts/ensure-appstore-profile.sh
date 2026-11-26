#!/usr/bin/env bash
# Find or create an IOS_APP_STORE profile for one bundle ID and the imported
# distribution certificate, then install it for Xcode.
#
# Usage: ensure-appstore-profile.sh <bundle-id> <profile-name-prefix> <bundle-name>
# Requires: CERT_SERIAL, and an authenticated asc CLI.
# Stdout (parsed by CI): uuid=<uuid> and name=<name>
# Logs go to stderr.

set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "usage: ensure-appstore-profile.sh <bundle-id> <profile-name-prefix> <bundle-name>" >&2
  exit 1
fi

BUNDLE_ID="$1"
PROFILE_PREFIX="$2"
BUNDLE_NAME="$3"
CERT_SERIAL="${CERT_SERIAL:?CERT_SERIAL is required}"

export BUNDLE_ID CERT_SERIAL

PROFILE_ID=""
while IFS= read -r pid; do
  [[ -z "$pid" ]] && continue
  MATCH="$(asc profiles view --id "$pid" --include bundleId,certificates --output json | python3 -c '
import json, os, sys
doc = json.load(sys.stdin)
want_bid = os.environ["BUNDLE_ID"]
want_serial = os.environ["CERT_SERIAL"].lstrip("0").upper()
inc = doc.get("included", [])
has_bid = any(i.get("type") == "bundleIds" and i.get("attributes", {}).get("identifier") == want_bid for i in inc)
has_cert = any(
    i.get("type") == "certificates"
    and i.get("attributes", {}).get("serialNumber", "").lstrip("0").upper() == want_serial
    for i in inc
)
print("yes" if (has_bid and has_cert) else "no")
')"
  if [[ "$MATCH" == "yes" ]]; then
    PROFILE_ID="$pid"
    break
  fi
done < <(asc profiles list --profile-type IOS_APP_STORE --paginate --output json | python3 -c '
import json, sys
for p in json.load(sys.stdin).get("data", []):
    if p.get("attributes", {}).get("profileState") == "ACTIVE":
        print(p["id"])
')

if [[ -z "$PROFILE_ID" ]]; then
  echo "No active IOS_APP_STORE profile for $BUNDLE_ID matching cert $CERT_SERIAL; creating one..." >&2
  BUNDLE_RES_ID="$(asc bundle-ids list --paginate --output json | python3 -c '
import json, os, sys
want = os.environ["BUNDLE_ID"]
for b in json.load(sys.stdin).get("data", []):
    if b.get("attributes", {}).get("identifier") == want:
        print(b["id"])
        break
')"
  if [[ -z "$BUNDLE_RES_ID" ]]; then
    echo "Registering bundle ID $BUNDLE_ID" >&2
    BUNDLE_RES_ID="$(asc bundle-ids create \
      --identifier "$BUNDLE_ID" \
      --name "$BUNDLE_NAME" \
      --platform IOS \
      --output json | python3 -c 'import json,sys; d=json.load(sys.stdin)["data"]; print((d[0] if isinstance(d, list) else d)["id"])')"
  fi
  CERT_RES_ID="$(asc certificates list --paginate --output json | python3 -c '
import json, os, sys
want = os.environ["CERT_SERIAL"].lstrip("0").upper()
for c in json.load(sys.stdin).get("data", []):
    if c.get("attributes", {}).get("serialNumber", "").lstrip("0").upper() == want:
        print(c["id"])
        break
')"
  if [[ -z "$BUNDLE_RES_ID" || -z "$CERT_RES_ID" ]]; then
    echo "Failed to resolve Bundle ID ($BUNDLE_RES_ID) or Distribution certificate ($CERT_RES_ID)" >&2
    exit 1
  fi
  PROFILE_ID="$(asc profiles create \
    --name "${PROFILE_PREFIX} ${CERT_SERIAL:0:8}" \
    --profile-type IOS_APP_STORE \
    --bundle "$BUNDLE_RES_ID" \
    --certificate "$CERT_RES_ID" \
    --output json | python3 -c 'import json,sys; d=json.load(sys.stdin)["data"]; print((d[0] if isinstance(d, list) else d)["id"])')"
fi

PROFILE_PATH="${RUNNER_TEMP:-/tmp}/$(printf '%s' "$BUNDLE_ID" | tr '.' '-').mobileprovision"
asc profiles download --id "$PROFILE_ID" --output "$PROFILE_PATH" --overwrite
asc profiles local install --path "$PROFILE_PATH" --force

PROFILE_INFO="$(asc profiles inspect --path "$PROFILE_PATH" --output json)"
PROFILE_UUID="$(printf '%s' "$PROFILE_INFO" | python3 -c 'import json,sys; print(json.load(sys.stdin)["uuid"])')"
PROFILE_NAME="$(printf '%s' "$PROFILE_INFO" | python3 -c 'import json,sys; print(json.load(sys.stdin)["name"])')"
rm -f "$PROFILE_PATH"

echo "Installed App Store profile: $PROFILE_NAME ($PROFILE_UUID) for $BUNDLE_ID" >&2
printf 'uuid=%s\n' "$PROFILE_UUID"
printf 'name=%s\n' "$PROFILE_NAME"
