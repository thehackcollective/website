import * as stylex from '@stylexjs/stylex'

import { color, motion } from '@/tokens/token-consts.stylex'

const sweep = stylex.keyframes({
  '0%': { backgroundPosition: '100% 0' },
  '100%': { backgroundPosition: '0% 0' },
})

const styles = stylex.create({
  root: {
    animationDuration: `calc(${motion.durationLoop} * 2)`,
    animationIterationCount: 'infinite',
    animationName: {
      '@media (prefers-reduced-motion: reduce)': 'none',
      default: sweep,
    },
    animationTimingFunction: 'linear',
    backgroundClip: {
      '@media (prefers-reduced-motion: reduce)': 'border-box',
      default: 'text',
    },
    backgroundImage: {
      '@media (prefers-reduced-motion: reduce)': 'none',
      default: `linear-gradient(90deg, ${color.textSubtlest} 0%, ${color.textSubtlest} 40%, ${color.textDefault} 50%, ${color.textSubtlest} 60%, ${color.textSubtlest} 100%)`,
    },
    backgroundSize: '250% 100%',
    color: {
      '@media (prefers-reduced-motion: reduce)': color.textSubtle,
      default: 'transparent',
    },
    display: 'inline-block',
    WebkitBackgroundClip: {
      '@media (prefers-reduced-motion: reduce)': 'border-box',
      default: 'text',
    },
  },
})

export function TextShimmerWave({ children }: { children: string }) {
  return <span {...stylex.props(styles.root)}>{children}</span>
}
