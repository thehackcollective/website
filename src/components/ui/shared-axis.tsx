import * as stylex from '@stylexjs/stylex'
import { type ReactNode, useState } from 'react'
import { sharedAxisStyles as styles } from '@/ui/shared-axis.stylex'

export type AxisDirection = 'forward' | 'back'

interface AxisState {
  key: string
  direction: AxisDirection
  leaving: string | null
  step: number
}

export function SharedAxis({
  viewKey,
  direction,
  render,
}: {
  viewKey: string
  direction: AxisDirection
  render: (key: string, live: boolean) => ReactNode
}) {
  const [state, setState] = useState<AxisState>({
    key: viewKey,
    direction,
    leaving: null,
    step: 0,
  })
  if (state.key !== viewKey) {
    setState({ key: viewKey, direction, leaving: state.key, step: state.step + 1 })
  }
  const forward = state.direction === 'forward'
  return (
    <div data-slot="shared-axis" {...stylex.props(styles.stage)}>
      <div
        key={`view-${state.step}`}
        {...stylex.props(
          styles.pane,
          state.step > 0 && (forward ? styles.enterForward : styles.enterBack),
        )}
      >
        {render(state.key, true)}
      </div>
      {state.leaving !== null && (
        <div
          key={`leave-${state.step}`}
          aria-hidden
          inert
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setState((s) => ({ ...s, leaving: null }))
          }}
          {...stylex.props(
            styles.pane,
            styles.leaving,
            forward ? styles.exitForward : styles.exitBack,
          )}
        >
          {render(state.leaving, false)}
        </div>
      )}
    </div>
  )
}
