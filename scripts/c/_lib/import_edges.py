#!/usr/bin/env python3
import json
import re
import sys


CANONICAL_CONFIG = {
    "root": True,
    "files": {"includes": ["src/**", "internal/**", "workers/**"]},
    "formatter": {"enabled": False},
    "assist": {"enabled": False},
    "linter": {
        "enabled": True,
        "rules": {
            "preset": "none",
            "suspicious": {"noImportCycles": {"level": "error", "options": {"ignoreTypes": False}}},
        },
    },
}


def config_is_strict(path):
    config = json.load(open(path))
    config.pop('$schema', None)
    return config == CANONICAL_CONFIG


def edges(prefix):
    text = re.sub(r'\x1b\[[0-9;]*m', '', sys.stdin.read())
    for block in re.split(r'\n(?=\S+:\d+:\d+ lint/suspicious/noImportCycles)', text):
        head = re.match(r'(\S+):\d+:\d+ lint/suspicious/noImportCycles', block)
        target = re.search(r'This import resolves to (\S+)', block)
        if head and target:
            print(f'{prefix}{head.group(1)} > {prefix}{target.group(1)}')


if sys.argv[1] == '--config':
    sys.exit(0 if config_is_strict(sys.argv[2]) else 1)
edges(sys.argv[1])
