#!/usr/bin/env bash
# The deploy's pass through the members-only gate (docs/members-only.md).
# Prints a token derived from the Cloudflare deploy token (always present, the deploy needs it), else the server key: HMAC-SHA256 of "pna-members-ci:v1", base64url without padding.
# The deploy step stores it in the Worker as MEMBERS_CI_TOKEN, and each live check works out the same value from the same key,
# so there is no extra secret to create or keep in step. Rotating the deploy token rotates the pass (the next deploy stores the new one).
# Usage: CLOUDFLARE_API_TOKEN=... bash scripts/ci-members-pass.sh   (prints nothing when neither key is set)
set -euo pipefail
key="${CLOUDFLARE_API_TOKEN:-${SUPABASE_SERVICE_ROLE_KEY:-}}"
[ -n "$key" ] || exit 0
printf '%s' 'pna-members-ci:v1' | openssl dgst -sha256 -hmac "$key" -binary | base64 | tr '+/' '-_' | tr -d '=\n'
