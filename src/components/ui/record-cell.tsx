import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'
import { color, space, text } from '@/tokens/token-consts.stylex'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    gap: space.sm,
    minWidth: 0,
    width: '100%',
  },
  leading: { display: 'inline-flex', flexShrink: 0 },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  detail: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  trailing: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    gap: space.xs,
  },
})

export function RecordCell({
  leading,
  title,
  detail,
  trailing,
}: {
  leading: ReactNode
  title: ReactNode
  detail?: ReactNode
  trailing?: ReactNode
}) {
  return (
    <span data-slot="record-cell" {...stylex.props(styles.root)}>
      <span aria-hidden="true" {...stylex.props(styles.leading)}>
        {leading}
      </span>
      <span {...stylex.props(styles.body)}>
        <span {...stylex.props(styles.title)}>{title}</span>
        {detail !== undefined && <span {...stylex.props(styles.detail)}>{detail}</span>}
      </span>
      {trailing !== undefined && <span {...stylex.props(styles.trailing)}>{trailing}</span>}
    </span>
  )
}
