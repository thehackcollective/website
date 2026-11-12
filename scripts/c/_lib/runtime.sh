RUNTIME_ENTRIES=("logs" "pids" ".DS_Store")

check_runtime_dir() {
  local dir="$1/.c-runtime" entry name ok allowed bad=0
  [[ -d "$dir" ]] || return 0
  for entry in "$dir"/* "$dir"/.[!.]*; do
    [[ -e "$entry" || -L "$entry" ]] || continue
    name="${entry##*/}"
    allowed=0
    for ok in "${RUNTIME_ENTRIES[@]}"; do
      [[ "$name" == "$ok" ]] && allowed=1
    done
    if (( allowed == 0 )); then
      echo "✗ .c-runtime/$name: .c-runtime holds dev-server logs and pids only. Attach proof to the PR. Do not keep it in the repo." >&2
      bad=1
    fi
  done
  return $bad
}
