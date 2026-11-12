import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ScoredFinding, ViewerPage } from './align-capture'

export interface RoundReport {
  pages: ViewerPage[]
  startingHead?: string | undefined
}

export interface RoundDiff {
  fixed: Array<{ path: string; width: number; finding: ScoredFinding }>
  new: Array<{ path: string; width: number; finding: ScoredFinding }>
  stillOpen: Array<{ id: string; oldDelta: number; newDelta: number }>
}

export interface RoundContext {
  number: number
  directory: string
  previous: RoundReport | null
  timeline: Array<{ number: number; href: string }>
}

export function nextRound(root: string): RoundContext {
  mkdirSync(root, { recursive: true })
  const rounds = readdirSync(root)
    .filter((name) => /^round-\d+$/.test(name))
    .sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)))
  const last = rounds.at(-1)
  const complete = rounds.filter((name) => existsSync(join(root, name, 'report.json')))
  const previousRound = complete.at(-1)
  const number = last === undefined ? 1 : Number(last.slice(6)) + 1
  const directory = join(root, `round-${String(number).padStart(2, '0')}`)
  mkdirSync(directory)
  const previous: RoundReport | null =
    previousRound === undefined
      ? null
      : JSON.parse(readFileSync(join(root, previousRound, 'report.json'), 'utf8'))
  return {
    number,
    directory,
    previous,
    timeline: [...complete, `round-${String(number).padStart(2, '0')}`].map((name) => ({
      number: Number(name.slice(6)),
      href: `../${name}/viewer.html`,
    })),
  }
}

export function assignFindingIds(pages: ViewerPage[]): void {
  const stable = (value: string | null) => value?.replace(/_r_\d+_/g, '_r_') ?? null
  for (const page of pages)
    for (const finding of [...page.findings, ...(page.rhythm ?? [])]) {
      finding.id = createHash('sha256')
        .update(
          JSON.stringify([
            page.path,
            page.width,
            finding.check,
            finding.check === 'hit-target' && finding.edge.startsWith('size ')
              ? 'size'
              : finding.edge,
            stable(finding.identity.a),
            stable(finding.identity.b),
          ]),
        )
        .digest('hex')
        .slice(0, 20)
    }
}

export function diffRounds(pages: ViewerPage[], previous: RoundReport | null): RoundDiff {
  const entries = (source: ViewerPage[]) =>
    new Map(
      source.flatMap((page) =>
        page.findings
          .filter((finding) => finding.noiseScore < 0.5)
          .map((finding) => [finding.id, { path: page.path, width: page.width, finding }] as const),
      ),
    )
  const key = (page: ViewerPage) => `${page.path}:${page.width}`
  const oldPages = previous?.pages ?? []
  const oldKeys = new Set(oldPages.map(key))
  const newKeys = new Set(pages.map(key))
  const before = entries(oldPages.filter((page) => newKeys.has(key(page))))
  const after = entries(pages.filter((page) => previous === null || oldKeys.has(key(page))))
  return {
    fixed: [...before].filter(([id]) => !after.has(id)).map(([, entry]) => entry),
    new: [...after].filter(([id]) => !before.has(id)).map(([, entry]) => entry),
    stillOpen: [...after].flatMap(([id, entry]) => {
      const old = before.get(id)
      return old === undefined
        ? []
        : [{ id, oldDelta: old.finding.delta, newDelta: entry.finding.delta }]
    }),
  }
}

export function saveDiff(directory: string, diff: RoundDiff): void {
  writeFileSync(join(directory, 'diff.json'), `${JSON.stringify(diff, null, 2)}\n`)
}
