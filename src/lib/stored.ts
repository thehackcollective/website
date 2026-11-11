type StoredItem = { name: string; store: 'local' | 'session' }

const STORED_KEYS = {
  coachmarkSeen: { name: 'thc:coachmark-seen:', store: 'local' },
  fontWeight: { name: 'thc:font-weight', store: 'local' },
  sidebarCollapsed: { name: 'thc:sidebar-collapsed', store: 'local' },
  sound: { name: 'thc:sound', store: 'local' },
  tableColumns: { name: 'thc:table-columns:', store: 'local' },
} as const satisfies Record<string, StoredItem>

export type StoredKey = keyof typeof STORED_KEYS

function storageOf(item: StoredItem): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return item.store === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readStored(key: StoredKey, suffix = ''): string | null {
  const item = STORED_KEYS[key]
  try {
    return storageOf(item)?.getItem(item.name + suffix) ?? null
  } catch {
    return null
  }
}

export function writeStored(key: StoredKey, value: string, suffix = ''): boolean {
  const item = STORED_KEYS[key]
  try {
    const storage = storageOf(item)
    storage?.setItem(item.name + suffix, value)
    return storage !== null
  } catch {
    return false
  }
}

export function removeStored(key: StoredKey, suffix = '') {
  const item = STORED_KEYS[key]
  try {
    storageOf(item)?.removeItem(item.name + suffix)
  } catch {
    return
  }
}
