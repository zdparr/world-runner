#!/usr/bin/env bash
# Start the server. When TS_AUTHKEY is set (on Render), first join the tailnet with tailscaled in
# userspace mode (no root or TUN device) so model calls can reach the self-hosted model server
# through tailscaled's local HTTP proxy (LLM_PROXY_URL). Without TS_AUTHKEY this just runs the app.
set -uo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
ts="$root/.tailscale"
sock="/tmp/tailscaled.sock"
proxy_port="${TS_PROXY_PORT:-1055}"

if [ -n "${TS_AUTHKEY:-}" ]; then
  if [ ! -x "$ts/tailscaled" ]; then
    echo "[tailscale] binaries missing in $ts (did the build run deploy/tailscale-install.sh?)" >&2
  else
    "$ts/tailscaled" \
      --tun=userspace-networking \
      --state=mem: \
      --socket="$sock" \
      --outbound-http-proxy-listen="127.0.0.1:${proxy_port}" \
      >/tmp/tailscaled.log 2>&1 &

    # The key is tagged (tag:render) and ephemeral: this instance leaves the tailnet when it stops.
    if "$ts/tailscale" --socket="$sock" up \
      --authkey="$TS_AUTHKEY" \
      --hostname="${TS_HOSTNAME:-narrator-render}" \
      --accept-dns=false \
      --timeout=60s; then
      echo "[tailscale] joined the tailnet as $("$ts/tailscale" --socket="$sock" ip -4 2>/dev/null)"
      if [ -n "${LLM_BASE_URL:-}" ]; then
        # Same path the app uses: CONNECT through the proxy to the model server.
        if version="$(curl -fsS -m 15 --proxytunnel -x "http://127.0.0.1:${proxy_port}" "${LLM_BASE_URL%/}/api/version")"; then
          echo "[tailscale] model server reachable at $LLM_BASE_URL: $version"
        else
          echo "[tailscale] WARNING: model server at $LLM_BASE_URL is not reachable through the tailnet" >&2
        fi
      fi
    else
      echo "[tailscale] FAILED to join the tailnet; model calls will fail. tailscaled log:" >&2
      tail -n 40 /tmp/tailscaled.log >&2
    fi
  fi
fi

exec node "$root/server/dist/index.js"
