#!/usr/bin/env bash
# The deploy's pass through the members-only gate (docs/members-only.md).
# Prints a token derived from the server key: HMAC-SHA256 of "pna-members-ci:v1", base64url without padding.
# The deploy step stores it in the Worker as MEMBERS_CI_TOKEN, and each live check works out the same value from the same key,
# so there is no extra secret to create or keep in step. Rotating the server key rotates the pass.
# Usage: SUPABASE_SERVICE_ROLE_KEY=... bash scripts/ci-members-pass.sh   (prints nothing when the key is missing)
set -euo pipefail
key="${SUPABASE_SERVICE_ROLE_KEY:-}"
[ -n "$key" ] || exit 0
printf '%s' 'pna-members-ci:v1' | openssl dgst -sha256 -hmac "$key" -binary | base64 | tr '+/' '-_' | tr -d '=\n'
