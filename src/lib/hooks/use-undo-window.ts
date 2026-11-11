import { useCallback, useRef, useState } from 'react'
import { useMountEffect } from '@/lib/use-mount-effect'

export function useUndoWindow<T>({ windowMs = 5000 }: { windowMs?: number } = {}) {
  const [pending, setPending] = useState<T | null>(null)
  const [progress, setProgress] = useState(0)
  const commitRef = useRef<(() => void) | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = null
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setPending(null)
    setProgress(0)
  }, [])

  const flush = useCallback(() => {
    const commit = commitRef.current
    commitRef.current = null
    clear()
    commit?.()
  }, [clear])

  const begin = useCallback(
    (item: T, commit: () => void) => {
      if (commitRef.current) flush()
      commitRef.current = commit
      setPending(item)
      const start = performance.now()
      const tick = (now: number) => {
        setProgress(Math.min(1, (now - start) / windowMs))
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      timerRef.current = setTimeout(flush, windowMs)
    },
    [flush, windowMs],
  )

  const undo = useCallback(() => {
    commitRef.current = null
    clear()
  }, [clear])

  useMountEffect(() => {
    const onPageHide = () => {
      if (commitRef.current) flush()
    }
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      onPageHide()
    }
  })

  return { pending, begin, undo, flush, progress }
}
