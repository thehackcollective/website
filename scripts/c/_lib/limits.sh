limit() {
  local name="$1" ref="${2:-}" rules
  if [[ -n "$ref" ]]; then
    rules="$(git -C "$THC_ROOT" show "$ref:base.rules.yaml")" \
      || { echo "✗ git cannot read base.rules.yaml at $ref. Run git fetch origin, then run the command again." >&2; return 1; }
  else
    rules="$(cat "$THC_ROOT/base.rules.yaml")"
  fi
  python3 -c 'import sys, yaml; v = (yaml.safe_load(sys.stdin).get("limits") or {}).get(sys.argv[1]); print(v) if type(v) is int else sys.exit(1)' "$name" <<<"$rules" \
    || { echo "✗ base.rules.yaml${ref:+ at $ref} has no integer limits.$name. Restore it under limits." >&2; return 1; }
}
