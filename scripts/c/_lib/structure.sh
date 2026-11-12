#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${THC_ROOT:-}" ]]; then
  THC_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
fi

SCANNER_FLAGS=()
RULE=""
while (( $# > 0 )); do
  case "$1" in
    --rule)
      RULE="${2:-}"
      [[ -n "$RULE" ]] || { echo "✗ --rule needs a rule id. Give a rule id after --rule." >&2; exit 2; }
      SCANNER_FLAGS+=("$1" "$RULE")
      shift ;;
    --*) SCANNER_FLAGS+=("$1") ;;
  esac
  shift
done

if [[ -n "$RULE" ]]; then
  exec python3 "$THC_ROOT/scripts/c/_lib/scanner.py" "$THC_ROOT" "${SCANNER_FLAGS[@]}"
fi

SRC="$THC_ROOT/src"
COMPONENTS="$SRC/components"
FAIL=0

fail() {
  echo "::error::$1" >&2
  FAIL=1
}

in_list() {
  local item="$1" list="$2" x
  for x in $list; do [[ "$item" == "$x" ]] && return 0; done
  return 1
}

if [[ -d "$COMPONENTS" ]]; then
  for entry in "$COMPONENTS"/*; do
    [[ -e "$entry" ]] || continue
    name="$(basename "$entry")"
    if [[ "$name" != "ui" ]]; then
      fail "src/components/ contains '$name'. components/ can contain only ui/."
    fi
  done
  while IFS= read -r -d '' f; do
    fail "src/components/ contains the file '$(basename "$f")'. Put shared UI in components/ui/ and feature code in features/<name>/workspace/."
  done < <(find "$COMPONENTS" -maxdepth 1 -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) -print0)
fi

if [[ -d "$COMPONENTS/ui" ]]; then
  for entry in "$COMPONENTS/ui"/*; do
    [[ -d "$entry" ]] && fail "src/components/ui/ contains the directory '$(basename "$entry")'. ui/ must be flat."
  done
fi

SRC_ALLOWED_DIRS="app components features lib tokens"
SRC_ALLOWED_FILES="main.tsx"

if [[ -d "$SRC" ]]; then
  for entry in "$SRC"/*; do
    [[ -e "$entry" ]] || continue
    name="$(basename "$entry")"
    if [[ -d "$entry" ]]; then
      in_list "$name" "$SRC_ALLOWED_DIRS" || fail "src/ contains the directory '$name'. Allowed directories: $SRC_ALLOWED_DIRS."
    elif ! in_list "$name" "$SRC_ALLOWED_FILES"; then
      fail "src/ contains the top-level file '$name'. Allowed top-level files: $SRC_ALLOWED_FILES."
    fi
  done
fi

LIB_SUBDIRS="api auth hooks"
APP_SUBDIRS="shell"

check_flat_plus_subdirs() {
  local dir="$1" allowed_subdirs="$2" label="$3" entry name
  for entry in "$dir"/*; do
    [[ -d "$entry" ]] || continue
    name="$(basename "$entry")"
    in_list "$name" "$allowed_subdirs" && continue
    fail "$label/ contains the directory '$name'. Allowed: ${allowed_subdirs:-none}. A new subdirectory needs an allowlist decision. Do not only add a folder."
  done
}

[[ -d "$SRC/lib" ]] && check_flat_plus_subdirs "$SRC/lib" "$LIB_SUBDIRS" "src/lib"
[[ -d "$SRC/app" ]] && check_flat_plus_subdirs "$SRC/app" "$APP_SUBDIRS" "src/app"
for sub in $LIB_SUBDIRS; do
  [[ -d "$SRC/lib/$sub" ]] || continue
  for entry in "$SRC/lib/$sub"/*; do
    [[ -d "$entry" ]] && fail "src/lib/$sub/ contains the directory '$(basename "$entry")'. src/lib/$sub/ must be flat."
  done
done

SITE_FEATURES_MACHINERY="catalog.ts entrypoint.ts"
SITE_FEATURE_FILES="entrypoint.ts index.ts feature-map.md workspace"
SITE_FEATURE_MAP_HEADINGS=("Sub-features" "How to get to it" "Gotchas" "Verify")

if [[ -d "$SRC/features" ]]; then
  for entry in "$SRC/features"/*; do
    [[ -e "$entry" ]] || continue
    name="$(basename "$entry")"
    if [[ -f "$entry" ]]; then
      in_list "$name" "$SITE_FEATURES_MACHINERY" || fail "src/features/ contains the file '$name'. The top level holds only $SITE_FEATURES_MACHINERY. Put product code in a feature folder. features/catalog.ts finds each <name>/entrypoint.ts, so a feature adds files and never edits a shared root."
      continue
    fi
    for required in $SITE_FEATURE_FILES; do
      [[ -e "$entry/$required" ]] || fail "src/features/$name/ does not have $required. A feature has exactly entrypoint.ts, index.ts, feature-map.md and workspace/."
    done
    for extra in "$entry"/*; do
      [[ -e "$extra" ]] || continue
      in_list "$(basename "$extra")" "$SITE_FEATURE_FILES" && continue
      fail "src/features/$name/ contains '$(basename "$extra")'. A feature has exactly entrypoint.ts, index.ts, feature-map.md and workspace/. Move it into workspace/."
    done
    if [[ -d "$entry/workspace" ]]; then
      for sub in "$entry/workspace"/*; do
        [[ -d "$sub" ]] && fail "src/features/$name/workspace/ contains the directory '$(basename "$sub")'. workspace/ is flat."
      done
      if [[ -f "$entry/entrypoint.ts" ]] && grep -q "path:" "$entry/entrypoint.ts" && ! compgen -G "$entry/workspace/view*.tsx" >/dev/null; then
        fail "src/features/$name/ declares routes, but workspace/ has no view*.tsx. Each feature with routes opens one or more lazy views (view.tsx or view.<name>.tsx)."
      fi
    fi
    if [[ -f "$entry/feature-map.md" ]]; then
      for heading in "${SITE_FEATURE_MAP_HEADINGS[@]}"; do
        grep -qxF "## $heading" "$entry/feature-map.md" || fail "src/features/$name/feature-map.md does not have the '## $heading' section. A site feature map has Sub-features, How to get to it, Gotchas and Verify."
      done
    fi
    while IFS= read -r hit; do
      fail "${hit%%:*} imports '${hit#*:}'. A different feature is reachable only through its index edge '@/features/<name>'."
    done < <(grep -rhoE "from[[:space:]]+['\"]@/features/[^/'\"]+/[^'\"]+['\"]" "$entry" 2>/dev/null | grep -v "@/features/$name/" | sed -E "s#.*['\"](@/features/[^'\"]+)['\"]#src/features/$name:\1#" || true)
    while IFS= read -r hit; do
      fail "${hit%%:*} imports its own index '@/features/$name'. Inside a feature, import '@/features/$name/workspace/<file>'."
    done < <(grep -rlE "from[[:space:]]+['\"]@/features/$name['\"]" "$entry" 2>/dev/null | sed "s#^$THC_ROOT/##" || true)
  done
fi

WORK="$THC_ROOT/internal/work"
WORK_FEATURES_MACHINERY="catalog.tsx entrypoint.ts"
WORK_FEATURE_REQUIRED="entrypoint.ts index.ts feature-map.md"

if [[ -d "$WORK/features" ]]; then
  for entry in "$WORK/features"/*; do
    [[ -e "$entry" ]] || continue
    name="$(basename "$entry")"
    if [[ -f "$entry" ]]; then
      in_list "$name" "$WORK_FEATURES_MACHINERY" || fail "internal/work/features/ contains the file '$name'. The top level holds only catalog.tsx and entrypoint.ts. Put product code in a feature folder."
      continue
    fi
    for required in $WORK_FEATURE_REQUIRED; do
      [[ -f "$entry/$required" ]] || fail "internal/work/features/$name/ does not have $required. An App feature has entrypoint.ts, index.ts (its one public edge) and feature-map.md, and flat files."
    done
    for sub in "$entry"/*; do
      [[ -d "$sub" ]] && fail "internal/work/features/$name/ contains the directory '$(basename "$sub")'. An App feature is flat."
    done
    while IFS= read -r hit; do
      fail "${hit} imports its own index '@internal/work/features/$name'. Inside a feature, import the file by its full path."
    done < <(grep -rlE "from[[:space:]]+['\"]@internal/work/features/$name['\"]" "$entry" 2>/dev/null | sed "s#^$THC_ROOT/##" || true)
  done
elif [[ -d "$THC_ROOT/internal" ]]; then
  fail "internal/ exists, but internal/work/features/ does not. The App keeps each feature in internal/work/features/<name>/."
fi

python3 "$THC_ROOT/scripts/c/_lib/scanner.py" "$THC_ROOT" ${SCANNER_FLAGS[@]+"${SCANNER_FLAGS[@]}"} || FAIL=1

declare -A PACKAGE_SCRIPTS_ALLOWED=(
  [package.json]="dev build typecheck deploy"
)
for pkg in "${!PACKAGE_SCRIPTS_ALLOWED[@]}"; do
  [[ -f "$THC_ROOT/$pkg" ]] || continue
  while IFS= read -r script; do
    [[ " ${PACKAGE_SCRIPTS_ALLOWED[$pkg]} " == *" $script "* ]] && continue
    fail "$pkg has the script '$script', and ./c does not call it. A package script that nothing calls is a second entry point that drifts. Run the tool through ./c (or bunx) and delete the script. Add it to the allowlist in scripts/c/_lib/structure.sh only if ./c or a deploy calls it."
  done < <(jq -r '.scripts // {} | keys[]' "$THC_ROOT/$pkg")
done

PUBLIC_LARGE_ALLOWED=""
PUBLIC_MAX_BYTES=1048576

while IFS= read -r f; do
  rel="${f#public/}"
  case "$rel" in
    *.wav|*.mp3|*.mov|*.gif)
      fail "public contains the media file '$rel'. The Worker deploys each byte of public/ and serves it on the hot path. Serve media from R2." ;;
  esac
  size=$(wc -c < "$THC_ROOT/$f" 2>/dev/null || echo 0)
  if (( size > PUBLIC_MAX_BYTES )); then
    allowed=0
    for a in $PUBLIC_LARGE_ALLOWED; do
      [[ "$rel" == "$a" ]] && allowed=1 && break
    done
    if [[ $allowed -eq 0 ]]; then
      fail "The public/ file '$rel' is ${size} bytes (more than 1 MiB). Move large media to R2. Do not add to the allowlist."
    fi
  fi
done < <(git -C "$THC_ROOT" ls-files public internal/public)

if [[ $FAIL -ne 0 ]]; then
  echo "✗ The structure checks failed." >&2
  exit 1
fi

echo "✓ The structure checks passed."
