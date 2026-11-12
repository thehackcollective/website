import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { card, color, shadow, text } from '@/tokens/token-consts.stylex'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { sonnerStyles } from '@/ui/sonner.stylex'

const toastIcon = (icon: IconSvgElement, spin = false) => (
  <span {...stylex.props(sonnerStyles.icon, spin && sonnerStyles.spin)}>
    <Icon icon={icon} size="fill" />
  </span>
)

export const Toaster = (props: ToasterProps) => (
  <Sonner
    position="top-center"
    theme="light"
    icons={{
      success: toastIcon(icons.done),
      info: toastIcon(icons.info),
      warning: toastIcon(icons.warning),
      error: toastIcon(icons.warning),
      loading: toastIcon(icons.loading, true),
    }}
    toastOptions={{
      ...stylex.props(sonnerStyles.toast),
      classNames: { toast: 'cn-toast' },
      style: {
        backgroundColor: color.backgroundSurface,
        borderColor: color.borderDefault,
        borderRadius: card.radius,
        boxShadow: shadow['4'],
        color: color.textDefault,
        fontSize: text.sizeBody,
        lineHeight: text.leadingBody,
      },
    }}
    {...props}
  />
)
