import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useState } from 'react'

export const VIRTUAL_ROWS_FROM = 50

function scrolls(node: HTMLElement): boolean {
  const { overflowY } = getComputedStyle(node)
  return overflowY === 'auto' || overflowY === 'scroll'
}

function scrollParent(node: HTMLElement | null): HTMLElement | null {
  let parent = node?.parentElement ?? null
  while (parent !== null && !scrolls(parent)) parent = parent.parentElement
  return parent
}

function offsetIn(node: HTMLElement | null, parent: HTMLElement | null): number {
  if (node === null) return 0
  if (parent === null) return node.getBoundingClientRect().top + window.scrollY
  return node.getBoundingClientRect().top - parent.getBoundingClientRect().top + parent.scrollTop
}

export function useVirtualRows(
  count: number,
  estimate: number,
  options?: { enabled?: boolean; keyOf?: (index: number) => string; headerSize?: number },
) {
  const [list, setList] = useState<HTMLElement | null>(null)
  const [margin, setMargin] = useState(0)
  const parent = scrollParent(list)
  const listRef = useCallback((node: HTMLElement | null) => {
    setList(node)
    if (node === null) return undefined
    const scroller = scrollParent(node)
    const measure = () => setMargin(offsetIn(node, scroller))
    measure()
    const content = scroller?.firstElementChild ?? scroller ?? document.body
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const shared = {
    count,
    estimateSize: () => estimate,
    scrollMargin: margin,
    overscan: 10,
    getItemKey: options?.keyOf ?? ((index) => index),
    scrollPaddingStart: options?.headerSize ?? 0,
  }
  const enabled = (options?.enabled ?? true) && list !== null
  const elementVirtualizer = useVirtualizer({
    ...shared,
    getScrollElement: () => parent,
    enabled: enabled && parent !== null,
  })
  const windowVirtualizer = useWindowVirtualizer({
    ...shared,
    enabled: enabled && parent === null,
  })
  const virtualizer = parent === null ? windowVirtualizer : elementVirtualizer
  return { listRef, virtualizer, offset: margin }
}
