import * as stylex from '@stylexjs/stylex'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useTextSwap } from '@/lib/hooks/use-text-swap'
import { textSwapPhase } from '@/lib/motion'

const styles = stylex.create({
  wrap: { display: 'inline-block' },
})

export function TextSwap({ text }: { text: string }) {
  const { current, direction, key } = useTextSwap(text)
  const still = useReducedMotion() === true
  const travel = direction === 'up' ? 8 : -8
  const offset = still ? 0 : travel

  return (
    <span {...stylex.props(styles.wrap)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={key}
          {...stylex.props(styles.wrap)}
          initial={{ y: offset, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -offset, opacity: 0 }}
          transition={textSwapPhase}
        >
          {current}
        </m.span>
      </AnimatePresence>
    </span>
  )
}
