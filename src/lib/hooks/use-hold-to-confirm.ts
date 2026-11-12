import { useCallback, useRef, useState } from 'react'

export function useHoldToConfirm({
  holdMs = 900,
  onConfirm,
}: {
  holdMs?: number
  onConfirm: () => void
}) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const cancel = useCallback(() => {
    stop()
    setHolding(false)
    setProgress(0)
  }, [stop])

  const begin = useCallback(() => {
    if (rafRef.current !== null) return
    setHolding(true)
    startRef.current = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / holdMs)
      setProgress(p)
      if (p >= 1) {
        rafRef.current = null
        setHolding(false)
        setProgress(0)
        onConfirm()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [holdMs, onConfirm])

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (node === null) return
      return stop
    },
    [stop],
  )

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      begin()
    },
    [begin],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.repeat) return
      if (event.key !== ' ' && event.key !== 'Enter') return
      event.preventDefault()
      begin()
    },
    [begin],
  )

  const onKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      event.preventDefault()
      cancel()
    },
    [cancel],
  )

  return {
    progress,
    holding,
    holdProps: {
      ref,
      onPointerDown,
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onLostPointerCapture: cancel,
      onKeyDown,
      onKeyUp,
      onBlur: cancel,
    },
  }
}
