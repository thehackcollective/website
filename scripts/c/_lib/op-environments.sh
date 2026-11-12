THC_OP_ENVIRONMENT="${OP_THC_ENVIRONMENT_ID:-escb5g6qj6obx3ozvjtixcczkq}"

run_under_op_dev() {
  [[ -n "${THC_OP_RUN:-}" ]] && return 0
  if ! command -v op >/dev/null 2>&1; then
    echo "✗ The 1Password CLI (op) is not installed. Install it, then run ./c $(basename "$1") again." >&2
    exit 1
  fi
  THC_OP_RUN=1 CLOUDFLARE_INCLUDE_PROCESS_ENV=true exec op run --environment "$THC_OP_ENVIRONMENT" -- \
    "$THC_ROOT/scripts/c/_lib/with-dev-clerk-keys.sh" "$@"
}

refuse_env_files() {
  local stale
  for stale in .dev.vars .dev.vars.* .env .env.local .env.development .env.development.local workers/internal/.dev.vars; do
    if [[ -e "$stale" ]]; then
      echo "✗ $stale exists. vite and workerd would read it instead of the 1Password Environment." >&2
      echo "  Secrets live in 1Password only. Remove the file, then run the command again." >&2
      exit 1
    fi
  done
}
