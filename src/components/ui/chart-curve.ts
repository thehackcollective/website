export interface CurvePoint {
  x: number
  y: number
}

function edgeTangent(from: CurvePoint, to: CurvePoint, neighbourTangent: number): number {
  const run = to.x - from.x
  return run === 0 ? neighbourTangent : ((3 * (to.y - from.y)) / run - neighbourTangent) / 2
}

function innerTangent(before: CurvePoint, at: CurvePoint, after: CurvePoint): number {
  const runIn = at.x - before.x
  const runOut = after.x - at.x
  const slopeIn = runIn === 0 ? 0 : (at.y - before.y) / runIn
  const slopeOut = runOut === 0 ? 0 : (after.y - at.y) / runOut
  const blended = (slopeIn * runOut + slopeOut * runIn) / (runIn + runOut || 1)
  const limit = Math.min(Math.abs(slopeIn), Math.abs(slopeOut), 0.5 * Math.abs(blended))
  return (Math.sign(slopeIn) + Math.sign(slopeOut)) * limit || 0
}

function tangents(points: readonly CurvePoint[]): number[] {
  const inner = points.slice(1, -1).map((at, i) => {
    const before = points[i]
    const after = points[i + 2]
    return before === undefined || after === undefined ? 0 : innerTangent(before, at, after)
  })
  const [first, second] = points
  const last = points.at(-1)
  const beforeLast = points.at(-2)
  if (first === undefined || second === undefined || last === undefined || beforeLast === undefined)
    return points.map(() => 0)
  const start = edgeTangent(first, second, inner[0] ?? 0)
  const end = edgeTangent(beforeLast, last, inner.at(-1) ?? start)
  return [start, ...inner, end]
}

export function monotoneLinePath(points: readonly CurvePoint[]): string {
  const [first] = points
  if (first === undefined) return ''
  if (points.length < 3) return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join('')
  const slopes = tangents(points)
  const segments = points.slice(1).map((to, i) => {
    const from = points[i] ?? to
    const third = (to.x - from.x) / 3
    const fromSlope = slopes[i] ?? 0
    const toSlope = slopes[i + 1] ?? 0
    return `C${from.x + third},${from.y + third * fromSlope},${to.x - third},${to.y - third * toSlope},${to.x},${to.y}`
  })
  return `M${first.x},${first.y}${segments.join('')}`
}

export function monotoneAreaPath(points: readonly CurvePoint[], baseline: number): string {
  const first = points[0]
  const last = points.at(-1)
  if (first === undefined || last === undefined) return ''
  return `${monotoneLinePath(points)}L${last.x},${baseline}L${first.x},${baseline}Z`
}
