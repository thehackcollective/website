import * as stylex from '@stylexjs/stylex'

import { color, motion } from '@/tokens/token-consts.stylex'

const sparkAngles = [0, 45, 90, 135, 180, 225, 270, 315] as const

const draw = stylex.keyframes({
  from: { strokeDashoffset: 1 },
  to: { strokeDashoffset: 0 },
})

const burst = stylex.keyframes({
  '0%': { opacity: 0, transform: 'scale(0.7)' },
  '35%': { opacity: 1 },
  '100%': { opacity: 0, transform: 'scale(1.3)' },
})

const styles = stylex.create({
  svg: {
    display: 'block',
    overflow: 'visible',
  },
  ring: {
    fill: 'none',
    stroke: color.iconSuccess,
    strokeWidth: 2,
    strokeDasharray: 1,
    strokeDashoffset: 0,
    animationName: draw,
    animationDuration: motion.durationReveal,
    animationTimingFunction: motion.ease,
    animationFillMode: 'backwards',
  },
  check: {
    fill: 'none',
    stroke: color.iconSuccess,
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: 1,
    strokeDashoffset: 0,
    animationName: draw,
    animationDuration: motion.durationSlow,
    animationDelay: '260ms',
    animationTimingFunction: motion.ease,
    animationFillMode: 'backwards',
  },
  sparks: {
    opacity: 0,
    transformBox: 'view-box',
    transformOrigin: '50% 50%',
    animationName: burst,
    animationDuration: motion.durationReveal,
    animationDelay: '220ms',
    animationTimingFunction: motion.ease,
    animationFillMode: 'backwards',
  },
  spark: {
    stroke: color.iconBrand,
    strokeWidth: 1.5,
    strokeLinecap: 'round',
  },
})

export function SuccessBurst({ size = 48, label }: { size?: number; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      {...stylex.props(styles.svg)}
    >
      <g {...stylex.props(styles.sparks)}>
        {sparkAngles.map((angle) => (
          <line
            key={angle}
            x1="32"
            y1="5"
            x2="32"
            y2="9"
            transform={`rotate(${angle} 32 32)`}
            {...stylex.props(styles.spark)}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="20" pathLength={1} {...stylex.props(styles.ring)} />
      <path d="M23 33l6 6 12-13" pathLength={1} {...stylex.props(styles.check)} />
    </svg>
  )
}
