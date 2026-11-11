import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'

import { card, color, layout, radius, shadow, space, text } from '@/tokens/token-consts.stylex'
import { Icon } from '@/ui/icon'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export type CardDensity = 'default' | 'sm'

const styles = stylex.create({
  base: {
    backgroundColor: card.background,
    borderRadius: card.radius,
    boxShadow: shadow['2'],
    color: card.text,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: text.fontSans,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
    overflow: 'hidden',
  },

  densityDefault: { gap: space.md, paddingBlock: space.md },
  densitySm: { gap: space.sm, paddingBlock: space.sm },

  contentDefault: { paddingInline: space.md },
  contentSm: { paddingInline: space.sm },

  section: { gap: space.md, minWidth: 0, overflow: 'visible', padding: space.md },
  head: {
    alignItems: 'center',
    display: 'flex',
    gap: space.sm,
    minHeight: layout.controlHeightMd,
    minWidth: 0,
  },
  iconTile: {
    alignItems: 'center',
    backgroundColor: color.backgroundSunken,
    borderRadius: radius.sm,
    color: color.iconDefault,
    display: 'inline-flex',
    flexShrink: 0,
    height: layout.controlHeightMd,
    justifyContent: 'center',
    width: layout.controlHeightMd,
  },
  title: {
    color: color.textDefault,
    flexGrow: 1,
    fontFamily: text.fontSans,
    fontSize: text.sizeHeading,
    fontWeight: text.weightSemibold,
    letterSpacing: text.trackingHeading,
    lineHeight: text.leadingHeading,
    margin: 0,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  action: { display: 'inline-flex', flexShrink: 0 },
  body: { display: 'flex', flexDirection: 'column', gap: space.sm, minWidth: 0 },
})

const densityStyles: Record<CardDensity, stylex.StyleXStyles> = {
  default: styles.densityDefault,
  sm: styles.densitySm,
}

const contentStyles: Record<CardDensity, stylex.StyleXStyles> = {
  default: styles.contentDefault,
  sm: styles.contentSm,
}

export type CardProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'> & {
  density?: CardDensity
}

export function Card({ density = 'default', ...props }: CardProps) {
  return (
    <div
      data-density={density}
      data-slot="card"
      {...props}
      {...stylex.props(styles.base, primitiveStyles.forcedEdge, densityStyles[density])}
    />
  )
}

export type CardContentProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'> & {
  density?: CardDensity
}

export function CardContent({ density = 'default', ...props }: CardContentProps) {
  return <div data-slot="card-content" {...props} {...stylex.props(contentStyles[density])} />
}

export function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string
  icon?: IconSvgElement
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      data-slot="section-card"
      {...stylex.props(styles.base, primitiveStyles.forcedEdge, styles.section)}
    >
      <div {...stylex.props(styles.head)}>
        {icon !== undefined && (
          <span {...stylex.props(styles.iconTile)}>
            <Icon icon={icon} />
          </span>
        )}
        <h2 {...stylex.props(styles.title)}>{title}</h2>
        {action !== undefined && <span {...stylex.props(styles.action)}>{action}</span>}
      </div>
      <div {...stylex.props(styles.body)}>{children}</div>
    </section>
  )
}
