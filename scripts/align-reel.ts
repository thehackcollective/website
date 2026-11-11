import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import { bundleClient } from './align-bundle'
import { readPlaybackRounds } from './align-playback-data'

const FPS = 30
const args = process.argv.slice(2)
function stop(message: string): never {
  console.error(message)
  process.exit(2)
}
if (args.includes('--help')) {
  process.stdout.write(
    'Usage: bun scripts/align-reel.ts <round-root> [--from N] [--to N] [--region sidebar-card|sidebar|main|full]\n',
  )
  process.exit(0)
}
const root = resolve(args[0] ?? stop('Give the round folder.'))
const option = (name: string) => {
  const index = args.indexOf(name)
  return index < 0 ? undefined : args[index + 1]
}
const rounds = readPlaybackRounds(root)
const first = rounds.find((round) => round.number === Number(option('--from') ?? rounds[0]?.number))
const last = rounds.find(
  (round) => round.number === Number(option('--to') ?? rounds.at(-1)?.number),
)
if (!first || !last || first.number >= last.number) stop('Choose an earlier and a later round.')
const before = first.pages[0] ?? stop('The first round has no page.')
const after =
  last.pages.find((page) => page.path === before.path && page.width === before.width) ??
  stop('The rounds need matching pages and widths.')
const region = option('--region') ?? 'sidebar-card'
if (!['sidebar-card', 'sidebar', 'main', 'full'].includes(region)) stop('Unknown playback region.')
const script = bundleClient('align-reel-client.ts', false)
const html = join(root, 'reel.html')
writeFileSync(
  html,
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Category playback</title><body><script id="reel" type="application/json">${JSON.stringify({ before, after, region }).replaceAll('<', '\\u003c')}</script><script>${script.replaceAll('</script', '<\\/script')}</script></body></html>`,
)
const frames = join(root, 'reel-frames')
rmSync(frames, { recursive: true, force: true })
mkdirSync(frames)
const cdp = process.env.ALIGN_CDP_URL
const browser = await (cdp ? chromium.connectOverCDP(cdp) : chromium.launch({ channel: 'chrome' }))
const context = await browser.newContext({
  viewport: { width: 1920, height: 1200 },
  deviceScaleFactor: 1,
})
let duration: number
try {
  const page = await context.newPage()
  await page.goto(pathToFileURL(html).href)
  await page.evaluate(() => Reflect.get(window, 'reelReady')())
  duration = await page.evaluate(() => Number(Reflect.get(window, 'reelDuration')))
  process.stdout.write(
    `${JSON.stringify(await page.evaluate(() => Reflect.get(window, 'reelCategories')))}\n`,
  )
  for (let frame = 0; frame < Math.ceil(duration * FPS); frame += 1) {
    await page.evaluate((time) => Reflect.get(window, 'reelRender')(time), frame / FPS)
    await page
      .locator('canvas')
      .screenshot({ path: join(frames, `${String(frame).padStart(5, '0')}.png`) })
  }
} finally {
  await context.close()
  await browser.close()
}
const out = join(root, 'reel.mp4')
const result = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-loglevel',
    'error',
    '-framerate',
    String(FPS),
    '-i',
    join(frames, '%05d.png'),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '18',
    out,
  ],
  { stdio: 'inherit' },
)
if (result.status !== 0) stop('ffmpeg did not write the reel.')
rmSync(frames, { recursive: true, force: true })
process.stdout.write(
  `✓ Reel: ${out} (${duration.toFixed(1)} s, rounds ${first.number} → ${last.number})\n`,
)
