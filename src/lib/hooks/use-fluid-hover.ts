import { type MouseEvent, type PointerEvent, useCallback, useRef, useState } from 'react'

export const FLUID_ITEM_ATTR = 'data-fluid-item'

export type FluidRect = { x: number; y: number; width: number; height: number }

function measure(el: HTMLElement, container: HTMLElement): FluidRect {
  const { left, top, width, height } = el.getBoundingClientRect()
  const box = container.getBoundingClientRect()
  return { x: left - box.left, y: top - box.top + container.scrollTop, width, height }
}

function nearestItem(container: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
  const hit = document.elementFromPoint(clientX, clientY)
  const hitItem = hit instanceof Element ? hit.closest<HTMLElement>(`[${FLUID_ITEM_ATTR}]`) : null
  if (hitItem && container.contains(hitItem)) return hitItem

  let best: HTMLElement | null = null
  let bestDist = Number.POSITIVE_INFINITY
  for (const item of container.querySelectorAll<HTMLElement>(`[${FLUID_ITEM_ATTR}]`)) {
    const r = item.getBoundingClientRect()
    const dx = clientX - (r.left + r.width / 2)
    const dy = clientY - (r.top + r.height / 2)
    const d = dx * dx + dy * dy
    if (d < bestDist) {
      bestDist = d
      best = item
    }
  }
  return best
}

export function useFluidHover<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null)
  const active = useRef<HTMLElement | null>(null)
  const [rect, setRect] = useState<FluidRect | null>(null)
  const [base, setBase] = useState<{ width: number; height: number } | null>(null)

  const onItemEnter = useCallback((el: HTMLElement) => {
    const container = containerRef.current
    if (!container) return
    active.current = el
    const next = measure(el, container)
    setBase((prev) => prev ?? { width: next.width, height: next.height })
    setRect(next)
  }, [])

  const onLeave = useCallback(() => {
    active.current = null
    setRect(null)
  }, [])

  const attachContainer = useCallback(
    (node: T | null) => {
      containerRef.current = node
      if (node === null) return
      const observer = new ResizeObserver(onLeave)
      observer.observe(node)
      return () => {
        observer.disconnect()
        containerRef.current = null
      }
    },
    [onLeave],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent<T>) => {
      const item = nearestItem(event.currentTarget, event.clientX, event.clientY)
      if (item && item !== active.current) onItemEnter(item)
    },
    [onItemEnter],
  )

  const onClick = useCallback((event: MouseEvent<T>) => {
    const gap =
      event.target === event.currentTarget ||
      (event.target instanceof HTMLElement && event.target.tagName === 'SECTION')
    if (!gap) return
    const current = active.current
    if (current instanceof HTMLAnchorElement && event.currentTarget.contains(current)) {
      current.click()
    }
  }, [])

  return {
    containerRef: attachContainer,
    containerProps: { onPointerMove, onClick, onPointerLeave: onLeave },
    highlightProps: { rect, base },
    onItemEnter,
    onLeave,
  }
}
