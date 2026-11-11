import * as stylex from '@stylexjs/stylex'
import { color, radius, space } from '@/tokens/token-consts.stylex'
import { boneStyles } from '@/ui/skeleton.stylex'

const skeletonBarHeights = [30, 55, 42, 70, 58]

const styles = stylex.create({
  plot: {
    alignItems: 'flex-end',
    display: 'flex',
    gap: space.md,
    height: '100%',
    paddingBlock: space.md,
    paddingInline: space.lg,
  },
  bar: (grow: number) => ({
    borderRadius: radius.xs,
    flexGrow: 1,
    height: `${grow}%`,
  }),
  ring: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
  },
  ringTrack: {
    fill: 'none',
    stroke: color.iconSunken,
  },
})

export function ChartSkeleton({ variant = 'plot' }: { variant?: 'plot' | 'ring' }) {
  if (variant === 'ring') {
    return (
      <div aria-hidden {...stylex.props(styles.ring)}>
        <svg height="70%" viewBox="0 0 100 100">
          <circle {...stylex.props(styles.ringTrack)} cx={50} cy={50} r={40} strokeWidth={12} />
        </svg>
      </div>
    )
  }
  return (
    <div aria-hidden {...stylex.props(styles.plot)}>
      {skeletonBarHeights.map((grow) => (
        <div {...stylex.props(boneStyles.pulse, styles.bar(grow))} key={grow} />
      ))}
    </div>
  )
}
