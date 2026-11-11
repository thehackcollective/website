import * as stylex from '@stylexjs/stylex'
import { AnimatePresence, m } from 'motion/react'
import type * as React from 'react'
import { type SkeletonSwapState, useSkeletonSwap } from '@/lib/hooks/use-skeleton-swap'
import { exitTween, spring } from '@/lib/motion'
import { layout, radius, space } from '@/tokens/token-consts.stylex'
import { boneStyles, skeletonStyles as swapStyles } from '@/ui/skeleton.stylex'

type GeometryStyles = stylex.StyleXStyles<{
  height?: string | number
  maxWidth?: string | number
  width?: string | number
}>

const styles = stylex.create({
  bone: { borderRadius: radius.sm },
  round: { borderRadius: radius.full, flexShrink: 0 },
  rows: { display: 'flex', flexDirection: 'column', gap: space.xxs },
  row: { height: layout.rowHeight, width: '100%' },
})

export type SkeletonLine = 'ui' | 'caption' | 'heading'

export type SkeletonProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'> & {
  styles?: GeometryStyles
  line?: SkeletonLine
  round?: boolean
}

const lineBox = {
  ui: boneStyles.lineUi,
  caption: boneStyles.lineCaption,
  heading: boneStyles.lineHeading,
} as const

const lineGlyph = {
  ui: boneStyles.glyphUi,
  caption: boneStyles.glyphCaption,
  heading: boneStyles.glyphHeading,
} as const

export function Skeleton({ styles: geometry, line, round = false, ...props }: SkeletonProps) {
  if (line !== undefined) {
    return (
      <div aria-hidden data-slot="skeleton" {...props} {...stylex.props(lineBox[line])}>
        <div {...stylex.props(boneStyles.pulse, styles.bone, lineGlyph[line], geometry)} />
      </div>
    )
  }
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      {...props}
      {...stylex.props(boneStyles.pulse, styles.bone, round && styles.round, geometry)}
    />
  )
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div
      data-slot="skeleton-rows"
      role="status"
      aria-busy="true"
      aria-label="Loading"
      {...stylex.props(styles.rows)}
    >
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} styles={styles.row} />
      ))}
    </div>
  )
}

interface SkeletonSwapProps {
  loading: boolean
  children: React.ReactNode

  fallback?: React.ReactNode
  className?: string
  stretch?: boolean
}

type SwapStackProps = Omit<SkeletonSwapProps, 'loading'> & {
  state: SkeletonSwapState
  dataState?: string
}

export function SwapStack({
  state,
  dataState,
  children,
  fallback,
  className,
  stretch = false,
}: SwapStackProps) {
  const stackClassName = stylex.props(
    swapStyles.stack,
    stretch && swapStyles.stackStretch,
  ).className
  const wrapperClassName = [className, stackClassName].filter(Boolean).join(' ')

  if (state === 'pending') {
    return (
      <div className={wrapperClassName} role="status" aria-busy="true" data-state={dataState} />
    )
  }

  return (
    <div
      className={wrapperClassName}
      role={state === 'skeleton' ? 'status' : undefined}
      aria-busy={state === 'skeleton'}
      data-state={dataState ?? state}
    >
      <AnimatePresence initial={false}>
        <m.div
          key={state}
          {...stylex.props(
            swapStyles.layer,
            stretch && swapStyles.stretch,
            state === 'skeleton' && swapStyles.fill,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: exitTween.slow }}
          transition={state === 'skeleton' ? spring.fast : spring.moderate}
        >
          {state === 'skeleton'
            ? (fallback ?? <div {...stylex.props(boneStyles.pulse, swapStyles.fill)} />)
            : children}
        </m.div>
      </AnimatePresence>
    </div>
  )
}

export function SkeletonSwap({ loading, ...stack }: SkeletonSwapProps) {
  return <SwapStack state={useSkeletonSwap(loading)} {...stack} />
}
