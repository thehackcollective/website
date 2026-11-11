import { useSyncExternalStore } from 'react'
import { createListeners } from '@/lib/listeners'
import { readStored, writeStored } from '@/lib/stored'

const { subscribe, notify } = createListeners()

let collapsed: boolean | null = null

function snapshot(): boolean {
  collapsed ??= readStored('sidebarCollapsed') === '1'
  return collapsed
}

export function setSidebarCollapsed(next: boolean) {
  collapsed = next
  writeStored('sidebarCollapsed', next ? '1' : '0')
  notify()
}

export const useSidebarCollapsed = () => useSyncExternalStore(subscribe, snapshot, () => false)
