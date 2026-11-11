KNOWN_SERVICES=("site" "work")
RUNTIME_DIR="$THC_ROOT/.c-runtime"
SITE_PORT=5173
WORK_PORT=5281

require_known_service() {
  local svc="$1" s
  for s in "${KNOWN_SERVICES[@]}"; do [[ "$svc" == "$s" ]] && return 0; done
  echo "✗ $svc is not a service. The services are: ${KNOWN_SERVICES[*]}." >&2
  exit 2
}

service_port() {
  case "$1" in
    site) echo "$SITE_PORT" ;;
    work) echo "$WORK_PORT" ;;
  esac
}

service_url() {
  case "$1" in
    site) echo "http://localhost:$SITE_PORT" ;;
    work) echo "http://localhost:$WORK_PORT" ;;
  esac
}

descendants_of() {
  local parent="$1" child
  for child in $(pgrep -P "$parent" 2>/dev/null || true); do
    echo "$child"
    descendants_of "$child"
  done
}

stop_pid_gracefully() {
  local pid="$1" all_pids p i=0
  all_pids="$pid $(descendants_of "$pid")"
  for p in $all_pids; do kill -TERM "$p" 2>/dev/null || true; done
  while (( i < 10 )); do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.5
    i=$((i + 1))
  done
  for p in $all_pids; do kill -KILL "$p" 2>/dev/null || true; done
}

port_is_free() { ! lsof -nP -tiTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }
