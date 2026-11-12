import { useState } from 'react'
import { useMountEffect } from '@/lib/use-mount-effect'
import { breakpoint } from '@/tokens/token-consts.stylex'

export type NavVariant = 'rail' | 'icons' | 'bar'

const desktopQuery = breakpoint.desktop.replace('@media ', '')
const tabletQuery = breakpoint.tablet.replace('@media ', '')

function readVariant(): NavVariant {
  if (typeof window === 'undefined') return 'rail'
  if (window.matchMedia(desktopQuery).matches) return 'rail'
  return window.matchMedia(tabletQuery).matches ? 'icons' : 'bar'
}

export function useAppNavLayout(): NavVariant {
  const [variant, setVariant] = useState<NavVariant>(readVariant)

  useMountEffect(() => {
    const queries = [window.matchMedia(desktopQuery), window.matchMedia(tabletQuery)]
    const onChange = () => setVariant(readVariant())
    for (const query of queries) query.addEventListener('change', onChange)
    return () => {
      for (const query of queries) query.removeEventListener('change', onChange)
    }
  })

  return variant
}
