import * as stylex from '@stylexjs/stylex'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import type { FluidRect } from '@/lib/hooks/use-fluid-hover'
import { exitTween, spring } from '@/lib/motion'
import { fluidHoverHighlightStyles as styles } from '@/ui/fluid-hover-highlight.stylex'

export function FluidHoverHighlight({
  rect,
  base,
  tone = 'hover',
  corner = 'md',
}: {
  rect: FluidRect | null
  base: { width: number; height: number } | null
  tone?: 'hover' | 'canvas'
  corner?: 'md' | 'nestMdXxs' | 'nestLgXs'
}) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {rect && base && (
        <m.div
          key="fluid-hover-highlight"
          aria-hidden
          {...stylex.props(
            styles.highlight(base.width, base.height),
            tone === 'canvas' && styles.canvas,
            corner === 'nestMdXxs' && styles.cornerNestMdXxs,
            corner === 'nestLgXs' && styles.cornerNestLgXs,
          )}
          initial={{ opacity: 0, x: rect.x, y: rect.y, scaleX: 1, scaleY: 1 }}
          animate={{
            opacity: 1,
            x: rect.x,
            y: rect.y,
            scaleX: base.width > 0 ? rect.width / base.width : 1,
            scaleY: base.height > 0 ? rect.height / base.height : 1,
          }}
          exit={{ opacity: 0, transition: exitTween.fast }}
          transition={
            reduced
              ? {
                  ...exitTween.fast,
                  x: { duration: 0 },
                  y: { duration: 0 },
                  scaleX: { duration: 0 },
                  scaleY: { duration: 0 },
                }
              : spring.fast
          }
        />
      )}
    </AnimatePresence>
  )
}
