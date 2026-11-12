import { createListeners } from '@/lib/listeners'

type PaletteState = { open: boolean; session: number }

let paletteState: PaletteState = { open: false, session: 0 }
const { subscribe, notify } = createListeners()

function setPaletteState(next: PaletteState) {
  paletteState = next
  notify()
}

export const subscribePalette = subscribe

export const paletteSnapshot = () => paletteState

export function openPalette() {
  if (!paletteState.open) setPaletteState({ open: true, session: paletteState.session + 1 })
}

export function setPaletteOpen(open: boolean) {
  setPaletteState({ ...paletteState, open })
}
