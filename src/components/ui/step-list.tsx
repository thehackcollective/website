import * as stylex from '@stylexjs/stylex'
import { color, layout, space, text } from '@/tokens/token-consts.stylex'
import { Button } from '@/ui/button'
import { StatusDot } from '@/ui/status-dot'
import type { StatusTone } from '@/ui/status-dot.stylex'

export type StepState = 'done' | 'active' | 'todo'

export interface Step {
  id: string
  title: string
  detail?: string
  state: StepState
  action?: { label: string; onClick: () => void }
}

const styles = stylex.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  row: {
    alignItems: 'center',
    borderTopColor: color.borderDefault,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    columnGap: space.md,
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: layout.rowHeight,
    paddingBlock: space.sm,
    rowGap: space.xs,
  },
  first: { borderTopWidth: 0 },
  body: {
    display: 'flex',
    flexBasis: '12rem',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
  },
  titleDone: { color: color.textSubtle },
  detail: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
  end: { alignItems: 'center', display: 'flex', flexShrink: 0, gap: space.sm },
})

const dotForState: Record<StepState, { tone: StatusTone; label: string }> = {
  active: { label: 'Next', tone: 'active' },
  done: { label: 'Done', tone: 'positive' },
  todo: { label: 'To do', tone: 'neutral' },
}

export function StepList({ steps }: { steps: readonly Step[] }) {
  return (
    <ol data-slot="step-list" {...stylex.props(styles.list)}>
      {steps.map((step, index) => (
        <li
          key={step.id}
          aria-current={step.state === 'active' ? 'step' : undefined}
          {...stylex.props(styles.row, index === 0 && styles.first)}
        >
          <span {...stylex.props(styles.body)}>
            <span {...stylex.props(styles.title, step.state === 'done' && styles.titleDone)}>
              {step.title}
            </span>
            {step.detail !== undefined && (
              <span {...stylex.props(styles.detail)}>{step.detail}</span>
            )}
          </span>
          <span {...stylex.props(styles.end)}>
            <StatusDot {...dotForState[step.state]} />
            {step.state !== 'done' && step.action !== undefined && (
              <Button
                variant={step.state === 'active' ? 'primary' : 'secondary'}
                size="sm"
                onClick={step.action.onClick}
              >
                {step.action.label}
              </Button>
            )}
          </span>
        </li>
      ))}
    </ol>
  )
}
