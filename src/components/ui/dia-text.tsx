import * as stylex from '@stylexjs/stylex'
import { type animate, inView } from 'motion'
import { createElement, type ReactElement, useRef } from 'react'
import {
  armDiaSweep,
  classTokens,
  finishDia,
  observeDiaReflow,
  playDiaSweep,
  splitDiaHeadline,
} from '@/components/ui/dia-sweep'
import { diaStyles } from '@/components/ui/dia-sweep.stylex'
import { useMountEffect } from '@/lib/use-mount-effect'

export interface DiaHeadingProps {
  children: string
  as?: 'h1' | 'h2'
  id?: string
  className?: string
}

export function DiaHeading({ children, as = 'h2', id, className }: DiaHeadingProps): ReactElement {
  const ref = useRef<HTMLElement | null>(null)

  useMountEffect(() => {
    const el = ref.current
    if (!el) return
    let cancelled = false
    let stopInView: (() => void) | undefined
    let stopReflow: (() => void) | undefined
    let controls: ReturnType<typeof animate> | undefined
    let lines: HTMLElement[] = []
    let chars: HTMLElement[] = []
    let done = false

    void (async () => {
      try {
        await document.fonts?.ready
        if (cancelled || ref.current !== el) return

        const split = splitDiaHeadline(el)
        lines = split.lines
        chars = split.chars

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        stopReflow = observeDiaReflow(el, () => {
          if (cancelled || ref.current !== el) return
          controls?.stop()
          const resplit = splitDiaHeadline(el)
          lines = resplit.lines
          chars = resplit.chars
          if (done || controls) {
            finishDia(chars)
            done = true
          } else {
            armDiaSweep(el, lines)
          }
        })

        if (reduceMotion) {
          finishDia(chars)
          done = true
          return
        }

        armDiaSweep(el, lines)

        stopInView = inView(
          el,
          () => {
            armDiaSweep(el, lines)
            controls = playDiaSweep(el, chars, () => {
              done = true
            })
            stopInView?.()
          },
          { amount: 0.3 },
        )
      } catch {
        stopInView?.()
        controls?.stop()
      } finally {
        if (!cancelled && ref.current === el) {
          el.classList.remove(...classTokens(stylex.props(diaStyles.hidden)?.className))
        }
      }
    })()

    return () => {
      cancelled = true
      stopInView?.()
      stopReflow?.()
      controls?.stop()
    }
  })

  return createElement(
    as,
    {
      ref,
      id,
      'aria-label': children,
      className: [stylex.props(diaStyles.hidden)?.className ?? '', className ?? ''].join(' '),
    },
    children,
  )
}
