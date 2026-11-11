import { FLUID_ITEM_ATTR } from '@/lib/hooks/use-fluid-hover'

export function fluidItemProps(onEnter: (el: HTMLElement) => void) {
  return {
    [FLUID_ITEM_ATTR]: '',
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => onEnter(event.currentTarget),
    onFocus: (event: React.FocusEvent<HTMLElement>) => onEnter(event.currentTarget),
  }
}
