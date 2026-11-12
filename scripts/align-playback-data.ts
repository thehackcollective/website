import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ViewerPage } from './align-capture'
import type { PlaybackRound } from './align-playback'

export function readPlaybackRounds(root: string): PlaybackRound[] {
  return readdirSync(root)
    .filter((name) => /^round-\d+$/.test(name) && existsSync(join(root, name, 'report.json')))
    .sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)))
    .map((name) => {
      const report: { pages: ViewerPage[]; startingHead?: string } = JSON.parse(
        readFileSync(join(root, name, 'report.json'), 'utf8'),
      )
      return {
        number: Number(name.slice(6)),
        startingHead: report.startingHead,
        pages: report.pages.map((page) => ({
          ...page,
          screenshots: page.screenshots.slice(0, 1).map((shot) => ({
            ...shot,
            clean: `data:image/png;base64,${readFileSync(shot.clean).toString('base64')}`,
            skeleton: `data:image/png;base64,${readFileSync(shot.skeleton).toString('base64')}`,
            fullClean:
              shot.fullClean === undefined
                ? undefined
                : `data:image/png;base64,${readFileSync(shot.fullClean).toString('base64')}`,
            fullSkeleton:
              shot.fullSkeleton === undefined
                ? undefined
                : `data:image/png;base64,${readFileSync(shot.fullSkeleton).toString('base64')}`,
          })),
        })),
      }
    })
}
