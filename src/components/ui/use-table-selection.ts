import {
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react'
import { useMountEffect } from '@/lib/use-mount-effect'

type IdSet = ReadonlySet<string>

interface Anchor {
  id: string
  base: IdSet
}

interface Drag {
  start: string
  pointerId: number
  add: boolean
  base: IdSet
  moved: boolean
  open: (id: string, trigger: HTMLElement) => void
}

function between(ids: readonly string[], a: string, b: string) {
  const i = ids.indexOf(a)
  const j = ids.indexOf(b)
  if (i < 0 || j < 0) return []
  return ids.slice(Math.min(i, j), Math.max(i, j) + 1)
}

function plus(base: IdSet, list: readonly string[]) {
  const next = new Set(base)
  for (const id of list) next.add(id)
  return next
}

function minus(base: IdSet, list: readonly string[]) {
  const next = new Set(base)
  for (const id of list) next.delete(id)
  return next
}

function interactive(event: { target: EventTarget | null }) {
  return (
    event.target instanceof Element &&
    event.target.closest('button,a,input,select,textarea,[role=button]') !== null
  )
}

export function useTableSelection({
  ids,
  onOpen,
  onLeave,
  onSound,
  onSelectionChange,
  onFocusMissing,
}: {
  ids: readonly string[]
  onOpen: (id: string, trigger: HTMLElement) => void
  onLeave: () => void
  onSound: (name: 'tick' | 'release') => void
  onSelectionChange?: (ids: IdSet) => void
  onFocusMissing?: (id: string) => void
}) {
  const [selected, setSelected] = useState<IdSet>(() => new Set())
  const [focus, setFocus] = useState<string | null>(null)
  const [keyboard, setKeyboard] = useState(false)
  const anchor = useRef<Anchor | null>(null)
  const chain = useRef(false)
  const drag = useRef<Drag | null>(null)
  const rows = useRef(new Map<string, HTMLElement>())
  const pendingFocus = useRef<string | null>(null)

  const updateSelected = (next: IdSet) => {
    setSelected(next)
    onSelectionChange?.(next)
  }

  useMountEffect(() => {
    const onPointerUp = (event: PointerEvent) => {
      const d = drag.current
      if (d === null || d.pointerId !== event.pointerId) return
      drag.current = null
      const trigger = rows.current.get(d.start)
      if (!d.moved && trigger !== undefined) d.open(d.start, trigger)
      anchor.current = { id: d.start, base: d.base }
    }
    const onPointerCancel = (event: PointerEvent) => {
      if (drag.current?.pointerId === event.pointerId) drag.current = null
    }
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    return () => {
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
    }
  })

  const focusRow = (id: string) => {
    setFocus(id)
    const row = rows.current.get(id)
    if (row === undefined) {
      pendingFocus.current = id
      onFocusMissing?.(id)
    } else {
      pendingFocus.current = null
      row.focus({ preventScroll: false })
    }
  }

  const register = (id: string) => (el: HTMLElement | null) => {
    if (el === null) rows.current.delete(id)
    else {
      rows.current.set(id, el)
      if (pendingFocus.current === id) {
        pendingFocus.current = null
        el.focus({ preventScroll: false })
      }
    }
  }

  const onPointerDown = (id: string, event: ReactPointerEvent) => {
    if (event.button !== 0 || interactive(event)) return
    event.preventDefault()
    setKeyboard(false)
    chain.current = false
    if (event.metaKey || event.ctrlKey) {
      const next = new Set(selected)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      updateSelected(next)
      anchor.current = { id, base: next }
      focusRow(id)
      onSound('tick')
      return
    }
    if (event.shiftKey) {
      const current = anchor.current
      const a =
        current !== null && ids.includes(current.id)
          ? current
          : { id: focus !== null && ids.includes(focus) ? focus : id, base: selected }
      anchor.current = a
      updateSelected(plus(a.base, between(ids, a.id, id)))
      focusRow(id)
      onSound('tick')
      return
    }
    drag.current = {
      start: id,
      pointerId: event.pointerId,
      add: !selected.has(id),
      base: selected,
      moved: false,
      open: onOpen,
    }
    focusRow(id)
  }

  const onPointerEnter = (id: string) => {
    const d = drag.current
    if (d === null) return
    if (id !== d.start) d.moved = true
    if (!d.moved) return
    const span = between(ids, d.start, id)
    onSound('tick')
    updateSelected(d.add ? plus(d.base, span) : minus(d.base, span))
    setFocus(id)
  }

  const onRowClick = (id: string, event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.detail !== 0 || interactive(event)) return
    const trigger = rows.current.get(id)
    if (trigger !== undefined) onOpen(id, trigger)
  }

  const enterFromSearch = () => {
    if (ids.length === 0) return false
    setKeyboard(true)
    focusRow(focus !== null && ids.includes(focus) ? focus : (ids[0] ?? ''))
    return true
  }

  const clear = () => {
    updateSelected(new Set())
    anchor.current = null
    chain.current = false
  }

  const onRowKeyDown = (id: string, event: KeyboardEvent) => {
    if (interactive(event)) return
    setKeyboard(true)
    const at = ids.indexOf(id)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = ids[at + (event.key === 'ArrowDown' ? 1 : -1)]
      if (next === undefined) return
      if (event.shiftKey) {
        if (!chain.current || anchor.current === null || !ids.includes(anchor.current.id)) {
          anchor.current = { id, base: selected }
        }
        chain.current = true
        updateSelected(plus(anchor.current.base, between(ids, anchor.current.id, next)))
      } else {
        chain.current = false
        anchor.current = { id: next, base: selected }
      }
      focusRow(next)
      return
    }
    if (event.key === ' ') {
      event.preventDefault()
      const next = new Set(selected)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      updateSelected(next)
      anchor.current = { id, base: next }
      chain.current = false
      onSound('tick')
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const trigger = rows.current.get(id)
      if (trigger !== undefined) onOpen(id, trigger)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      if (selected.size > 0) onSound('release')
      clear()
      setFocus(null)
      onLeave()
      return
    }
    if (event.key === 'a' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      updateSelected(plus(selected, ids))
    }
  }

  return {
    selected,
    focus,
    keyboard,
    register,
    onPointerDown,
    onPointerEnter,
    onRowClick,
    onRowKeyDown,
    enterFromSearch,
    clear,
  }
}
