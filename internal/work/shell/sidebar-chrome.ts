import { setSidebarCollapsed } from '@internal/work/shell/sidebar-state'
import {
  type AnimationEvent,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type TransitionEvent,
  useState,
} from 'react'
import { useFluidHover } from '@/lib/hooks/use-fluid-hover'
import { playSound } from '@/lib/interaction-sounds'

function clickSound(event: MouseEvent<HTMLElement>) {
  if (!(event.target instanceof Element)) return
  if (event.target.closest('[data-sidebar-sound-toggle]')) return
  if (event.target.closest('button, a')) playSound('click')
}

export function useSidebarChrome(collapsed: boolean) {
  const glide = useFluidHover<HTMLElement>()
  const [animate, setAnimate] = useState(false)
  const [stagger, setStagger] = useState(true)
  const { onLeave } = glide
  return {
    stagger,
    toggle: () => {
      onLeave()
      setAnimate(true)
      setSidebarCollapsed(!collapsed)
    },
    animate,
    aside: {
      'data-animate': animate || undefined,
      onClickCapture: clickSound,
      onTransitionEnd: (event: TransitionEvent<HTMLElement>) => {
        if (event.target === event.currentTarget && event.propertyName === 'width')
          setAnimate(false)
      },
    },
    nav: {
      ref: glide.containerRef,
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'mouse') glide.containerProps.onPointerMove(event)
      },
      onPointerLeave: onLeave,
      onScroll: onLeave,
      onFocusCapture: (event: FocusEvent<HTMLElement>) => {
        const row = event.target.closest<HTMLElement>('[data-fluid-item]')
        if (row) glide.onItemEnter(row)
      },
      onBlurCapture: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onLeave()
      },
      onAnimationEnd: (event: AnimationEvent<HTMLElement>) => {
        const running = event.currentTarget.getAnimations({ subtree: true })
        if (!running.some((animation) => animation instanceof CSSAnimation)) setStagger(false)
      },
    },
    highlight: glide.highlightProps,
  }
}
