import functools
import glob
import json
import os
import posixpath
import re
import subprocess
import sys
import tempfile

import yaml

REPO = os.path.abspath(sys.argv[1])
ARGS = sys.argv[2:]
ONLY = ARGS[ARGS.index('--rule') + 1] if '--rule' in ARGS[:-1] else None
EXPLAIN = ARGS[ARGS.index('--explain') + 1] if '--explain' in ARGS[:-1] else None
INIT, TIGHTEN, LEDGER = '--init' in ARGS, '--tighten' in ARGS, '--ledger' in ARGS
AUTOHEAL = os.environ.get('BASE_RULES_AUTOHEAL') == '1'
SPEC = yaml.safe_load(open(os.path.join(REPO, 'base.rules.yaml')))
BASELINES = os.path.join(REPO, SPEC['baselines'])
IMPORT_CYCLES = os.path.join(BASELINES, 'import-cycles.txt')
ALIASES = SPEC.get('aliases', {})
EXTS = tuple(SPEC.get('extensions', ['.ts', '.tsx']))
WEBAPP_FEATURES = 'internal/work/features'
SKIP_DIRS = {'node_modules', '.cloudflare', '.wrangler', '.turbo'}
AGAINST = os.environ.get('BASE_RULES_AGAINST') or 'HEAD'


@functools.lru_cache(maxsize=None)
def glob_re(pattern, star='[^/]*'):
    out, i = '', 0
    while i < len(pattern):
        c = pattern[i]
        if pattern.startswith('**/', i):
            out, i = out + '(?:.*/)?', i + 3
        elif pattern.startswith('**', i):
            out, i = out + '.*', i + 2
        elif c == '*':
            out, i = out + star, i + 1
        elif c == '{':
            j = pattern.index('}', i)
            alts = [glob_re(a, star).pattern[:-1] for a in pattern[i + 1:j].split(',')]
            out, i = out + '(?:' + '|'.join(alts) + ')', j + 1
        else:
            out, i = out + re.escape(c), i + 1
    return re.compile(out + '$')


def matches(path, patterns, star='[^/]*'):
    return any(glob_re(p, star).match(path) for p in patterns or [])


FILES = []
for root in SPEC['roots']:
    for d, dirs, fs in os.walk(os.path.join(REPO, root)):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        FILES += [os.path.relpath(os.path.join(d, f), REPO) for f in fs if f.endswith(EXTS)]
FILES.sort()
VENDORED = SPEC.get('vendored') or []
TRACKED_PATHS = sorted(set(subprocess.run(['git', '-C', REPO, 'ls-files'], capture_output=True, text=True).stdout.splitlines()))
TRACKED = [f for f in TRACKED_PATHS if os.path.isfile(os.path.join(REPO, f))]
TEXT = {}


def text(path):
    if path not in TEXT:
        TEXT[path] = open(os.path.join(REPO, path), encoding='utf-8', errors='ignore').read()
    return TEXT[path]


def in_scope(rule):
    universe = TRACKED if rule.get('universe') == 'tracked' else FILES
    return [f for f in universe
            if matches(f, rule.get('scope', ['**'])) and not matches(f, rule.get('exempt')) and not matches(f, VENDORED)]


def line_of(src, offset):
    return src.count('\n', 0, offset) + 1


def check_regex(rule):
    pat = re.compile(rule['pattern'], re.M)
    hits = {}
    for f in in_scope(rule):
        src = text(f)
        lines = [line_of(src, m.start()) for m in pat.finditer(src)]
        if lines:
            hits[f] = lines
    return hits


SLASH_COMMENT = re.compile(r'^\s*(//|/\*|\*(?!\*)|\{/\*)')
HASH_COMMENT = re.compile(r'^\s*#(?!!)')
COMMENT_SYNTAX = {
    **dict.fromkeys(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.jsonc', '.json5'], SLASH_COMMENT),
    '.css': re.compile(r'/\*'),
    '.sql': re.compile(r'(^|\s)--'),
    '.html': re.compile(r'<!--'),
    **dict.fromkeys(['.sh', '.bash', '.py', '.yml', '.yaml', '.toml', '.gitignore', '.dockerignore', '.env', '.manifest'], HASH_COMMENT),
}
SHEBANG_SYNTAX = {'bash': HASH_COMMENT, 'sh': HASH_COMMENT, 'python': HASH_COMMENT, 'node': SLASH_COMMENT, 'bun': SLASH_COMMENT}


def comment_syntax(path):
    name = os.path.basename(path)
    ext = os.path.splitext(name)[1] or ('.' + name.lstrip('.') if name.startswith('.') else '')
    if ext in COMMENT_SYNTAX:
        return COMMENT_SYNTAX[ext]
    if name == 'Brewfile':
        return HASH_COMMENT
    if not ext:
        first = text(path).split('\n', 1)[0]
        if first.startswith('#!'):
            return next((v for k, v in SHEBANG_SYNTAX.items() if re.search(rf'\b{k}\b', first)), None)
    return None


def python_docstring_lines(src):
    lines, inside, docstring = [], False, False
    for i, l in enumerate(src.splitlines(), 1):
        quotes = l.count('"""') + l.count("'''")
        if not inside and quotes and l.strip().startswith(('"""', "'''")):
            docstring = True
        if docstring:
            lines.append(i)
        if quotes % 2 == 1:
            inside = not inside
        docstring = docstring and inside
    return lines


def check_comment_ratchet(rule):
    pragma = re.compile(rule.get('pragmas', r'$^'))
    hits = {}
    for f in in_scope(rule):
        syntax = comment_syntax(f)
        if syntax is None:
            continue
        src = text(f)
        lines = [i for i, l in enumerate(src.splitlines(), 1) if syntax.search(l) and not pragma.search(l)]
        if f.endswith('.py') or syntax is HASH_COMMENT and 'python' in src.split('\n', 1)[0]:
            lines = sorted(set(lines) | set(python_docstring_lines(src)))
        if lines:
            hits[f] = lines
    return hits


IMPORT_RE = re.compile(r"""(?:\bfrom\s*|\bimport\s*\(?\s*|\bexport\s+\*\s+from\s*)['"]([^'"]+)['"]""")


def resolve(importer, spec):
    base = None
    if spec.startswith('.'):
        base = posixpath.normpath(posixpath.join(posixpath.dirname(importer), spec))
    else:
        root = next((r for r in ALIASES if importer.startswith(r + '/')), None)
        for alias, target in sorted(ALIASES.get(root, {}).items(), key=lambda kv: -len(kv[0])):
            if spec == alias.rstrip('/') or spec.startswith(alias):
                base = posixpath.join(target, spec[len(alias):]).rstrip('/')
                break
    if base is None:
        return None
    base = re.sub(r'\.(js|jsx)$', '', base)
    for cand in (base, base + '.ts', base + '.tsx', base + '/index.ts', base + '/index.tsx'):
        if os.path.isfile(os.path.join(REPO, cand)):
            return cand
    return base


def owner(path, pattern):
    m = re.search(pattern, path)
    return m.group(1) if m else None


def check_import_boundary(rule):
    hits = {}
    feature_of = rule.get('owner')
    for f in in_scope(rule):
        src = text(f)
        me = owner(f, feature_of) if feature_of else None
        for m in IMPORT_RE.finditer(src):
            tgt = resolve(f, m.group(1))
            if tgt is None or not matches(tgt, rule['forbid']):
                continue
            allow = [a.replace('{self}', me or '\0') for a in rule.get('allow', [])]
            if not matches(tgt, allow):
                hits.setdefault(f, []).append(line_of(src, m.start()))
    return hits


def check_layers(rule):
    order = rule['layers']
    rank = {name: i for i, name in enumerate(order)}
    feature = re.compile(rule['owner'])
    type_imports = rule.get('imports') == 'type-only'
    hits = {}
    for f in in_scope(rule):
        m = feature.search(f)
        if not m or m.group(1) not in rank:
            if m and type_imports:
                continue
            if m:
                hits.setdefault(f, []).append(1)
            continue
        me = m.group(1)
        src = text(f)
        for imp in IMPORT_RE.finditer(src):
            statement = max(src.rfind('import', 0, imp.start() + 1), src.rfind('export', 0, imp.start() + 1))
            type_only = not imp.group(0).startswith('import') and statement >= 0 and re.match(r'(import|export)\s+type\b', src[statement:]) is not None
            if type_only != type_imports:
                continue
            tgt = resolve(f, imp.group(1))
            t = feature.search(tgt or '')
            if t and t.group(1) != me and rank.get(t.group(1), len(order)) >= rank[me]:
                hits.setdefault(f, []).append(line_of(src, imp.start()))
    return hits


SQL_KEYWORD = re.compile(r'\b(?:SELECT|INSERT|UPDATE|DELETE)\b')
SQL_TABLE = re.compile(r'\b(?:FROM|JOIN|INTO|UPDATE)\s+([a-z_][a-z0-9_]*)\b')
SQL_CTE = re.compile(r'(?:\bWITH(?:\s+RECURSIVE)?|,)\s*([a-z_][a-z0-9_]*)\s+AS\s*\(')


def foreign_tables(src, me, rule):
    ignore = set(rule.get('not-tables', []))
    offsets = []
    for lit in re.finditer(JS_STRING, src):
        body = lit.group(1)
        word = body[1:-1]
        if word in rule['owners'] and rule['owners'][word] != me and word not in rule.get('bare-names-allowed', []):
            offsets.append((lit.start(1), word))
        if not SQL_KEYWORD.search(body):
            continue
        ctes = set(SQL_CTE.findall(body))
        offsets += [(lit.start(1) + m.start(1), m.group(1)) for m in SQL_TABLE.finditer(body)
                    if m.group(1) not in ignore | ctes and rule['owners'].get(m.group(1)) != me]
    return offsets


DETAILS = {}


def check_sql_owners(rule):
    hits = {}
    for f in in_scope(rule):
        src = text(f)
        found = foreign_tables(src, owner(f, rule['owner']), rule)
        if found:
            hits[f] = [line_of(src, o) for o, _ in found]
            DETAILS[(rule['id'], f)] = [f"{t} (owner: {rule['owners'].get(t, 'none')})" for _, t in found]
    return hits


OWNER_ERRORS = []


def declared_owners(globs, paths, read):
    owners, found = {}, []
    for path in sorted(p for p in paths if matches(p, globs)):
        me = posixpath.basename(posixpath.dirname(path))
        for n, line in enumerate((read(path) or '').splitlines(), 1):
            table = line.strip()
            if table and owners.setdefault(table, me) != me:
                found.append(f"{path}:{n}: the table {table} already has the owner {owners[table]}. One table has one owner. Remove it from one of the two owned-tables.txt files.")
    return owners, found


def owner_files_now(globs):
    return [os.path.relpath(f, REPO) for g in globs for f in glob.glob(os.path.join(REPO, g))]


def owner_files_at_head():
    return subprocess.run(['git', 'ls-tree', '-r', '--name-only', AGAINST], cwd=REPO, capture_output=True, text=True).stdout.splitlines()


TABLE_STEP = re.compile(
    r'\bCREATE\s+(?:VIRTUAL\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"?(?P<create>\w+)"?\s*\('
    r'|\bDROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?"?(?P<drop>\w+)"?'
    r'|\bALTER\s+TABLE\s+"?(?P<renamed>\w+)"?\s+RENAME\s+TO\s+"?(?P<to>\w+)"?'
    r'|\bALTER\s+TABLE\s+"?(?P<altered>\w+)"?\s+ADD\s+(?:COLUMN\s+)?"?(?P<added>\w+)"?', re.I)
ORG_COLUMN = re.compile(r'(?:org_id|tenant_id)\b')


def table_columns(src, start):
    depth, i, parts, begin = 1, start, [], start
    while depth and i < len(src):
        c = src[i]
        if c in "'\"":
            i = src.find(c, i + 1)
            if i < 0:
                break
        elif c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
        elif c == ',' and depth == 1:
            parts.append(src[begin:i])
            begin = i + 1
        i += 1
    return [p.strip() for p in parts + [src[begin:i - 1]]]


def org_tables_in(sources):
    out = {}
    for path, src in sources:
        for m in TABLE_STEP.finditer(src):
            if m.group('create'):
                out.pop(m.group('create'), None)
                if any(ORG_COLUMN.match(c) for c in table_columns(src, m.end())):
                    out[m.group('create')] = (path, line_of(src, m.start()))
            elif m.group('drop'):
                out.pop(m.group('drop'), None)
            elif m.group('renamed'):
                if m.group('renamed') in out:
                    out[m.group('to')] = out.pop(m.group('renamed'))
            elif ORG_COLUMN.fullmatch(m.group('added')):
                out[m.group('altered')] = (path, line_of(src, m.start()))
    return out


def org_tables(schema):
    return org_tables_in((f, text(f)) for f in sorted(f for f in TRACKED if matches(f, [schema])))


def eraser_steps_body(name):
    for f in FILES:
        m = re.search(rf'export const {name} = \{{ eraseSteps(?:: (\w+))?', text(f))
        if m:
            fn = re.search(rf'^(?:async )?function {m.group(1) or "eraseSteps"}\(.*?^\}}$', text(f), re.M | re.S)
            return fn.group(0) if fn else ''
    return ''


def check_erase_coverage(rule):
    hits = {}

    def hit(f, line, detail):
        hits.setdefault(f, []).append(line)
        DETAILS.setdefault((rule['id'], f), []).append(detail)

    wiring = re.search(r'orgErasers:\s*\[([^\]]*)\]', text(rule['wiring']))
    wired = set(re.findall(r'\w+', wiring.group(1))) if wiring else set()
    for f in in_scope(rule):
        for m in re.finditer(r'\b(\w+OrgEraser)\b', text(f)):
            if m.group(1) not in wired:
                hit(f, line_of(text(f), m.start()), f"{m.group(1)} (not in orgErasers of {rule['wiring']})")
    tables = org_tables(rule['schema'])
    erased = {lit.group(1)[1:-1] for name in wired for lit in re.finditer(JS_STRING, eraser_steps_body(name))}
    kept = rule.get('kept-on-erase') or {}
    for table, (f, line) in tables.items():
        if table not in erased and table not in kept:
            hit(f, line, f"{table} (no eraser step)")
    newest = max((f for f, _ in tables.values()), default='base.rules.yaml')
    for table in kept:
        if table not in tables or table in erased:
            hit(newest, 1, f"{table} (stale kept-on-erase entry)")
    return hits


def migration_problems(rule, files, before):
    name = re.compile(rule['pattern'])
    number = lambda f: name.search(f).group(1)
    problems = {}
    hit = lambda f, detail: problems.setdefault(f, []).append(detail)
    named = [f for f in files if name.search(f)]
    for f in sorted(set(files) - set(named)):
        hit(f, "the name is not NNNN_<lowercase words>.sql")
    groups = {}
    for f in named:
        groups.setdefault(number(f), []).append(f)
    allowed = set(rule.get('duplicates') or [])
    for n, group in groups.items():
        for f in group:
            if len(group) > 1 and f not in allowed:
                hit(f, f"number {n} is also the number of {', '.join(g for g in group if g != f)}")
    reset = bool(before) and not set(before) & set(files)
    top = '0000' if reset else max((number(f) for f in before if name.search(f)), default='0000')
    for f in named:
        if f not in before and number(f) <= top:
            hit(f, f"number {number(f)} is not above {top}, the highest number at {AGAINST}")
    return problems


def check_migration_numbers(rule):
    listing = subprocess.run(['git', 'ls-tree', '-r', '--name-only', AGAINST], cwd=REPO, capture_output=True, text=True)
    if listing.returncode:
        sys.exit(f"::error::[{rule['id']}] git cannot read {AGAINST}. Fetch it, or set BASE_RULES_AGAINST to a commit that exists.")
    from_main = AGAINST == 'HEAD' and subprocess.run(['git', 'merge-base', '--is-ancestor', 'MERGE_HEAD', 'origin/main'], cwd=REPO, capture_output=True).returncode == 0
    merged = subprocess.run(['git', 'ls-tree', '-r', '--name-only', 'MERGE_HEAD'], cwd=REPO, capture_output=True, text=True) if from_main else None
    tracked = listing.stdout.splitlines() + (merged.stdout.splitlines() if merged and merged.returncode == 0 else [])
    before = {f for f in tracked if matches(f, rule['scope'])}
    problems = migration_problems(rule, in_scope(rule), before)
    for f, details in problems.items():
        DETAILS[(rule['id'], f)] = details
    return {f: [1] * len(details) for f, details in problems.items()}


def check_must_be_imported(rule):
    importers = [f for f in FILES if matches(f, rule['by'])]
    imported = {resolve(f, m.group(1)) for f in importers for m in IMPORT_RE.finditer(text(f))}
    return {f: [1] for f in in_scope(rule) if f not in imported}


def check_must_match(rule):
    pat = re.compile(rule['pattern'], re.M)
    return {f: [1] for f in in_scope(rule) if not pat.search(text(f))}


def check_must_match_when(rule):
    when, pat = re.compile(rule['when'], re.M), re.compile(rule['pattern'], re.M)
    hits = {}
    for f in in_scope(rule):
        src = text(f)
        found = when.search(src)
        if found and not pat.search(src):
            hits[f] = [line_of(src, found.start())]
    return hits


def check_path(rule):
    pat = re.compile(rule['pattern'])
    paths = TRACKED_PATHS if rule.get('universe') == 'tracked' else FILES
    return {f: [1] for f in paths
            if pat.search(f) and matches(f, rule.get('scope', ['**'])) and not matches(f, rule.get('exempt')) and not matches(f, VENDORED)}


def check_ast_grep(rule):
    out = subprocess.run(
        ['ast-grep', 'scan', '--json=stream', '--filter', f"^{rule['ast-grep']}$", *SPEC['roots']],
        cwd=REPO, capture_output=True, text=True)
    hits = {}
    for line in out.stdout.splitlines():
        m = json.loads(line)
        f = os.path.relpath(os.path.join(REPO, m['file']), REPO)
        if matches(f, rule.get('scope', ['**'])) and not matches(f, rule.get('exempt')):
            hits.setdefault(f, []).append(m['range']['start']['line'] + 1)
    return hits


SHELL_SAY = re.compile(r'(?:^|[;&|{]|(?<!\$)\(|\bthen|\belse|\bdo)\s*(?:echo|printf|pass|warn|fail|ok|err|log|heading)\s+(.*)')
SHELL_QUOTED = re.compile(r'"((?:[^"\\]|\\.)*)"|\'([^\']*)\'')
SHELL_EXPANSION = re.compile(r'\$\((?:[^()]|\([^()]*\))*\)|\$\{[^}]*\}|\$[A-Za-z_][A-Za-z0-9_]*|\$[0-9#@*?]')
PRINTF_CODES = re.compile(r'%-?[0-9]*[sd]|\\[ntr]')


def without_expansions(s, opener, closer):
    out, i = [], 0
    while i < len(s):
        if s.startswith(opener, i):
            depth, j = 1, i + len(opener)
            while j < len(s) and depth:
                depth += {opener[-1]: 1, closer: -1}.get(s[j], 0)
                j += 1
            hole = s[i:j]
            out.append('`v`'.ljust(len(hole)) if '\n' not in hole else re.sub(r'[^\n]', ' ', hole))
            i = j
        else:
            out.append(s[i])
            i += 1
    return ''.join(out)


def shell_output(src):
    out, heredoc, carry = [], None, False
    for line in src.split('\n'):
        if heredoc:
            out.append('' if line.strip() == heredoc else SHELL_EXPANSION.sub('`v`', line))
            heredoc = None if line.strip() == heredoc else heredoc
            continue
        doc = re.search(r'\bcat\s+<<-?\s*[\'"]?(\w+)', line)
        said = SHELL_SAY.search(line)
        if line.startswith('#USAGE:'):
            out.append(line[len('#USAGE:'):])
        elif said or carry:
            rest = without_expansions(said.group(1) if said else line, '$(', ')')
            parts = [a or b for a, b in SHELL_QUOTED.findall(rest)]
            out.append(' '.join(PRINTF_CODES.sub(' ', SHELL_EXPANSION.sub('`v`', x)) for x in parts))
        else:
            out.append('')
        carry = bool(said or carry) and line.rstrip().endswith('\\')
        if doc:
            heredoc = doc.group(1)
    return '\n'.join(out)


def yaml_messages(src):
    out, indent = [], None
    for line in src.split('\n'):
        m = re.match(r'^(\s*)(?:message|note):\s*(.*)$', line)
        if m:
            value = m.group(2).strip()
            indent = len(m.group(1)) if value in ('>', '|', '>-', '|-', '') else None
            out.append('' if indent is not None else value.strip('"\''))
        elif indent is not None and (not line.strip() or len(line) - len(line.lstrip()) > indent):
            out.append(line.strip())
        else:
            indent = None
            out.append('')
    return '\n'.join(out)


def ts_strings(src):
    out = [c if c == '\n' else ' ' for c in src]
    ctx, depth, i = ['code'], [0], 0
    while i < len(src):
        c, mode = src[i], ctx[-1]
        if mode == 'code':
            if c in '"\'`':
                ctx.append(c)
            elif c == '{':
                depth[-1] += 1
            elif c == '}' and depth[-1] == 0 and len(ctx) > 1:
                ctx.pop()
                depth.pop()
            elif c == '}':
                depth[-1] -= 1
            i += 1
        elif c == '\\':
            out[i:i + 2] = src[i:i + 2]
            i += 2
        elif c == mode or (c == '\n' and mode != '`'):
            ctx.pop()
            i += 1
        elif mode == '`' and src.startswith('${', i):
            out[i] = 'X'
            ctx.append('code')
            depth.append(0)
            i += 2
        else:
            out[i] = c
            i += 1
    return ''.join(out)


EXTRACTORS = {'shell-output': shell_output, 'yaml-message': yaml_messages, 'ts-strings': ts_strings}


def check_ste_lint(rule):
    files = in_scope(rule)
    if not files:
        return {}
    extract = EXTRACTORS[rule['extract']] if rule.get('extract') else None
    with tempfile.TemporaryDirectory() as tmp:
        targets = {}
        for f in files:
            if extract is None:
                targets[f] = f
                continue
            dest = os.path.join(tmp, f)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, 'w', encoding='utf-8') as fh:
                fh.write(extract(text(f)))
            targets[dest] = f
        disable = ['--disable', ','.join(rule['disable'])] if rule.get('disable') else []
        run = subprocess.run([sys.executable, os.path.join(REPO, rule['linter']), '--json', *disable, *targets],
                             capture_output=True, text=True, cwd=REPO)
    if not run.stdout.strip():
        sys.exit(f"✗ [{rule['id']}] {rule['linter']} printed no result. Fix the linter, then run again.\n{run.stderr}")
    hits, sources = {}, {}
    for v in json.loads(run.stdout)['violations']:
        f = targets[v['file']]
        if f not in sources:
            sources[f] = (text(f) if extract is None else extract(text(f))).splitlines()
        line = sources[f][v['line'] - 1] if v['line'] else ''
        quoted = extract is None and line.lstrip().startswith('>')
        if v.get('level') != 'advisory' and not quoted:
            hits.setdefault(f, []).append(v['line'])
            if rule.get('baseline') != 'shrink-only':
                DETAILS.setdefault((rule['id'], f), []).append(
                    f"sub-rule {v['rule']} in \"{sentence_at(line, v.get('col') or 1, v['rule'] == 'long-sentence')}\": {v['message'].rstrip('.')}")
    return hits


def sentence_at(line, col, longest=False):
    parts = re.split(r'(?<=[.!?])\s+', line)
    if longest:
        parts = [max(parts, key=lambda p: len(p.split()))]
    start = 0
    for part in parts:
        start = line.index(part, start)
        if start + len(part) >= col - 1:
            break
        start += len(part)
    part = part.strip()
    return part if len(part) <= 100 else part[:97] + '...'


DOC_ROOTS = sorted({p.split('/', 1)[0] for p in TRACKED_PATHS if '/' in p})
DOC_PATH = re.compile(r'`(?:\./)?((?:' + '|'.join(map(re.escape, DOC_ROOTS)) + r')/[^`\s*{}<>$]+)`')
DOC_COMMAND = re.compile(r'`\./c ([a-z][\w-]*)')


def check_doc_refs(rule):
    dirs = {posixpath.dirname(f) for f in TRACKED_PATHS}
    folders = {d[:i] for d in dirs for i in [j for j, c in enumerate(d) if c == '/'] + [len(d)]}
    commands = {f for f in os.listdir(os.path.join(REPO, 'scripts/c')) if not f.startswith('_')}
    paths = set(TRACKED_PATHS)
    known = lambda p: p in paths or p in folders or f'{p}.yml' in paths or os.path.relpath(os.path.realpath(os.path.join(REPO, p)), REPO) in paths
    hits = {}
    for f in in_scope(rule):
        src = text(f)
        lines = [line_of(src, m.start()) for m in DOC_PATH.finditer(src) if not known(m.group(1).split(':')[0].rstrip('/.,)'))]
        lines += [line_of(src, m.start()) for m in DOC_COMMAND.finditer(src) if m.group(1) not in commands]
        if lines:
            hits[f] = sorted(lines)
    return hits


CSS_VAR_DEFINITION = re.compile(r'(--[\w-]+)\s*:')


def check_css_var_refs(rule):
    defined = {m.group(1) for f in TRACKED if matches(f, rule['definitions']) for m in CSS_VAR_DEFINITION.finditer(text(f))}
    pat = re.compile(rule['pattern'])
    hits = {}
    for f in in_scope(rule):
        src = text(f)
        for m in pat.finditer(src):
            if m.group(1) not in defined:
                hits.setdefault(f, []).append(line_of(src, m.start()))
                DETAILS.setdefault((rule['id'], f), []).append(f"{m.group(1)} (not defined in {', '.join(rule['definitions'])})")
    return hits


ICON_ENTRY = re.compile(r'^[ \t]*(\w+)[ \t]*:[ \t]*(\w+Icon)\b|\b(\w+Icon)\s+as\s+(\w+)\b', re.M)
ICON_FORBIDDEN = re.compile(
    r'\bexport\s+(?:const|let|var|function|class|default|async)\b'
    r'|\bexport\s*(?:type\s*)?(?:\{[^}]*\}|\*(?:\s+as\s+\w+)?)\s*from\b'
    r'|\bimport\s*(?:type\s*)?\{[^}]*\bas\b[^}]*\}'
    r'|^(?:const|let|var|function|class|enum)\b'
    r'|\bas\s+[\'"]'
    r'|/\*|//',
    re.M,
)


def duplicate_glyphs(src):
    jobs = {}
    for m in ICON_ENTRY.finditer(src):
        job, glyph = (m.group(1), m.group(2)) if m.group(2) else (m.group(4), m.group(3))
        jobs.setdefault(glyph, []).append((job, line_of(src, m.start())))
    return {glyph: found for glyph, found in jobs.items() if len(found) > 1}


def foreign_icon_exports(src):
    return [(line_of(src, m.start()), ' '.join(m.group(0).split())) for m in ICON_FORBIDDEN.finditer(src)]


def check_icon_glyph_unique(rule):
    hits = {}
    for f in in_scope(rule):
        src = text(f)
        for glyph, found in duplicate_glyphs(src).items():
            for job, line in found:
                hits.setdefault(f, []).append(line)
                DETAILS.setdefault((rule['id'], f), []).append(f"{job}: {glyph} (jobs on this glyph: {', '.join(j for j, _ in found)})")
        for line, form in foreign_icon_exports(src):
            hits.setdefault(f, []).append(line)
            DETAILS.setdefault((rule['id'], f), []).append(f"{form}: a job is only 'Glyph as job' in the one export block")
    return hits


def nav_pages():
    pages = []
    for path in sorted(glob.glob(os.path.join(REPO, WEBAPP_FEATURES, '*/entrypoint.ts'))):
        relative = os.path.relpath(path, REPO)
        src = text(relative)
        nav = re.search(r'\bnav\s*:\s*([\[{])', src)
        if not nav:
            if re.search(r'\bnav\s*:', src):
                raise ValueError(f'{relative}: nav must be a literal object or array.')
            continue
        begin, depth, quote, blocks = nav.end() - 1, 0, '', []
        start = begin
        for i in range(begin, len(src)):
            char = src[i]
            if quote:
                if char == quote and src[i - 1] != '\\':
                    quote = ''
                continue
            if char in "'\"\u0060":
                quote = char
                continue
            if char in '[{':
                depth += 1
                if char == '{' and (depth == 2 or nav.group(1) == '{' and depth == 1):
                    start = i
            elif char in ']}':
                if char == '}' and (depth == 2 or nav.group(1) == '{' and depth == 1):
                    blocks.append(src[start:i + 1])
                depth -= 1
                if depth == 0:
                    break
        for block in blocks:
            def field(name):
                match = re.search(r'\b' + name + r"\s*:\s*['\"]([^'\"]+)['\"]", block)
                return match.group(1) if match else None
            page_id = field('id')
            first_route = re.search(r"\bpath\s*:\s*['\"]([^'\"]+)['\"]", src)
            route = field('to') or (first_route.group(1) if first_route else None)
            portals = re.search(r'\bportals\s*:\s*\[([^\]]*)\]', block)
            setups = re.findall(r"['\"]([^'\"]+)['\"]", portals.group(1)) if portals else []
            if not page_id or not route:
                raise ValueError(f'{relative}: each nav page needs a literal id and route.')
            pages.append({'id': page_id, 'route': route, 'feature': relative.rsplit('/', 1)[0], 'portals': setups, 'entrypoint': relative})
    return pages


def rail_pages():
    return [page for page in nav_pages() if page['portals']]


COACHMARK_KEY = re.compile(r"^\s*(?:'([\w-]+)'|([A-Za-z_]\w*))\s*:\s*\[", re.M)
COACHMARK_ANCHOR = re.compile(r"\banchor\s*:\s*(?:'([^'\n]*)'|\"([^\"\n]*)\"|(\S))")
COACHMARK_ATTRIBUTE = re.compile(r"\bdata-coachmark\s*=\s*(?:\"([^\"\n]*)\"|'([^'\n]*)'|\{\s*'([^'\n]*)'\s*\}|\{\s*\"([^\"\n]*)\"\s*\}|(\S))")


def coachmark_file(feature):
    return feature + '/coachmarks.ts'


def coachmark_steps(path):
    src = text(path)
    keys = [(m.start(), m.group(1) or m.group(2)) for m in COACHMARK_KEY.finditer(src)]
    pages = {}
    for m in COACHMARK_ANCHOR.finditer(src):
        owner = [key for start, key in keys if start < m.start()]
        anchor = m.group(1) if m.group(1) is not None else m.group(2)
        pages.setdefault(owner[-1] if owner else None, []).append((anchor, line_of(src, m.start())))
    for _, key in keys:
        pages.setdefault(key, [])
    return pages


def coachmark_attributes(feature):
    found = []
    for path in sorted(glob.glob(os.path.join(REPO, feature, '*.tsx'))):
        relative = os.path.relpath(path, REPO)
        src = text(relative)
        for m in COACHMARK_ATTRIBUTE.finditer(src):
            value = next((group for group in m.groups()[:4] if group is not None), None)
            found.append((relative, line_of(src, m.start()), value))
    return found


def coachmark_features():
    return sorted({os.path.relpath(os.path.dirname(path), REPO) for path in glob.glob(os.path.join(REPO, WEBAPP_FEATURES, '*/coachmarks.ts'))})


def check_coachmark_coverage(rule):
    try:
        pages = rail_pages()
    except (ValueError, OSError) as error:
        print(f"[{rule['id']}] {error}", file=sys.stderr)
        return {WEBAPP_FEATURES: [1]}
    hits = {}
    for page in pages:
        path = coachmark_file(page['feature'])
        steps = coachmark_steps(path) if os.path.isfile(os.path.join(REPO, path)) else {}
        if not steps.get(page['id']):
            hits.setdefault(page['entrypoint'], []).append(1)
            DETAILS.setdefault((rule['id'], page['entrypoint']), []).append(f"{page['id']} ({page['route']}) has no step in {path}")
    return hits


def check_coachmark_anchors(rule):
    try:
        pages = rail_pages()
    except (ValueError, OSError) as error:
        print(f"[{rule['id']}] {error}", file=sys.stderr)
        return {WEBAPP_FEATURES: [1]}
    hits = {}

    def hit(path, line, detail):
        hits.setdefault(path, []).append(line)
        DETAILS.setdefault((rule['id'], path), []).append(detail)

    features = sorted(set(coachmark_features()) | {os.path.relpath(os.path.dirname(path), REPO) for path in glob.glob(os.path.join(REPO, WEBAPP_FEATURES, '*/*.tsx'))})
    for feature in features:
        if matches(feature + '/', rule.get('exempt')):
            continue
        name = feature.rsplit('/', 1)[1]
        path = coachmark_file(feature)
        steps = coachmark_steps(path) if os.path.isfile(os.path.join(REPO, path)) else {}
        ids = {page['id'] for page in pages if page['feature'] == feature}
        declared = set()
        for key, anchors in steps.items():
            if key is None or key not in ids:
                hit(path, anchors[0][1] if anchors else 1, f"{key}: not a rail page of {name}")
            for anchor, line in anchors:
                if anchor is None or not re.fullmatch(re.escape(name) + r'\.[a-z0-9]+(?:-[a-z0-9]+)*', anchor):
                    hit(path, line, f"anchor {anchor}: write a literal '{name}.<id>'")
                    continue
                declared.add(anchor)
        attributes = coachmark_attributes(feature)
        present = {value for _, _, value in attributes if value is not None}
        for anchor in sorted(declared - present):
            hit(path, next(line for anchors in steps.values() for value, line in anchors if value == anchor), f"{anchor}: no data-coachmark=\"{anchor}\" in {feature}")
        for source, line, value in attributes:
            if value is None:
                hit(source, line, "data-coachmark: write a string literal")
            elif value not in declared:
                hit(source, line, f"data-coachmark=\"{value}\": no step in {path}")
    return hits


PALETTE_HEX = re.compile(r'--thc-palette-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?)\s*;')
SEMANTIC_REF = re.compile(r'--thc-color-([a-z0-9-]+)\s*:\s*var\(--thc-palette-([a-z0-9-]+)\)')


def wcag_luminance(rgb):
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def over(hex_color, base):
    rgb = [int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    alpha = int(hex_color[7:9], 16) / 255 if len(hex_color) == 9 else 1
    return [rgb[i] * alpha + base[i] * (1 - alpha) for i in range(3)]


def check_contrast(rule):
    palette = dict(PALETTE_HEX.findall(text(rule['palette'])))
    hits = {}
    for f in in_scope(rule):
        src = text(f)
        semantic = {}
        for m in SEMANTIC_REF.finditer(src):
            semantic.setdefault(m.group(1), (m.group(2), m.start()))
        for pair in rule['pairs']:
            for token in pair['tokens']:
                if token not in semantic:
                    hits.setdefault(f, []).append(1)
                    DETAILS.setdefault((rule['id'], f), []).append(f"{token} is in the contrast pairs but not in {f}")
                    continue
                for surface in pair['surfaces']:
                    ground = over(palette[semantic[surface][0]], [1, 1, 1])
                    ink = over(palette[semantic[token][0]], ground)
                    light, dark = sorted([wcag_luminance(ink), wcag_luminance(ground)], reverse=True)
                    ratio = (light + 0.05) / (dark + 0.05)
                    if ratio < pair['min']:
                        hits.setdefault(f, []).append(line_of(src, semantic[token][1]))
                        DETAILS.setdefault((rule['id'], f), []).append(f"{token} on {surface} is {ratio:.2f}:1, under {pair['min']}:1")
        if rule.get('cover'):
            cover = re.compile(rule['cover'])
            listed = {t for pair in rule['pairs'] for t in pair['tokens']} | set(rule.get('decorative') or [])
            for name, (_, start) in semantic.items():
                if cover.match(name) and name not in listed:
                    hits.setdefault(f, []).append(line_of(src, start))
                    DETAILS.setdefault((rule['id'], f), []).append(f"{name} is in no contrast pair and not in decorative")
    return hits


EMAIL_ENTRY = re.compile(r"(\w+)\s*:\s*\{\s*palette\s*:\s*'([a-z0-9-]+)'\s*,\s*hex\s*:\s*'([^']*)'\s*\}")


def check_email_palette(rule):
    palette = dict(PALETTE_HEX.findall(text(rule['palette'])))
    hits = {}
    for f in in_scope(rule):
        src = text(f)
        entries = list(EMAIL_ENTRY.finditer(src))
        if not entries:
            hits.setdefault(f, []).append(1)
            DETAILS.setdefault((rule['id'], f), []).append("no { palette, hex } entry")
        for m in entries:
            want = palette.get(m.group(2))
            if want is None or want.lower() != m.group(3).lower():
                hits.setdefault(f, []).append(line_of(src, m.start()))
                DETAILS.setdefault((rule['id'], f), []).append(f"{m.group(1)}: {m.group(3)} is not --thc-palette-{m.group(2)} ({want or 'not defined'})")
    return hits


TOKEN_GROUP = re.compile(r'^export const (\w+) = stylex\.defineConsts\(\{(.*?)^\}\)', re.M | re.S)
TOKEN_KEY = re.compile(r"^\s+'?([\w-]+)'?\s*:\s*'([^']*)'", re.M)
TOKEN_VAR_DEFINITION = re.compile(r'^\s*(--thc-[\w-]+)\s*:', re.M)
TOKEN_VAR_READ = re.compile(r'var\(\s*(--thc-[\w-]+)')


def check_token_used(rule):
    consts_file = rule['consts']
    readers = [f for f in TRACKED if matches(f, rule['readers']) and f != consts_file and not matches(f, rule.get('not_readers', []))]
    body = '\n'.join(text(f) for f in readers)
    hits = {}
    live_vars = set()
    src = text(consts_file)
    for group in TOKEN_GROUP.finditer(src):
        name = group.group(1)
        for key in TOKEN_KEY.finditer(group.group(2)):
            k = key.group(1)
            used = re.search(r'\b' + name + r'(?:\.' + re.escape(k) + r'\b|\[\s*[\'"]' + re.escape(k) + r'[\'"]\s*\])', body)
            read = TOKEN_VAR_READ.search(key.group(2))
            if used and read:
                live_vars.add(read.group(1))
            if not used:
                line = line_of(src, group.start(2) + key.start())
                hits.setdefault(consts_file, []).append(line)
                DETAILS.setdefault((rule['id'], consts_file), []).append(f"{name}.{k} is read by no file")
    reads = {m.group(1) for f in readers for m in TOKEN_VAR_READ.finditer(text(f))}
    reads |= {'--thc-palette-' + m.group(2) for f in readers for m in EMAIL_ENTRY.finditer(text(f))}
    for f in TRACKED:
        if not matches(f, rule['definitions']):
            continue
        css = text(f)
        own = {m.group(1) for m in TOKEN_VAR_READ.finditer(css)}
        for m in TOKEN_VAR_DEFINITION.finditer(css):
            var = m.group(1)
            if var in live_vars or var in reads:
                continue
            hits.setdefault(f, []).append(line_of(css, m.start()))
            DETAILS.setdefault((rule['id'], f), []).append(f"{var} is read by no file")
    return hits


CHECKS = {
    'token-used': check_token_used,
    'email-palette': check_email_palette,
    'coachmark-anchors': check_coachmark_anchors,
    'coachmark-coverage': check_coachmark_coverage,
    'contrast': check_contrast,
    'doc-refs': check_doc_refs,
    'css-var-refs': check_css_var_refs,
    'icon-glyph-unique': check_icon_glyph_unique,
    'regex': check_regex,
    'comment-ratchet': check_comment_ratchet,
    'import-boundary': check_import_boundary,
    'must-be-imported': check_must_be_imported,
    'layers': check_layers,
    'path': check_path,
    'must-match': check_must_match,
    'must-match-when': check_must_match_when,
    'ast-grep': check_ast_grep,
    'ste-lint': check_ste_lint,
    'sql-owners': check_sql_owners,
    'erase-coverage': check_erase_coverage,
    'migration-numbers': check_migration_numbers,
}


def git_renames():
    out = subprocess.run(['git', 'diff', '-M30%', '--name-status', AGAINST], cwd=REPO, capture_output=True, text=True).stdout
    renames = {}
    for line in out.splitlines():
        parts = line.split('\t')
        if parts[0].startswith('R') and len(parts) == 3:
            renames[parts[2]] = parts[1]
    return renames


RENAMES = git_renames()


def carry_renames(base):
    for new, old in RENAMES.items():
        if old in base and new not in base and not os.path.exists(os.path.join(REPO, old)):
            base[new] = base.pop(old)
    return base


def baseline_path(rule):
    return os.path.join(BASELINES, rule['id'] + '.txt')


def read_baseline(rule):
    p = baseline_path(rule)
    if not os.path.exists(p):
        return None
    out = {}
    for line in open(p):
        if line.strip() and not line.startswith('#'):
            path, n = line.rsplit(None, 1)
            out[path] = int(n)
    return out


def write_baseline(rule, counts):
    os.makedirs(BASELINES, exist_ok=True)
    with open(baseline_path(rule), 'w') as fh:
        fh.write(f"# {rule['id']} — shrink-only: entries leave, counts fall, nothing joins or grows.\n")
        for path in sorted(counts):
            if counts[path]:
                fh.write(f"{path} {counts[path]}\n")


def head_file(path):
    out = subprocess.run(['git', 'show', f'{AGAINST}:{path}'], cwd=REPO, capture_output=True, text=True)
    return out.stdout if out.returncode == 0 else None


SEVERITY_RANK = {'off': 0, 'hint': 1, 'info': 1, 'warn': 2, 'warning': 2, 'on': 3, 'error': 3}


def biome_options(config):
    options = {}
    blocks = [config.get('linter', {})] + [o.get('linter', {}) for o in config.get('overrides', [])]
    for block in blocks:
        for group, rules in (block.get('rules') or {}).items():
            if not isinstance(rules, dict):
                continue
            for name, value in rules.items():
                if isinstance(value, dict) and 'options' in value:
                    options.setdefault(f'{group}/{name}', []).append(json.dumps(value['options'], sort_keys=True))
    return options


def biome_levels(config):
    levels = {}
    blocks = [config.get('linter', {})] + [o.get('linter', {}) for o in config.get('overrides', [])]
    for block in blocks:
        configured_rules = block.get('rules') or {}
        if configured_rules.get('preset') == 'none':
            configured_rules = {name: rules for name, rules in configured_rules.items() if name != 'preset'}
        for group, rules in configured_rules.items():
            if not isinstance(rules, dict):
                continue
            for name, value in rules.items():
                level = value.get('level') if isinstance(value, dict) else value
                if isinstance(level, str):
                    levels[f'{group}/{name}'] = max(levels.get(f'{group}/{name}', 0), SEVERITY_RANK.get(level, 0))
    return levels


JSON_STRING = r'("(?:\\.|[^"\\])*")'
SEVERITY_NAME = ['off', 'info', 'warn', 'error']


def json_loose(src):
    src = re.sub(JSON_STRING + r'|//[^\n]*|/\*.*?\*/', lambda m: m.group(1) or '', src, flags=re.S)
    return json.loads(re.sub(JSON_STRING + r'|,(\s*[}\]])', lambda m: m.group(1) or m.group(2), src))


JS_STRING = r"""('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)"""


def eslint_entries(src):
    src = re.sub(JS_STRING + r'|//[^\n]*|/\*.*?\*/', lambda m: m.group(1) or '', src, flags=re.S)
    consts = dict(re.findall(r'const (\w+) = \[(.*?)\]', src, re.S))
    lists = re.findall(r'\b(ignores|files)\s*:\s*\[(.*?)\]', src, re.S)
    lists += [('ignores', block) for block in re.findall(r'globalIgnores\(\s*\[(.*?)\]', src, re.S)]
    skips, scope = set(), set()
    for key, block in lists:
        block += ' '.join(consts.get(name, '') for name in re.findall(r'\.\.\.(\w+)', block))
        (skips if key == 'ignores' else scope).update(f'{key}:{v}' for v in re.findall(r"""['"`]([^'"`]+)['"`]""", block))
    for rule, level in re.findall(r"""['"]([@\w/-]+)['"]\s*:\s*\[?\s*['"](off|warn|error)['"]""", src):
        (scope if level == 'error' else skips).add(f'rules:{rule}:{level}')
    return skips, scope


def config_entries(config):
    skips, scope = set(), set()

    def walk(node, where):
        if isinstance(node, list):
            for item in node:
                walk(item, where)
        if not isinstance(node, dict):
            return
        for key, value in node.items():
            at = f'{where}{key}'
            if key.startswith('ignore') and key != 'ignoreUnknown' or key in ('entry', 'exclude', 'useIgnoreFile'):
                if value is True:
                    skips.add(at)
                elif isinstance(value, dict):
                    skips.update(f'{at}:{p}:{t}' for p, ts in value.items() for t in (ts if isinstance(ts, list) else [ts]))
                elif isinstance(value, (list, str)):
                    skips.update(f'{at}:{v}' for v in ([value] if isinstance(value, str) else value))
            elif key in ('includes', 'include', 'project', 'files') and isinstance(value, list):
                for v in value:
                    (skips if str(v).startswith('!') else scope).add(f'{at}:{v}')
            elif key in ('enabled', 'recommended') and isinstance(value, bool):
                (scope if value else skips).add(f'{at}:{str(value).lower()}')
            elif key == 'preset' and value == 'none' and where.endswith('linter.rules.'):
                skips.add(f'{where}recommended:false')
            elif key == 'rules' and isinstance(value, dict) and all(isinstance(v, str) for v in value.values()):
                if value.get('preset') == 'none':
                    skips.add(f'{at}.recommended:false')
                skips.update(f'{at}:{k}:{v}' for k, v in value.items() if k != 'preset' and v != 'error')
            else:
                walk(value, f'{at}.')

    walk({k: v for k, v in config.items() if k != 'overrides'}, '')
    peak = biome_levels(config)
    effective = {'**': biome_levels({'linter': config.get('linter', {})})}
    for block in config.get('overrides', []):
        globs = block.get('includes', [])
        linter = {k: v for k, v in block.get('linter', {}).items() if k != 'rules'}
        walk({**block, 'linter': linter, 'includes': [g for g in globs if g.startswith('!')]}, f"overrides[{','.join(globs)}].")
        for glob in globs:
            if not glob.startswith('!'):
                effective.setdefault(glob, dict(effective['**'])).update(biome_levels({'linter': block.get('linter', {})}))
    for glob, levels in effective.items():
        for rule, level in levels.items():
            if level < peak[rule]:
                skips.add(f'overrides[{glob}]:{rule}:{SEVERITY_NAME[level]}')
            if level:
                scope.add(f'overrides[{glob}]:{rule}')
    return skips, scope


def skip_list_errors(path, before, now):
    entries = eslint_entries if path.endswith('.mjs') else lambda src: config_entries(yaml.safe_load(src) if path.endswith('.yml') else json_loose(src))
    old_skips, old_scope = entries(before)
    new_skips, new_scope = entries(now) if now is not None else (set(), set())
    return [f"{path}: someone added '{e}'. This entry tells a tool to skip a file or a problem. Skip lists only get shorter. Fix the problem and remove the entry." for e in sorted(new_skips - old_skips)] + [
        f"{path}: someone removed '{e}'. This entry tells a tool which files or problems to check. Checked scopes only get wider. Restore the entry." for e in sorted(old_scope - new_scope) if not still_covered(e, new_scope)]


def still_covered(entry, scope):
    key, _, glob = entry.rpartition(':')
    as_globs = lambda g: [g] if re.search(r'[*?]', g) else [g, f'{g}/**']
    wider = [w for e in scope if e.rpartition(':')[0] == key for w in as_globs(e.rpartition(':')[2])]
    paths = set(TRACKED_PATHS) | {re.sub(r'^apps/[^/]+/', '', f) for f in TRACKED_PATHS}
    old = [f for f in paths if matches(f, as_globs(glob))]
    return bool(wider) and bool(old) and all(matches(f, wider) for f in old)


def read_now(path):
    full = os.path.join(REPO, path)
    return open(full).read() if os.path.exists(full) else None


def config_tamper_errors():
    found = []
    for path in SPEC.get('guarded', {}).get('skip-lists', []):
        before = head_file(path)
        if before is not None:
            found += skip_list_errors(path, before, read_now(path))
    for tsconfig in SPEC.get('guarded', {}).get('tsconfig', []):
        before, now = head_file(tsconfig), os.path.join(REPO, tsconfig)
        if before is None:
            continue
        old = json.loads(before).get('compilerOptions', {})
        new = json.load(open(now)).get('compilerOptions', {}) if os.path.exists(now) else {}
        for flag, value in old.items():
            if value is True and new.get(flag) is not True:
                found.append(f"{tsconfig}: someone set compilerOptions.{flag} to off. Strictness only increases. Set it to true again.")
    for biome in SPEC.get('guarded', {}).get('biome', []):
        before, now = head_file(biome), os.path.join(REPO, biome)
        if before is None:
            continue
        old, new = biome_levels(json_loose(before)), biome_levels(json_loose(open(now).read()) if os.path.exists(now) else {})
        for rule, level in old.items():
            if new.get(rule, 0) < level:
                found.append(f"{biome}: someone lowered the level of {rule}. Lint rules only get stricter. Set the old level again.")
        old_options = biome_options(json_loose(before))
        new_options = biome_options(json_loose(open(now).read())) if os.path.exists(now) else {}
        for rule, options in old_options.items():
            if sorted(new_options.get(rule, [])) != sorted(options):
                found.append(f"{biome}: someone changed or removed the options of {rule}. Different options can make the rule catch fewer cases. Set the old options again.")
    for rules_dir in SPEC.get('guarded', {}).get('sg-rules', []):
        listing = subprocess.run(['git', 'ls-tree', '--name-only', f'{AGAINST}:{rules_dir}'], cwd=REPO, capture_output=True, text=True)
        for name in listing.stdout.split():
            path = f'{rules_dir}/{name}'
            before, now = head_file(path), os.path.join(REPO, path)
            if before is None:
                continue
            if not os.path.exists(now):
                if not sg_still_enforced(yaml.safe_load(before), rules_dir):
                    found.append(f"{path}: someone deleted this sg-rule, and no other rule in {rules_dir} has its rule:, its severity and the files it reads. Rules only get stricter. Restore the file.")
                continue
            found += skip_list_errors(path, before, read_now(path))
            old = re.search(r'^severity:\s*(\w+)', before, re.M)
            new = re.search(r'^severity:\s*(\w+)', read_now(path), re.M)
            if old and (not new or SEVERITY_RANK.get(new.group(1), 0) < SEVERITY_RANK.get(old.group(1), 0)):
                found.append(f"{path}: someone lowered the severity. Rules only get stricter. Set the old severity again.")
    return found


def alternatives(patterns):
    out = set()
    for p in patterns or []:
        p = p.replace('{self}', '\0')
        m = re.search(r'\{([^{}]*)\}', p)
        out |= alternatives([p[:m.start()] + x + p[m.end():] for x in m.group(1).split(',')]) if m else {p}
    return out


def covers(wide, narrow):
    return wide == narrow or (wide.endswith('**') and not re.search(r'[*{\0]', wide[:-2]) and narrow.startswith(wide[:-2]))


def within(narrow, wide):
    return all(any(covers(w, n) for w in alternatives(wide)) for n in alternatives(narrow))


def dead(pattern):
    return '\0' not in pattern and not any(matches(f, [pattern]) for f in set(TRACKED) | set(FILES))


def listed(value):
    return [value] if isinstance(value, str) else value


LOOSENING_EXAMPLES = [
    ({'schema': 'src/main.tsx'}, {'schema': 'migrations/**'}, ['schema']),
    ({'schema': 'migrations/no-such-schema.sql'}, {'schema': 'migrations/**'}, []),
    ({'schema': 'migrations/0001_a.sql'}, {'schema': 'migrations/**'}, []),
    ({'owners': {'t': 'a'}}, {'owners': {'t': 'a', 'u': 'b'}, 'owners-from': ['x']}, []),
    ({'owners': {'t': 'a'}, 'owners-from': ['x']}, {'owners': {'t': 'b'}, 'owners-from': ['x']}, ['owners']),
]


def loosened_keys(old, new):
    found = []
    for key in sorted((set(old) | set(new)) - {'id', 'message', 'catalog'}):
        a, b = old.get(key), new.get(key)
        if a == b:
            continue
        if key == 'baseline' and b != 'shrink-only':
            continue
        if key == 'max' and isinstance(a, int) and isinstance(b, int) and b <= a:
            continue
        if key in ('scope', 'forbid', 'schema') and a and b and all(dead(x) or within([x], listed(b)) for x in alternatives(listed(a))):
            continue
        if key in ('exempt', 'allow', 'by', 'disable', 'not-tables', 'bare-names-allowed', 'kept-on-erase', 'duplicates', 'decorative') and within(b, a):
            continue
        if key == 'examples' and set(example_sets(a)[0]) <= set(example_sets(b)[0]):
            continue
        if key == 'owners-from':
            continue
        if key == 'owners' and isinstance(a, dict) and isinstance(b, dict) and all(b.get(t) == o for t, o in a.items()):
            continue
        found.append(key)
    return found


def tamper_errors():
    found = []
    head_spec = head_file('base.rules.yaml')
    if head_spec is None:
        return []
    before = {r['id']: r for r in yaml.safe_load(head_spec)['rules']}
    for r in before.values():
        if 'owners-from' in r:
            r['owners'] = declared_owners(r['owners-from'], owner_files_at_head(), head_file)[0]
    now = {r['id']: r for r in SPEC['rules']}
    for rid, old in before.items():
        new = now.get(rid)
        if new is None:
            found.append(f"base.rules.yaml: someone removed [{rid}]. Rules only get stricter. Restore the rule.")
            continue
        for key in loosened_keys(old, new):
            found.append(f"base.rules.yaml: [{rid}] loosens '{key}': the rule now catches fewer files or fewer cases.")
    old_spec = yaml.safe_load(head_spec)
    if set(old_spec.get('extensions', [])) - set(EXTS):
        found.append("base.rules.yaml: someone removed an extension. The scanner reads more over time, never less. Restore the extension.")
    for key in ('baselines', 'aliases'):
        if old_spec.get(key) != SPEC.get(key):
            found.append(f"base.rules.yaml: someone changed '{key}'. This change loosens the rules. Restore the old value.")
    for name, value in (old_spec.get('limits') or {}).items():
        now = (SPEC.get('limits') or {}).get(name)
        if not isinstance(now, int) or (now > value if name.endswith('-max') else now < value):
            found.append(f"base.rules.yaml: someone made limits.{name} less strict than {value}. A gate limit only gets stricter. Set it to {value} or stricter.")
    if set(old_spec.get('roots', [])) - set(SPEC.get('roots', [])):
        found.append("base.rules.yaml: someone removed a root. The scanner reads more over time, never less. Restore the root.")
    if 'vendored' in old_spec and set(VENDORED) - set(old_spec['vendored'] or []):
        found.append("base.rules.yaml: someone added a path to vendored. A vendored path skips every rule. Remove the path.")
    for kind, paths in (old_spec.get('guarded') or {}).items():
        if set(paths) - set((SPEC.get('guarded') or {}).get(kind, [])):
            found.append(f"base.rules.yaml: someone removed a path from guarded.{kind}. The guarded config only grows. Restore the path.")
    found += config_tamper_errors()
    rel = os.path.relpath(IMPORT_CYCLES, REPO)
    text_head = head_file(rel)
    if text_head is not None:
        text_now = read_now(rel)
        if text_now is not None:
            lines = lambda t: {x for x in t.splitlines() if x.strip() and not x.startswith('#')}
            for line in sorted(lines(text_now) - lines(text_head)):
                found.append(f"{rel}: someone added the line '{line}'. This baseline only gets shorter. Remove the line and break the import cycle.")
    for rule in SPEC['rules']:
        rel = os.path.relpath(baseline_path(rule), REPO)
        text_head = head_file(rel)
        if text_head is None:
            continue
        old = {}
        for line in text_head.splitlines():
            if line.strip() and not line.startswith('#'):
                path, n = line.rsplit(None, 1)
                old[path] = int(n)
        old = carry_renames(old)
        for path, n in carry_renames(read_baseline(rule) or {}).items():
            if n > old.get(path, 0):
                found.append(f"{rel}: [{rule['id']}] {path} went up from {old.get(path, 0)} to {n}. Baselines only go down. Fix the new violations.")
    return found


EXAMPLE_CHECKS = ('regex', 'must-match-when', 'path', 'sql-owners', 'migration-numbers', 'erase-coverage', 'icon-glyph-unique')


def example_sets(examples):
    sets = (examples.get('bad'), examples.get('good')) if isinstance(examples, dict) else ()
    return sets if sets and all(isinstance(x, list) and x and all(isinstance(e, str) for e in x) for x in sets) else ([], [])


def example_errors():
    found = [f"scanner.py: loosened_keys({old}, {new}) gives {loosened_keys(old, new)}, not {want}. Fix loosened_keys." for old, new, want in LOOSENING_EXAMPLES if loosened_keys(old, new) != want]
    for rule in SPEC['rules']:
        if rule['check'] not in EXAMPLE_CHECKS or ONLY and rule['id'] != ONLY:
            continue
        tag, (bad, good) = f"base.rules.yaml: [{rule['id']}]", example_sets(rule.get('examples'))
        if not bad:
            found.append(f"{tag} has no examples. Add examples.bad (a list of text the rule must catch) and examples.good (a list of text it must pass). Use a real past mistake for bad.")
            continue
        if rule['check'] in ('regex', 'must-match-when', 'sql-owners') and not in_scope(rule):
            found.append(f"{tag} reads no file. Make scope match the code that the rule is for.")
        if rule['check'] == 'sql-owners':
            caught = lambda x: bool(foreign_tables(x, rule['example-feature'], rule))
        elif rule['check'] == 'migration-numbers':
            paths = lambda names: [f'apps/api/migrations/{n}' for n in names.split()]
            caught = lambda x: bool(migration_problems(rule, paths(x.partition('->')[2]), set(paths(x.partition('->')[0]))))
        elif rule['check'] == 'erase-coverage':
            caught = lambda x: 't' in org_tables_in([('example.sql', x)])
        elif rule['check'] == 'icon-glyph-unique':
            caught = lambda x: bool(duplicate_glyphs(x) or foreign_icon_exports(x))
        elif rule['check'] == 'must-match-when':
            when, pat = re.compile(rule['when'], re.M), re.compile(rule['pattern'], re.M)
            caught = lambda x: bool(when.search(x)) and not pat.search(x)
        elif rule['check'] == 'path':
            pat = re.compile(rule['pattern'], re.M)
            caught = lambda x: bool(pat.search(x)) and matches(x, rule.get('scope', ['**'])) and not matches(x, rule.get('exempt'))
        else:
            pat = re.compile(rule['pattern'], re.M)
            caught = lambda x: bool(pat.search(x))
        found += [f"{tag} does not catch its bad example {x!r}. Fix the pattern." for x in bad if not caught(x)]
        found += [f"{tag} catches its good example {x!r}. Fix the pattern." for x in good if caught(x)]
    return found


GRAMMAR_EXTENSIONS = {'typescript': {'.ts', '.mts', '.cts'}, 'tsx': {'.tsx'}}


def sg_grammar(config):
    grammar = {lang: set(exts) for lang, exts in GRAMMAR_EXTENSIONS.items()}
    for lang, globs in (config.get('languageGlobs') or {}).items():
        for ext in (g.lstrip('*') for g in globs):
            for exts in grammar.values():
                exts.discard(ext)
            grammar.setdefault(lang.lower(), set()).add(ext)
    return grammar


def sg_source(project):
    prefix = f'{project}/' if project else ('src/', 'internal/', 'workers/')
    return [f[len(prefix):] if project else f for f in TRACKED_PATHS
            if f.startswith(prefix) and f.endswith(('.ts', '.tsx')) and '/node_modules/' not in f]


def sg_scope(rule, source):
    return [f for f in source if (not rule.get('files') or matches(f, rule['files'], '.*')) and not matches(f, rule.get('ignores'), '.*')]


def sg_reads(rule, grammar, source):
    return {f for f in sg_scope(rule, source) if f.endswith(tuple(grammar.get(rule['language'].lower(), ())))}


def sg_rules(rules_dir):
    folder = os.path.join(REPO, rules_dir)
    return {name: yaml.safe_load(open(os.path.join(folder, name))) for name in sorted(os.listdir(folder))
            if name.endswith('.yml') and os.path.isfile(os.path.join(folder, name))}


def sg_still_enforced(old, rules_dir):
    project = os.path.dirname(rules_dir)
    before = head_file(os.path.join(project, 'sgconfig.yml'))
    source = sg_source(project)
    old_grammar = sg_grammar(yaml.safe_load(before) if before else {})
    old_reads = sg_reads(old, old_grammar, source)
    grammar = sg_grammar(yaml.safe_load(open(os.path.join(REPO, project, 'sgconfig.yml'))))
    body = lambda r: (r.get('rule'), r.get('constraints'), r.get('utils'))
    exts = lambda g, r: g.get(r['language'].lower(), set()) & {'.ts', '.tsx'}
    return any(body(new) == body(old)
               and SEVERITY_RANK.get(new.get('severity'), 0) >= SEVERITY_RANK.get(old.get('severity'), 0)
               and old_reads <= sg_reads(new, grammar, source)
               and exts(old_grammar, old) <= exts(grammar, new)
               and (not new.get('files') or within(old.get('files') or ['**'], new['files']))
               and within(new.get('ignores') or [], old.get('ignores') or [])
               for new in sg_rules(rules_dir).values())


def sg_reach_errors():
    found = []
    for rules_dir in SPEC.get('guarded', {}).get('sg-rules', []):
        project = os.path.dirname(rules_dir)
        grammar = sg_grammar(yaml.safe_load(open(os.path.join(REPO, project, 'sgconfig.yml'))))
        source = sg_source(project)
        for name, rule in sg_rules(rules_dir).items():
            scope, reads = sg_scope(rule, source), sg_reads(rule, grammar, source)
            if not reads:
                found.append(f"{rules_dir}/{name}: [{rule['id']}] reads no file. Make files: match the code that the rule is for.")
            elif len(reads) < len(scope):
                skipped = sorted(set(scope) - reads)
                found.append(f"{rules_dir}/{name}: [{rule['id']}] does not read {len(skipped)} files in its files: list, for example {skipped[0]}. language: {rule['language']} does not read them. Set language: Tsx. sgconfig.yml must map *.ts to tsx in languageGlobs, so that one rule reads .ts and .tsx files.")
    return found


def branch():
    return subprocess.run(['git', '-C', REPO, 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True, text=True).stdout.strip()


CATALOG = '.agents/skills/base-framework/references/rules-catalog.md'


def catalog_rows(rule):
    rows = []
    if not os.path.exists(os.path.join(REPO, CATALOG)):
        return rows
    for line in open(os.path.join(REPO, CATALOG), encoding='utf-8'):
        cell = line.split('|')[1].strip() if line.startswith('|') else ''
        bounds = re.fullmatch(r'(\d+)(?:[–-](\d+))?', cell)
        number = rule.get('catalog')
        numbered = bounds and isinstance(number, int) and int(bounds.group(1)) <= number <= int(bounds.group(2) or bounds.group(1))
        if numbered or line.startswith('|') and f"`{rule['id']}`" in line:
            rows.append(line.strip())
    return rows


def indented(label, body):
    print(f"{label}:")
    for line in str(body).strip().splitlines():
        print(f"  {line}")


def explain_sg_rule(rid):
    for rules_dir in SPEC['guarded']['sg-rules']:
        for name in sorted(os.listdir(os.path.join(REPO, rules_dir))):
            path = os.path.join(rules_dir, name)
            if not name.endswith('.yml'):
                continue
            rule = next((d for d in yaml.safe_load_all(text(path)) if d and d.get('id') == rid), None)
            if rule:
                print(f"[{rid}] ast-grep rule in {path}. ./c check syntax runs it.")
                indented('Message', rule.get('message', ''))
                indented('Why', rule.get('note', 'The rule file has no note.'))
                indented('Files', '\n'.join(rule.get('files', ['all files of its language'])))
                if rule.get('ignores'):
                    indented('Skipped files', '\n'.join(rule['ignores']))
                indented('Fix', "Do what the message says. To see each violation, run ./c check syntax.")
                return True
    return False


def explain(rid):
    rule = next((r for r in SPEC['rules'] if r['id'] == rid), None)
    if rule is None:
        if not explain_sg_rule(rid):
            sys.exit(f"✗ {rid} is not a rule id in base.rules.yaml or in {' or '.join(SPEC['guarded']['sg-rules'])}. Run ./c check structure --ledger to see the base.rules.yaml ids.")
        return
    print(f"[{rid}] check: {rule['check']}, in base.rules.yaml. ./c check structure runs it.")
    indented('Message', ' '.join(rule['message'].split()))
    rows = catalog_rows(rule)
    why = [f"{CATALOG}:"] + rows if rows else []
    decision_dir = os.path.join(REPO, 'docs/decisions')
    decisions = sorted(f"docs/decisions/{n}" for n in (os.listdir(decision_dir) if os.path.isdir(decision_dir) else [])
                       if n.endswith('.md') and f"`{rid}`" in text(f"docs/decisions/{n}"))
    if decisions:
        why += ['Decisions that name the rule:'] + decisions
    indented('Why', '\n'.join(why) or 'No catalog row or decision names this rule.')
    files = in_scope(rule)
    where = [f"scope: {', '.join(rule.get('scope', ['**']))}"]
    if rule.get('exempt'):
        where.append(f"exempt: {', '.join(rule['exempt'])}")
    where.append(f"{len(files)} {'tracked' if rule.get('universe') == 'tracked' else 'source'} files match now.")
    if rule.get('baseline') == 'shrink-only':
        base = read_baseline(rule) or {}
        where.append(f"shrink-only baseline: {os.path.relpath(baseline_path(rule), REPO)} ({len(base)} files, {sum(base.values())} violations).")
    indented('Files', '\n'.join(where))
    bad, good = example_sets(rule.get('examples'))
    fix = [f"bad:  {x!r}" for x in bad] + [f"good: {x!r}" for x in good]
    fix.append(f"Do what the message says. To see each violation, run ./c check structure --rule {rid}.")
    indented('Fix', '\n'.join(fix))


for rule in SPEC['rules']:
    if 'owners-from' in rule:
        rule['owners'], found = declared_owners(rule['owners-from'], owner_files_now(rule['owners-from']), read_now)
        OWNER_ERRORS += found
if EXPLAIN:
    explain(EXPLAIN)
    sys.exit(0)

errors, ledger = list(OWNER_ERRORS), []
VIOLATIONS, MESSAGES = {}, {}
SHOWN_PER_RULE = 10


def violation(rid, msg, where, detail):
    VIOLATIONS.setdefault(rid, []).append((where, detail))
    if msg or rid not in MESSAGES:
        MESSAGES[rid] = msg


def print_summary():
    width = max(len(r) for r in VIOLATIONS) + 2
    print(f"  {'RULE':{width}} {'COUNT':>5}  FIRST", file=sys.stderr)
    for rid, found in VIOLATIONS.items():
        print(f"  {rid:{width}} {len(found):>5}  {found[0][0]}", file=sys.stderr)
    for rid, found in VIOLATIONS.items():
        print(f"\n[{rid}] {MESSAGES[rid]}".rstrip(), file=sys.stderr)
        for where, detail in found[:SHOWN_PER_RULE]:
            print(f"  {where}{' ' + detail if detail else ''}", file=sys.stderr)
        if len(found) > SHOWN_PER_RULE:
            print(f"  {len(found) - SHOWN_PER_RULE} more are in the full list.", file=sys.stderr)
    print('', file=sys.stderr)
if ONLY and ONLY not in {r['id'] for r in SPEC['rules']}:
    print(f"::error::base.rules.yaml has no rule {ONLY}. Run ./c check structure --ledger to see the rule ids.", file=sys.stderr)
    sys.exit(2)
if not ONLY:
    errors += example_errors()
    errors += sg_reach_errors()
loosened = [] if ONLY else tamper_errors()
if os.environ.get('GITHUB_ACTIONS') == 'true':
    if loosened and os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as fh:
            fh.write("## This PR loosens Base rules\n\nRead the reason in the PR description. If you agree, add the rules-approved label. If the label is already there, remove it and add it again.\n\n")
            fh.writelines(f"- {e}\n" for e in loosened)
    if os.environ.get('BASE_RULES_LOOSEN') != 'human-approved':
        errors += [f"{e} Or approve it: after the last push, an Opus review sub-agent approves the loosening and the orchestrator adds the rules-approved label to the PR. If the label is already there, remove it and add it again." for e in loosened]
elif branch() in ('main', 'HEAD') or os.environ.get('BASE_RULES_TARGET') == 'main':
    errors += [f"{e} Or loosen it on a branch and open a PR. After an Opus review approves the loosening, the orchestrator adds the rules-approved label." for e in loosened]
else:
    for e in loosened:
        print(f"⚠ {e} CI passes it only when the rules-approved label is on the PR.", file=sys.stderr)
for rule in SPEC['rules']:
    if ONLY and rule['id'] != ONLY:
        continue
    hits = CHECKS[rule['check']](rule)
    counts = {f: len(v) for f, v in hits.items()}
    msg = ' '.join(rule['message'].split())
    tag = f"[{rule['id']}]"
    if rule.get('baseline') != 'shrink-only':
        for f, lines in hits.items():
            detail = DETAILS.get((rule['id'], f), [])
            for i, n in enumerate(lines):
                violation(rule['id'], msg, f"{f}:{n}", detail[i] + '.' if i < len(detail) else '')
        ledger.append((rule['id'], rule.get('catalog', ''), sum(counts.values()), '-'))
        continue
    base = read_baseline(rule)
    if base is not None:
        base = carry_renames(base)
    if base is None:
        if INIT:
            write_baseline(rule, counts)
            print(f"wrote the baseline for {rule['id']} ({sum(counts.values())} in {len(counts)} files)")
            base = counts
        else:
            errors.append(f"base.rules.yaml: {tag} has baseline: shrink-only, but {os.path.relpath(baseline_path(rule), REPO)} does not exist. When you add the rule, run ./c check structure --init one time.")
            continue
    if TIGHTEN or AUTOHEAL or os.environ.get('GITHUB_ACTIONS') != 'true':
        tightened = {f: min(n, counts.get(f, 0)) for f, n in base.items()}
        if tightened != base:
            write_baseline(rule, tightened)
            base = {f: n for f, n in tightened.items() if n}
            if AUTOHEAL:
                print(f"baseline-shrinks: {os.path.relpath(baseline_path(rule), REPO)}")
            elif not TIGHTEN:
                print(f"✓ {os.path.relpath(baseline_path(rule), REPO)} went down. Commit the lower baseline with your change.")
    for f, lines in hits.items():
        allowed = base.get(f, 0)
        if len(lines) > allowed:
            where = f"{f}:{lines[0]}" if not allowed else f
            detail = DETAILS.get((rule['id'], f))
            names = f" Tables: {', '.join(sorted(set(detail)))}." if detail else ''
            violation(rule['id'], msg, where, f"{len(lines)} violations, but the baseline allows {allowed}.{names}")
    for f, allowed in base.items():
        if counts.get(f, 0) < allowed:
            violation(rule['id'], '', os.path.relpath(baseline_path(rule), REPO), f"{f} went down from {allowed} to {counts.get(f, 0)}. Run ./c check structure --tighten to keep the lower number.")
    ledger.append((rule['id'], rule.get('catalog', ''), sum(counts.values()), sum(base.values())))

if LEDGER:
    print(f"{'rule':34} {'#':>6} {'now':>6} {'base':>6}")
    for rid, cat, now, base in ledger:
        print(f"{rid:34} {str(cat):>6} {now:>6} {str(base):>6}")
full = errors + [f"{where}: [{rid}]{' ' + detail if detail else ''}{' ' + MESSAGES[rid] if MESSAGES[rid] else ''}"
                 for rid, found in VIOLATIONS.items() for where, detail in found]
if full:
    log = os.environ.get('BASE_RULES_LOG') or os.path.join(REPO, '.c-runtime/logs/structure.log')
    os.makedirs(os.path.dirname(log), exist_ok=True)
    with open(log, 'w') as fh:
        fh.writelines(f"{e}\n" for e in full)
    shown = full if ONLY or os.environ.get('GITHUB_ACTIONS') == 'true' else errors
    for e in shown:
        print(f"::error::{e}", file=sys.stderr)
    if VIOLATIONS and shown is errors:
        print_summary()
    print(f"✗ base rules: {len(full)} violation(s). The full list is in {log}. To learn about a rule, run ./c explain <rule-id>.", file=sys.stderr)
    sys.exit(1)
print(f"✓ base rules: all {len(ledger)} rules pass")
