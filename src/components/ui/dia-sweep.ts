import * as stylex from '@stylexjs/stylex'
import { animate } from 'motion'
import { splitText } from 'motion-plus'
import { diaStyles } from '@/components/ui/dia-sweep.stylex'

const LINE_CLASS = 'stagger-line'
const WORD_CLASS = 'stagger-word'
const CHAR_CLASS = 'stagger-char'

const DIA_SWEEP_DURATION = 2.2
export const DIA_FOLLOWER_DELAY = 1.5

const diaSweepEase = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

export const classTokens = (className: string | undefined): string[] =>
  (className ?? '').split(/\s+/).filter(Boolean)

export function splitDiaHeadline(el: HTMLElement): {
  lines: HTMLElement[]
  chars: HTMLElement[]
} {
  const original = el.getAttribute('aria-label') ?? el.textContent ?? ''
  el.textContent = original

  const { lines } = splitText(el, {
    lineClass: LINE_CLASS,
    wordClass: WORD_CLASS,
    charClass: CHAR_CLASS,
  })

  lines.forEach((line) => {
    line.style.display = 'block'
    line.querySelectorAll<HTMLElement>(`.${WORD_CLASS}`).forEach((word) => {
      word.style.display = 'inline-block'
    })
  })

  const chars = Array.from(el.querySelectorAll<HTMLElement>(`.${CHAR_CLASS}`))

  return { lines, chars }
}

export function armDiaSweep(el: HTMLElement, lines: HTMLElement[]): void {
  const charOffsets: Array<{ char: HTMLElement; x: number }> = []
  let stripWidth = 0
  lines.forEach((line) => {
    const lineRect = line.getBoundingClientRect()
    const lineOffset = stripWidth
    line.querySelectorAll<HTMLElement>(`.${CHAR_CLASS}`).forEach((char) => {
      charOffsets.push({
        char,
        x: -(lineOffset + (char.getBoundingClientRect().left - lineRect.left)),
      })
    })
    stripWidth += lineRect.width
  })
  el.style.setProperty('--thc-dia-width', `${stripWidth}px`)
  el.style.setProperty('--thc-dia-pos', '-17%')
  const diaCharClasses = classTokens(stylex.props(diaStyles.diaChar)?.className)
  charOffsets.forEach(({ char, x }) => {
    char.style.setProperty('--thc-dia-x', `${x}px`)
    char.classList.add(...diaCharClasses)
  })
}

export function finishDia(chars: HTMLElement[]): void {
  const diaCharClasses = classTokens(stylex.props(diaStyles.diaChar)?.className)
  const diaCharDoneClasses = classTokens(stylex.props(diaStyles.diaCharDone)?.className)
  chars.forEach((char) => {
    char.classList.remove(...diaCharClasses)
    char.classList.add(...diaCharDoneClasses)
  })
}

export function playDiaSweep(
  el: HTMLElement,
  chars: HTMLElement[],
  onComplete?: () => void,
): ReturnType<typeof animate> {
  return animate(-17, 117, {
    duration: DIA_SWEEP_DURATION,
    ease: diaSweepEase,
    onUpdate: (value) => {
      el.style.setProperty('--thc-dia-pos', `${value}%`)
    },
    onComplete: () => {
      finishDia(chars)
      onComplete?.()
    },
  })
}

export function observeDiaReflow(el: HTMLElement, onReflow: () => void): () => void {
  let lastInlineSize = el.getBoundingClientRect().width
  let frame = 0
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const inlineSize = entry.borderBoxSize?.[0]?.inlineSize ?? el.getBoundingClientRect().width
    if (inlineSize === lastInlineSize) return
    lastInlineSize = inlineSize
    if (frame) cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      frame = 0
      onReflow()
    })
  })
  observer.observe(el)
  return () => {
    observer.disconnect()
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }
}
