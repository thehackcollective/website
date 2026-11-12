import { Children, isValidElement, type ReactNode } from 'react'
import { Icon } from '@/ui/icon'

export function iconEdges(children: ReactNode) {
  const items = Children.toArray(children)
  const isIcon = (item: unknown) => isValidElement(item) && item.type === Icon
  const only = items.length === 1 && isIcon(items[0])
  return {
    leading: !only && isIcon(items.at(0)),
    square: only,
    trailing: !only && items.length > 1 && isIcon(items.at(-1)),
  }
}
