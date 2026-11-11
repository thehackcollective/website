import * as stylex from '@stylexjs/stylex'
import { stepperStyles as styles } from '@/ui/stepper.stylex'

export function Stepper({
  at,
  count,
  name,
  label = 'Progress',
}: {
  at: number
  count: number
  name?: string | undefined
  label?: string
}) {
  const current = Math.min(Math.max(at, 0), count - 1) + 1
  const place = `Step ${current} of ${count}`
  return (
    <div data-slot="stepper" {...stylex.props(styles.root)}>
      <span
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={count}
        aria-valuenow={current}
        aria-valuetext={name === undefined ? place : `${place}: ${name}`}
        {...stylex.props(styles.track)}
      >
        {Array.from({ length: count }, (_, index) => (
          <span
            key={`step-${index + 1}`}
            {...stylex.props(styles.segment, index < current && styles.segmentDone)}
          />
        ))}
      </span>
    </div>
  )
}
