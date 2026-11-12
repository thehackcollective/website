import type { ViewerPage } from './align-capture'
import { createPlayback } from './align-playback'

const data: { before: ViewerPage; after: ViewerPage; region: string } = JSON.parse(
  document.querySelector('#reel')?.textContent ?? '{}',
)
const canvas = document.createElement('canvas')
document.body.style.margin = '0'
document.body.append(canvas)
const ready = createPlayback(canvas, data.before, data.after, data.region).then((player) => {
  Object.assign(window, {
    reelDuration: player.duration,
    reelRender: player.render,
    reelCategories: player.categories.map((category) => ({
      name: category.name,
      count: category.pairs.length,
    })),
  })
  player.render(0)
})
Object.assign(window, { reelReady: () => ready })
