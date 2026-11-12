import { useCallback, useRef, useState } from 'react'
import { useMountEffect } from '@/lib/use-mount-effect'

function useScheduledIndex() {
  const [index, setIndexState] = useState<number | null>(null)
  const lastRef = useRef<number | null>(null)
  const pendingRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useMountEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
  })

  const schedule = useCallback((next: number) => {
    pendingRef.current = next
    if (next === lastRef.current || rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const pending = pendingRef.current
      if (pending === null || pending === lastRef.current) return
      lastRef.current = pending
      setIndexState(pending)
    })
  }, [])

  const clear = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    pendingRef.current = null
    lastRef.current = null
    setIndexState(null)
  }, [])

  return { index, schedule, clear }
}

export function useChartPointer({
  count,
  indexFromX,
  announce,
}: {
  count: number
  indexFromX: (x: number, width: number) => number
  announce: (index: number) => string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<number | null>(null)
  const { index, schedule, clear } = useScheduledIndex()

  const setIndex = useCallback(
    (next: number | null) => {
      if (next === null) {
        activeRef.current = null
        clear()
        return
      }
      const clamped = Math.max(0, Math.min(count - 1, next))
      activeRef.current = clamped
      schedule(clamped)
    },
    [clear, count, schedule],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const el = containerRef.current
      if (!el || count === 0) return
      const rect = el.getBoundingClientRect()
      setIndex(indexFromX(event.clientX - rect.left, rect.width))
    },
    [count, indexFromX, setIndex],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (count === 0) return
      const current = activeRef.current ?? (event.key === 'ArrowLeft' ? count : -1)
      const moves: Record<string, number> = {
        ArrowRight: current + 1,
        ArrowLeft: current - 1,
        Home: 0,
        End: count - 1,
      }
      const next = moves[event.key]
      if (next === undefined) return
      event.preventDefault()
      setIndex(next)
    },
    [count, setIndex],
  )

  const onClear = useCallback(() => setIndex(null), [setIndex])

  return {
    activeIndex: index,
    announcement: index === null ? '' : announce(index),
    rootProps: {
      ref: containerRef,
      tabIndex: 0,
      onPointerMove,
      onPointerLeave: onClear,
      onKeyDown,
      onBlur: onClear,
    },
  }
}
