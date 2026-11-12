import * as stylex from '@stylexjs/stylex'
import { type ReactNode, useRef, useState } from 'react'
import { useMountEffect } from '@/lib/use-mount-effect'

export interface ChartSizeValue {
  width: number
  height: number
}

const styles = stylex.create({
  outer: {
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  measure: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
})

export function ChartSize({ children }: { children: (size: ChartSizeValue) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<ChartSizeValue>({ width: 0, height: 0 })
  useMountEffect(() => {
    const node = ref.current
    if (node === null) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry === undefined) return
      const { width, height } = entry.contentRect
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      )
    })
    observer.observe(node)
    return () => observer.disconnect()
  })
  return (
    <div {...stylex.props(styles.outer)}>
      <div ref={ref} {...stylex.props(styles.measure)}>
        {children(size)}
      </div>
    </div>
  )
}
