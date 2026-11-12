import * as stylex from '@stylexjs/stylex'
import { color, radius, space, text } from '@/tokens/token-consts.stylex'

export const inlineErrorStyles = stylex.create({
  error: {
    color: color.textDanger,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
    margin: 0,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: color.backgroundDangerSubtle,
    borderRadius: radius.md,
    display: 'flex',
    gap: space.xs,
    minWidth: 0,
    paddingBlock: space.xxs,
    paddingInlineEnd: space.xxs,
    paddingInlineStart: space.sm,
  },
  noticeIcon: {
    color: color.textDanger,
    display: 'inline-flex',
    flexShrink: 0,
  },
  noticeText: {
    color: color.textDefault,
    flex: '1',
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
    margin: 0,
    minWidth: 0,
  },
})
