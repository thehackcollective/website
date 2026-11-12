import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { useMountEffect } from '@/lib/use-mount-effect'
import { Button } from '@/ui/button'
import { coachmarkStyles as styles } from '@/ui/coachmark.stylex'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export interface CoachmarkStep {
  anchor: string
  title: string
  body: string
}

export type CoachmarkPages = Readonly<Record<string, readonly CoachmarkStep[]>>

export interface CoachmarkTarget {
  element: HTMLElement
  title: string
  body: string
}

const SPOTLIGHT_PADDING = 4

function roundedRect(left: number, top: number, right: number, bottom: number, r: number) {
  return [
    `M ${left + r} ${top}`,
    `H ${right - r}`,
    `Q ${right} ${top} ${right} ${top + r}`,
    `V ${bottom - r}`,
    `Q ${right} ${bottom} ${right - r} ${bottom}`,
    `H ${left + r}`,
    `Q ${left} ${bottom} ${left} ${bottom - r}`,
    `V ${top + r}`,
    `Q ${left} ${top} ${left + r} ${top}`,
    'Z',
  ].join(' ')
}

function cutoutOf(element: HTMLElement): string {
  const rect = element.getBoundingClientRect()
  const left = rect.left - SPOTLIGHT_PADDING
  const top = rect.top - SPOTLIGHT_PADDING
  const right = rect.right + SPOTLIGHT_PADDING
  const bottom = rect.bottom + SPOTLIGHT_PADDING
  const corner = Number.parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0
  const r = Math.max(
    0,
    Math.min(corner + SPOTLIGHT_PADDING, (right - left) / 2, (bottom - top) / 2),
  )
  const outer = `M 0 0 H ${window.innerWidth} V ${window.innerHeight} H 0 Z`
  return `path(evenodd, "${outer} ${roundedRect(left, top, right, bottom, r)}")`
}

function Measure({
  element,
  onCutout,
}: {
  element: HTMLElement
  onCutout: (cutout: string) => void
}) {
  useMountEffect(() => {
    let frame = 0
    const measure = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => onCutout(cutoutOf(element)))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  })
  return null
}

function Spotlight({ element, step }: { element: HTMLElement; step: number }) {
  const [cutout, setCutout] = useState<string | null>(null)
  return (
    <>
      <Measure key={step} element={element} onCutout={setCutout} />
      {cutout !== null && (
        <PopoverPrimitive.Backdrop
          data-slot="coachmark-backdrop"
          {...stylex.props(styles.backdrop, styles.cutout(cutout))}
        />
      )}
    </>
  )
}

export function Coachmark({
  targets,
  onClose,
  onDone,
}: {
  targets: readonly CoachmarkTarget[]
  onClose: () => void
  onDone: () => void
}) {
  const [open, setOpen] = useState(true)
  const [index, setIndex] = useState(0)
  const step = targets[index]
  if (step === undefined) return null
  const last = index === targets.length - 1
  return (
    <PopoverPrimitive.Root
      open={open}
      modal={false}
      onOpenChange={(next) => setOpen(next)}
      onOpenChangeComplete={(next) => {
        if (!next) onClose()
      }}
    >
      <PopoverPrimitive.Portal>
        <Spotlight step={index} element={step.element} />
        <PopoverPrimitive.Positioner
          anchor={step.element}
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={8}
          {...stylex.props(styles.positioner)}
        >
          <PopoverPrimitive.Popup
            data-slot="coachmark"
            {...stylex.props(primitiveStyles.floatingPopup, styles.popup)}
          >
            <div {...stylex.props(styles.copy)}>
              <PopoverPrimitive.Title {...stylex.props(styles.title)}>
                {step.title}
              </PopoverPrimitive.Title>
              <PopoverPrimitive.Description {...stylex.props(styles.description)}>
                {step.body}
              </PopoverPrimitive.Description>
            </div>
            <div {...stylex.props(styles.footer)}>
              <span {...stylex.props(styles.count)}>
                {targets.length > 1 ? `${index + 1} of ${targets.length}` : null}
              </span>
              <div {...stylex.props(styles.actions)}>
                {index > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setIndex(index - 1)}>
                    Back
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!last) return setIndex(index + 1)
                    onDone()
                    setOpen(false)
                  }}
                >
                  {last ? 'Done' : 'Next'}
                </Button>
              </div>
            </div>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
