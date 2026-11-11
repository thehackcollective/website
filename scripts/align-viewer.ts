import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { bundleClient } from './align-bundle'
import type { ViewerPage } from './align-capture'
import { readPlaybackRounds } from './align-playback-data'
import type { RoundContext, RoundDiff } from './align-round'

export async function writeViewer(
  pages: ViewerPage[],
  outDir: string,
  round: RoundContext | null,
  diff: RoundDiff,
): Promise<void> {
  const embed = (source: ViewerPage[]) =>
    source.map((page) => ({
      ...page,
      screenshots: page.screenshots.map((shot) => ({
        ...shot,
        clean: `data:image/png;base64,${readFileSync(shot.clean).toString('base64')}`,
        skeleton: `data:image/png;base64,${readFileSync(shot.skeleton).toString('base64')}`,
      })),
    }))
  const data = {
    pages: embed(pages),
    previous: embed(round?.previous?.pages ?? []),
    round: round?.number ?? null,
    timeline: round?.timeline ?? [],
    diff,
    playbackRounds: round ? readPlaybackRounds(dirname(outDir)) : [],
  }
  const script = bundleClient('align-viewer-client.ts', true)
  const css = readFileSync(join(import.meta.dirname, 'align-viewer.css'), 'utf8')
  writeFileSync(
    join(outDir, 'viewer.html'),
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alignment reel</title><style>${css}</style><body><script id="report" type="application/json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script><script>${script.replaceAll('</script', '<\\/script')}</script></body></html>`,
  )
}
