import * as stylex from '@stylexjs/stylex'
import type { ComponentProps } from 'react'

import { space } from '@/tokens/token-consts.stylex'
import { ButtonLink, type ButtonLinkProps } from '@/ui/button'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

const styles = stylex.create({
  text: {
    color: 'inherit',
    textDecorationLine: 'underline',
    textUnderlineOffset: '0.2em',
  },
  glyph: {
    display: 'inline-flex',
    paddingInlineStart: space.stepGap,
    verticalAlign: 'middle',
  },
})

type AnchorProps = Omit<ComponentProps<'a'>, 'className' | 'style' | 'target' | 'rel' | 'media'>

export type ExternalLinkProps = AnchorProps &
  Pick<ButtonLinkProps, 'variant' | 'size' | 'shape'> & { media?: boolean }

export function ExternalLink({
  variant,
  size,
  shape,
  media,
  children,
  ...props
}: ExternalLinkProps) {
  const hint = <span {...stylex.props(primitiveStyles.srOnly)}>(opens in a new tab)</span>
  if (media)
    return (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(stylex.defaultMarker())}
      >
        {children}
        {hint}
      </a>
    )
  if (variant !== undefined)
    return (
      <ButtonLink
        {...props}
        variant={variant}
        size={size}
        shape={shape}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        {hint}
        <Icon icon={icons.openExternal} />
      </ButtonLink>
    )
  return (
    <a {...props} target="_blank" rel="noopener noreferrer" {...stylex.props(styles.text)}>
      {children}
      {hint}
      <span {...stylex.props(styles.glyph)}>
        <Icon icon={icons.openExternal} size="sm" />
      </span>
    </a>
  )
}
