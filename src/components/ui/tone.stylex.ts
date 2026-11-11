import * as stylex from '@stylexjs/stylex'
import { color } from '@/tokens/token-consts.stylex'

export const toneColor = stylex.create({
  success: { color: color.textSuccess },
  warning: { color: color.textWarning },
  danger: { color: color.textDanger },
  brand: { color: color.iconBrand },
  ink: { color: color.textDefault },
  neutral: { color: color.iconSubtle },
  chart1: { color: color.chartCategorical1 },
  chart2: { color: color.chartCategorical2 },
  chart3: { color: color.chartCategorical3 },
  chart4: { color: color.chartCategorical4 },
  chart5: { color: color.chartCategorical5 },
  chart6: { color: color.chartCategorical6 },
})

export type Tone = keyof typeof toneColor
