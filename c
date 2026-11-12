#!/usr/bin/env bash
set -euo pipefail

if [[ ${BASH_VERSINFO[0]} -lt 5 ]]; then
  echo "./c needs bash 5 or later. You have bash ${BASH_VERSION}. macOS ships bash 3.2." >&2
  echo "To install bash 5, run: brew install bash" >&2
  echo "Then put /opt/homebrew/bin (Apple Silicon) or /usr/local/bin (Intel) before /bin in PATH." >&2
  exit 1
fi

THC_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUBCOMMANDS="$THC_ROOT/scripts/c"

if [[ ! -d "$SUBCOMMANDS" ]]; then
  echo "./c: scripts/c/ is not at $SUBCOMMANDS" >&2
  exit 1
fi

chmod +x "$SUBCOMMANDS"/* 2>/dev/null || true

export PATH="$SUBCOMMANDS:$SUBCOMMANDS/_lib:$PATH"
export THC_ROOT

if [[ $# -eq 0 ]]; then
  exec "$SUBCOMMANDS/help"
fi

cmd="$1"
shift

if [[ ! -f "$SUBCOMMANDS/$cmd" ]]; then
  echo "./c: '$cmd' is not a known command." >&2
  echo "Run './c help' to see the commands." >&2
  exit 1
fi

exec "$SUBCOMMANDS/$cmd" "$@"
