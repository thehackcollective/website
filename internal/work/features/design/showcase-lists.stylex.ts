import * as stylex from '@stylexjs/stylex'
import { color, space, text } from '@/tokens/token-consts.stylex'

export const showcaseListStyles = stylex.create({
  facts: {
    display: 'grid',
    gap: space.xs,
    margin: 0,
  },
  fact: {
    alignItems: 'baseline',
    display: 'flex',
    gap: space.sm,
    justifyContent: 'space-between',
  },
  factLabel: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
  factValue: {
    color: color.textDefault,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
    margin: 0,
  },
})
