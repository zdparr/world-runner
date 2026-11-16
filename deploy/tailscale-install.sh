#!/usr/bin/env bash
# Build step: download the Tailscale static binaries into .tailscale/ (no root needed).
# Runs only on Render (RENDER=true) or when TS_INSTALL=1, so local builds are unaffected.
set -euo pipefail

if [ "${RENDER:-}" != "true" ] && [ "${TS_INSTALL:-}" != "1" ]; then
  exit 0
fi

TS_VERSION="${TS_VERSION:-1.104.7}"
pkg="tailscale_${TS_VERSION}_amd64"
url="https://pkgs.tailscale.com/stable/${pkg}.tgz"
dest="$(cd "$(dirname "$0")/.." && pwd)/.tailscale"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "[tailscale] downloading ${pkg}"
curl -fsSL "$url" -o "$tmp/ts.tgz"
expected="$(curl -fsSL "${url}.sha256" | awk '{print $1}')"
actual="$(sha256sum "$tmp/ts.tgz" | awk '{print $1}')"
if [ "$expected" != "$actual" ]; then
  echo "[tailscale] checksum mismatch (expected $expected, got $actual)" >&2
  exit 1
fi

mkdir -p "$dest"
tar -xzf "$tmp/ts.tgz" -C "$tmp"
install -m 0755 "$tmp/$pkg/tailscale" "$tmp/$pkg/tailscaled" "$dest/"
"$dest/tailscale" version | head -1
