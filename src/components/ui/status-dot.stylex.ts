import * as stylex from '@stylexjs/stylex'
import { color } from '@/tokens/token-consts.stylex'

export type StatusTone = 'neutral' | 'active' | 'positive' | 'warning' | 'danger'

export const statusToneStyles = stylex.create({
  neutral: { backgroundColor: color.iconSubtlest },
  active: { backgroundColor: color.backgroundBrand },
  positive: { backgroundColor: color.backgroundSuccess },
  warning: { backgroundColor: color.backgroundWarning },
  danger: { backgroundColor: color.backgroundDanger },
}) satisfies Record<StatusTone, unknown>
