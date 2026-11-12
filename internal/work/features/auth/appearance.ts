import type { ClerkProviderProps } from '@clerk/react'
import { button, color, input, radius, text } from '@/tokens/token-consts.stylex'

const pill = { borderRadius: radius.pill }
const fieldText = { fontSize: `max(${text.sizeField}, ${text.sizeStep})` }
const inputEdge = {
  outlineColor: color.borderInput,
  outlineStyle: 'solid',
  outlineWidth: '1px',
}

export const authAppearance: NonNullable<ClerkProviderProps['appearance']> = {
  elements: {
    logoBox: { display: 'none' },
    rootBox: { maxWidth: '100%' },
    cardBox: { maxWidth: '100%', boxShadow: 'none' },
    formButtonPrimary: pill,
    formFieldInput: { ...fieldText, '&[data-variant="default"]': inputEdge },
    otpCodeFieldInput: { ...fieldText, '&[data-variant="default"]': inputEdge },
    formInputGroup: inputEdge,
    socialButtonsBlockButton: pill,
    alternativeMethodsBlockButton: pill,
    footerAction: { display: 'none' },
    impersonationFab: { display: 'none' },
  },
  variables: {
    colorPrimary: button.primaryBackground,
    colorPrimaryForeground: button.primaryText,
    colorForeground: color.textDefault,
    colorMutedForeground: color.textSubtle,
    colorBackground: color.backgroundCanvas,
    colorInput: color.backgroundSurface,
    colorInputForeground: input.defaultText,
    colorBorder: color.borderInput,
    colorDanger: color.textDanger,
    borderRadius: radius.md,
    fontFamily: text.fontSans,
    fontWeight: {
      normal: text.weightRegular,
      medium: text.weightRegular,
      semibold: text.weightRegular,
      bold: text.weightRegular,
    },
  },
}
