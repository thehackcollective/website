import * as stylex from '@stylexjs/stylex'
import { color } from '@/tokens/token-consts.stylex'

export const seriesStroke = stylex.create({
  primary: { stroke: color.chartCategorical1 },
  compare: { stroke: color.iconSubtle },
  series2: { stroke: color.chartCategorical2 },
  series3: { stroke: color.chartCategorical3 },
  series4: { stroke: color.chartCategorical4 },
  series5: { stroke: color.chartCategorical5 },
  series6: { stroke: color.chartCategorical6 },
})

export const seriesFill = stylex.create({
  primary: { fill: color.chartCategorical1 },
  compare: { fill: color.iconSubtle },
  series2: { fill: color.chartCategorical2 },
  series3: { fill: color.chartCategorical3 },
  series4: { fill: color.chartCategorical4 },
  series5: { fill: color.chartCategorical5 },
  series6: { fill: color.chartCategorical6 },
})

export const seriesStop = stylex.create({
  primary: { stopColor: color.chartCategorical1 },
  compare: { stopColor: color.iconSubtle },
  series2: { stopColor: color.chartCategorical2 },
  series3: { stopColor: color.chartCategorical3 },
  series4: { stopColor: color.chartCategorical4 },
  series5: { stopColor: color.chartCategorical5 },
  series6: { stopColor: color.chartCategorical6 },
})

export const seriesSwatch = stylex.create({
  primary: { backgroundColor: color.chartCategorical1 },
  compare: { backgroundColor: color.chartCategorical4 },
  series2: { backgroundColor: color.chartCategorical2 },
  series3: { backgroundColor: color.chartCategorical3 },
  series4: { backgroundColor: color.chartCategorical4 },
  series5: { backgroundColor: color.chartCategorical5 },
  series6: { backgroundColor: color.chartCategorical6 },
})
