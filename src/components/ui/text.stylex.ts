import * as stylex from '@stylexjs/stylex'
import { breakpoint, color, text } from '@/tokens/token-consts.stylex'

export const textStyles = stylex.create({
  display: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: { default: text.sizeTitle, [breakpoint.desktop]: text.sizeDisplay },
    fontWeight: text.weightSemibold,
    letterSpacing: {
      default: text.trackingTitle,
      [breakpoint.desktop]: text.trackingDisplay,
    },
    lineHeight: { default: text.leadingTitle, [breakpoint.desktop]: text.leadingDisplay },
    margin: 0,
    textWrap: 'balance',
  },
  title: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeTitle,
    fontWeight: text.weightSemibold,
    letterSpacing: text.trackingTitle,
    lineHeight: text.leadingTitle,
    margin: 0,
    textWrap: 'balance',
  },
  heading: {
    color: color.textDefault,
    fontFamily: text.fontSans,
    fontSize: text.sizeHeading,
    fontWeight: text.weightSemibold,
    letterSpacing: text.trackingHeading,
    lineHeight: text.leadingHeading,
    margin: 0,
    textWrap: 'balance',
  },
  body: {
    color: color.textBody,
    fontSize: text.sizeBody,
    fontWeight: text.weightRegular,
    hyphens: 'auto',
    lineHeight: text.leadingBody,
    margin: 0,
    textWrap: 'pretty',
  },
  ui: {
    color: color.textDefault,
    fontSize: text.sizeUi,
    fontWeight: text.weightRegular,
    lineHeight: text.leadingUi,
    margin: 0,
    textWrap: 'pretty',
  },
  caption: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    fontWeight: text.weightRegular,
    hyphens: 'auto',
    lineHeight: text.leadingCaption,
    margin: 0,
    textWrap: 'pretty',
  },
})
