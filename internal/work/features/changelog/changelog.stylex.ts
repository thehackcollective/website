import * as stylex from '@stylexjs/stylex'
import { color, space, text } from '@/tokens/token-consts.stylex'

export const changelogStyles = stylex.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xl,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  entry: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
  },
  meta: {
    alignItems: 'center',
    color: color.textSubtle,
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: text.sizeCaption,
    gap: space.xs,
    lineHeight: text.leadingCaption,
  },
  title: {
    color: color.textDefault,
    fontSize: text.sizeHeading,
    fontWeight: text.weightRegular,
    letterSpacing: text.trackingHeading,
    lineHeight: text.leadingHeading,
    margin: 0,
  },
  items: {
    color: color.textBody,
    display: 'flex',
    flexDirection: 'column',
    fontSize: text.sizeBody,
    gap: space.xxs,
    lineHeight: text.leadingBody,
    margin: 0,
    paddingInlineStart: space.lg,
  },
})
