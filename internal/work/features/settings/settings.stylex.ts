import * as stylex from '@stylexjs/stylex'
import { text } from '@/tokens/token-consts.stylex'

export const settingsStyles = stylex.create({
  glyph: {
    fontFamily: text.fontSans,
    fontSize: text.sizeTitle,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingNone,
  },
})
