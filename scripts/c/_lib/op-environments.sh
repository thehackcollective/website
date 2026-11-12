THC_OP_DEV_PLACEHOLDER="fill-in-the-thc-dev-1password-environment-id"
THC_OP_PROD_PLACEHOLDER="fill-in-the-thc-prod-1password-environment-id"
THC_OP_DEV="${OP_THC_ENVIRONMENT_ID:-$THC_OP_DEV_PLACEHOLDER}"
THC_OP_PROD="${OP_THC_PROD_ENVIRONMENT_ID:-$THC_OP_PROD_PLACEHOLDER}"

require_op_environment() {
  local id="$1" placeholder="$2" name="$3"
  if [[ -z "$id" || "$id" == "$placeholder" ]]; then
    echo "✗ The 1Password $name Environment id is not set. Louis puts it in scripts/c/_lib/op-environments.sh in place of $placeholder." >&2
    exit 1
  fi
}

run_under_op_dev() {
  [[ -n "${THC_OP_RUN:-}" ]] && return 0
  require_op_environment "$THC_OP_DEV" "$THC_OP_DEV_PLACEHOLDER" dev
  if ! command -v op >/dev/null 2>&1; then
    echo "✗ The 1Password CLI (op) is not installed. Install it, then run ./c $(basename "$1") again." >&2
    exit 1
  fi
  THC_OP_RUN=1 CLOUDFLARE_INCLUDE_PROCESS_ENV=true exec op run --environment "$THC_OP_DEV" -- "$@"
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
