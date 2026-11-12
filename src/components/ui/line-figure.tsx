import * as stylex from '@stylexjs/stylex'
import { useRef } from 'react'
import type { FigureHandle, FigureModule } from '@/lib/figure-stage'
import { useMountEffect } from '@/lib/use-mount-effect'
import { lineFigureStyles as styles } from '@/ui/line-figure.stylex'

export type FigureLoader = () => Promise<FigureModule>

const svgNamespace = 'http://www.w3.org/2000/svg'

export function LineFigure({
  load,
  size = 'page',
}: {
  load: FigureLoader
  size?: 'compact' | 'page'
}) {
  const host = useRef<HTMLDivElement | null>(null)

  useMountEffect(() => {
    let live = true
    let mounted: { handle: FigureHandle; svg: SVGSVGElement } | null = null
    void Promise.resolve()
      .then(load)
      .then((figure) => {
        const stage = host.current
        if (!live || !stage) return
        const svg = document.createElementNS(svgNamespace, 'svg')
        svg.setAttribute('viewBox', '0 0 400 320')
        svg.setAttribute('aria-hidden', 'true')
        svg.setAttribute('class', stylex.props(styles.svg).className ?? '')
        stage.appendChild(svg)
        try {
          mounted = {
            handle: figure.mount({ stage, svg, read: { textContent: null } }, figure.value),
            svg,
          }
        } catch (error) {
          svg.remove()
          throw error
        }
      })
      .catch((error: unknown) => {
        console.error('LineFigure failed to mount', error)
      })
    return () => {
      live = false
      mounted?.handle.destroy()
      mounted?.svg.remove()
    }
  })

  return (
    <div
      ref={host}
      data-hairline=""
      aria-hidden="true"
      {...stylex.props(styles.stage, size === 'compact' && styles.compact)}
    />
  )
}
