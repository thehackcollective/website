import * as stylex from '@stylexjs/stylex'
import { useCallback, useState } from 'react'
import { cellStyles as styles } from '@/ui/table-cells.stylex'

export type Tone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'cat1'
  | 'cat2'
  | 'cat3'
  | 'cat4'
  | 'cat5'
  | 'cat6'

const dotForTone = {
  neutral: styles.neutralDot,
  success: styles.successDot,
  warning: styles.warningDot,
  danger: styles.dangerDot,
  cat1: styles.cat1Dot,
  cat2: styles.cat2Dot,
  cat3: styles.cat3Dot,
  cat4: styles.cat4Dot,
  cat5: styles.cat5Dot,
  cat6: styles.cat6Dot,
}

export function Tag({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span {...stylex.props(styles.tag)}>
      <Dot tone={tone} />
      {label}
    </span>
  )
}

export function TagList({ tags }: { tags: readonly { label: string; tone: Tone }[] }) {
  const [visible, setVisible] = useState(0)
  const attachBox = useCallback((element: HTMLDivElement | null) => {
    if (element === null) return
    const ruler = element.querySelector<HTMLElement>('[data-tag-measure]')
    if (ruler === null) return
    const fit = () => {
      const widths = [...ruler.querySelectorAll<HTMLElement>('[data-tag]')].map(
        (node) => node.offsetWidth,
      )
      const more = ruler.querySelector<HTMLElement>('[data-more]')?.offsetWidth ?? 0
      const gap = Number.parseFloat(getComputedStyle(element).columnGap)
      const room = element.clientWidth
      let used = 0
      let count = 0
      for (let i = 0; i < widths.length; i += 1) {
        const next = used + (count > 0 ? gap : 0) + (widths[i] ?? 0)
        const reserve = i < widths.length - 1 ? gap + more : 0
        if (next + reserve > room) break
        used = next
        count += 1
      }
      setVisible(Math.max(count, Math.min(1, widths.length)))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    observer.observe(ruler)
    return () => observer.disconnect()
  }, [])
  const hidden = tags.length - visible
  return (
    <div ref={attachBox} title={tags.map((t) => t.label).join(', ')} {...stylex.props(styles.tags)}>
      <div data-tag-measure="" aria-hidden="true" {...stylex.props(styles.measure)}>
        {tags.map((t) => (
          <span key={t.label} data-tag="">
            <Tag label={t.label} tone={t.tone} />
          </span>
        ))}
        <span data-more="" {...stylex.props(styles.more)}>
          +{tags.length}
        </span>
      </div>
      {tags.slice(0, visible).map((t) => (
        <Tag key={t.label} label={t.label} tone={t.tone} />
      ))}
      {hidden > 0 ? <span {...stylex.props(styles.more)}>+{hidden}</span> : null}
    </div>
  )
}

export function Strength({
  label,
  tone,
  compact = false,
}: {
  label: string
  tone: Tone
  compact?: boolean
}) {
  return (
    <span title={label} {...stylex.props(styles.strength)}>
      <Dot tone={tone} />
      {compact ? null : label}
    </span>
  )
}

export function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span title={label} {...stylex.props(styles.chip)}>
      <Dot tone={tone} />
      <span {...stylex.props(styles.chipLabel)}>{label}</span>
    </span>
  )
}

export function Dot({ tone }: { tone: Tone }) {
  return <span aria-hidden="true" {...stylex.props(styles.dot, dotForTone[tone])} />
}
