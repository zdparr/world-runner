#!/usr/bin/env bash
# Draws a world's map with its placed locations to ~/map-previews/<world>.png, for checking by eye.
# Usage: scripts/preview-map.sh <worldId>      (then view the PNG)
set -euo pipefail
world="$1"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$HOME/map-previews"   # under $HOME: the snap Firefox cannot read /tmp
mkdir -p "$out/profile-$world"
export PATH="$HOME/.nvm/versions/node/v22.23.5/bin:$PATH"
(cd "$root/web" && npx tsx ../scripts/preview-map.tsx "$world" "$out/$world.svg" 2>&1 | grep -v 'incorrect casing')
read -r w h < <(grep -o 'width="[0-9.]*" height="[0-9.]*"' "$out/$world.svg" | head -1 | tr -dc '0-9. \n' | awk '{printf "%d %d\n", $1+0.5, $2+0.5}')
timeout 100 firefox --headless --no-remote -profile "$out/profile-$world" --screenshot "$out/$world.png" --window-size "$w,$h" "file://$out/$world.svg" >/dev/null 2>&1
echo "$out/$world.png (${w}x${h})"
