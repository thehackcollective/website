import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'

import { layout } from '@/tokens/token-consts.stylex'
import { icons } from '@/ui/icons'

const opticalNudge = new Map<IconSvgElement, number>([[icons.play, 8]])

const styles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  step: { height: layout.stepGlyph, width: layout.stepGlyph },
  sm: { height: layout.iconSizeSm, width: layout.iconSizeSm },
  md: { height: layout.iconSize, width: layout.iconSize },
  lg: { height: layout.iconSizeLg, width: layout.iconSizeLg },
  fill: { height: '100%', width: '100%' },
  svg: { display: 'block' },
  nudge: (percent: number) => ({ transform: `translateX(${percent}%)` }),
})

export function Icon({
  icon,
  size = 'step',
  label,
}: {
  icon: IconSvgElement
  size?: 'step' | 'sm' | 'md' | 'lg' | 'fill'
  label?: string
}) {
  const nudge = opticalNudge.get(icon)
  return (
    <span
      data-slot="icon"
      data-size={size}
      role={label === undefined ? undefined : 'img'}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      {...stylex.props(styles.root, styles[size])}
    >
      <HugeiconsIcon
        icon={icon}
        size="100%"
        {...stylex.props(styles.svg, nudge !== undefined && styles.nudge(nudge))}
      />
    </span>
  )
}
