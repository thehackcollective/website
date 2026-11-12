#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${THC_ROOT:-}" ]]; then
  THC_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
fi
cd "$THC_ROOT"

BASELINE="scripts/c/_lib/baselines/import-cycles.txt"
HEADER="# import-cycles — shrink-only: each line is an import (file > imported file) on an import cycle. Lines leave, and no line joins."
MODE="check"
LEDGER=0
while (( $# > 0 )); do
  case "$1" in
    --tighten) MODE="tighten" ;;
    --ledger) LEDGER=1 ;;
    --rule)
      if [[ "${2:-}" != "import-cycles" ]]; then
        echo "  --rule ${2:-} names a structure rule. cycles has the one rule import-cycles, so it does not run."
        exit 0
      fi
      shift ;;
  esac
  shift
done

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

config="import-cycles.biome.json"
if ! python3 scripts/c/_lib/import_edges.py --config "$config" 2>/dev/null; then
  echo "✗ $config is not the same as CANONICAL_CONFIG in scripts/c/_lib/import_edges.py. Only \$schema can be different. A different key, value or extra key can make biome check fewer files or fewer imports."
  echo "  Without ignoreTypes false, biome does not see a cycle through an import type line. Restore the file from git."
  exit 1
fi
roots=()
for path in src internal workers; do [[ -d "$path" ]] && roots+=("$path"); done
out="$(bunx biome lint --config-path=import-cycles.biome.json --max-diagnostics=none --colors=off "${roots[@]}" 2>&1 || true)"
if ! grep -qE '^Checked [0-9]+ files?' <<<"$out"; then
  echo "$out" | tail -20
  echo "✗ biome did not check ${roots[*]}. Run bun install, then run ./c check cycles again."
  exit 1
fi
python3 scripts/c/_lib/import_edges.py "" <<<"$out" >"$work/now"
reported="$(sed -nE 's/^Found ([0-9]+) errors?\.?$/\1/p' <<<"$out" | head -1)"
read_count="$(wc -l <"$work/now" | tr -d ' ')"
if [[ "${reported:-0}" != "$read_count" ]]; then
  echo "✗ biome reported ${reported:-0} errors in ${roots[*]}, but import_edges.py read $read_count imports on a cycle."
  echo "  The biome output format can be different now, or a different error occurred. Read the biome output, then fix scripts/c/_lib/import_edges.py. Do not add a baseline."
  echo "$out" | tail -20
  exit 1
fi
touch "$work/now"
sort -u -o "$work/now" "$work/now"
echo "  $(wc -l <"$work/now" | tr -d ' ') imports are on an import cycle."

if [[ ! -f "$BASELINE" ]]; then
  : >"$work/allowed"
else
  { grep -v '^#' "$BASELINE" || true; } | sort -u >"$work/allowed"
fi
if (( LEDGER == 1 )); then
  echo "  import-cycles: $(wc -l <"$work/now" | tr -d ' ') now, $(wc -l <"$work/allowed" | tr -d ' ') in the baseline."
fi
FAIL=0

while IFS= read -r line; do
  echo "✗ New import cycle: $line. The first file imports the second file, and the second file leads back to the first file."
  echo "  Break the cycle at the import that points the wrong way. Move the shared type or helper down to the lower file."
  FAIL=1
done < <(comm -13 "$work/allowed" "$work/now")

gone="$(comm -23 "$work/allowed" "$work/now")"
if [[ -n "$gone" ]]; then
  if [[ "$MODE" == "tighten" || "${BASE_RULES_AUTOHEAL:-}" == 1 ]]; then
    { echo "$HEADER"; comm -12 "$work/allowed" "$work/now"; } >"$BASELINE"
    echo "✓ Removed $(wc -l <<<"$gone" | tr -d ' ') lines from $BASELINE."
    [[ "${BASE_RULES_AUTOHEAL:-}" == 1 ]] && echo "baseline-shrinks: $BASELINE"
  else
    while IFS= read -r line; do
      echo "✗ $BASELINE: $line is not on an import cycle now. Run ./c check cycles --tighten to remove the line."
    done <<<"$gone"
    FAIL=1
  fi
fi

exit "$FAIL"
