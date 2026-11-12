import * as stylex from '@stylexjs/stylex'
import { breakpoint, color, space, text } from '@/tokens/token-consts.stylex'

export const paletteStyles = stylex.create({
  srOnly: {
    clipPath: 'inset(50%)',
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  },
  keys: {
    alignItems: 'center',
    borderTopColor: color.borderDefault,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    color: color.textSubtle,
    display: { default: 'none', [breakpoint.hover]: 'flex' },
    flexShrink: 0,
    fontSize: text.sizeCaption,
    gap: space.md,
    lineHeight: text.leadingCaption,
    paddingBlock: space.xs,
    paddingInline: space.md,
  },
  key: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    gap: space.xxs,
  },
})
