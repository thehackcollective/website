import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Browser } from 'playwright-core'
import { chromium } from 'playwright-core'
import type { AlignFrame, ViewerPage } from './align-capture'

export async function writeRhythmImages(
  pages: ViewerPage[],
  outDir: string,
  browser: Browser,
  regions?: AlignFrame['regions'],
): Promise<void> {
  for (const [index, capture] of pages.entries()) {
    const shot = capture.screenshots[0]
    if (shot === undefined) continue
    const { width, height } = shot.viewport
    const context = await browser.newContext({
      viewport: { width: width + 48, height: height + 48 },
      deviceScaleFactor: 1,
    })
    try {
      const page = await context.newPage()
      const url = pathToFileURL(join(outDir, 'viewer.html'))
      url.searchParams.set('export', '1')
      url.searchParams.set('page', String(index))
      await page.goto(url.href)
      await page.waitForFunction(() => {
        const image = document.querySelector('.stage img')
        return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
      })
      const crops = regions ??
        shot.regions ?? {
          sidebar: { left: 0, top: 0, right: Math.min(296, width), bottom: height },
          main: { left: Math.min(296, width), top: 0, right: width, bottom: height },
        }
      const name = `rhythm-${capture.path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${capture.width}`
      const main = crops?.main ?? { left: 0, top: 0, right: width, bottom: height }
      for (const [suffix, box] of [
        ['', main],
        ['-sidebar', crops?.sidebar],
      ] as const) {
        if (box === undefined || box === null || box.right <= box.left || box.bottom <= box.top)
          continue
        url.searchParams.set('region', suffix === '-sidebar' ? 'sidebar' : 'main')
        await page.goto(url.href)
        await page.waitForFunction(
          () => document.querySelector('.stage img') instanceof HTMLImageElement,
        )
        await page.screenshot({
          path: join(outDir, `${name}${suffix}.png`),
          clip: {
            x: box.left + 24,
            y: box.top + 24,
            width: box.right - box.left,
            height: box.bottom - box.top,
          },
        })
      }
    } finally {
      await context.close()
    }
  }
}

if (import.meta.main) {
  const directory = process.argv[2]
  if (directory === undefined || directory === '--help' || directory === '-h') {
    process.stdout.write(
      'Usage: bun scripts/align-images.ts <round-dir>\nRebuild the rhythm PNGs from the saved report and viewer.\n',
    )
    process.exit(directory === undefined ? 2 : 0)
  }
  const outDir = resolve(directory)
  const report: { pages: ViewerPage[] } = JSON.parse(
    readFileSync(join(outDir, 'report.json'), 'utf8'),
  )
  const cdp = process.env.ALIGN_CDP_URL
  const browser = await (cdp?.startsWith('ws')
    ? chromium.connectOverCDP(cdp)
    : chromium.launch({ channel: 'chrome' }))
  try {
    await writeRhythmImages(report.pages, outDir, browser)
    process.stdout.write(`Rhythm PNGs: ${outDir}\n`)
  } finally {
    await browser.close()
  }
}
