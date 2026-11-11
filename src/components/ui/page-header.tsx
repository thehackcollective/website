import * as stylex from '@stylexjs/stylex'
import * as React from 'react'
import { Link } from 'react-router'
import { useMountEffect } from '@/lib/use-mount-effect'
import { pageHeaderVars, pageHeaderStyles as styles } from '@/ui/page-header.stylex'
import { type PageTabSet, PageTabsContext } from '@/ui/page-tabs'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

function revealInStrip(node: HTMLHeadingElement | null) {
  const strip = node?.parentElement
  if (node === null || strip === null || strip === undefined) return
  strip.scrollLeft = node.offsetLeft - strip.offsetLeft
}

function PageTabs({ set }: { set: PageTabSet }) {
  return (
    <nav aria-label={set.label} {...stylex.props(styles.tabs)}>
      {set.tabs.map((tab) =>
        tab.id === set.current ? (
          <h1
            key={tab.id}
            data-slot="page-header-title"
            ref={revealInStrip}
            {...stylex.props(styles.title, styles.tabSize, styles.tabCurrent)}
          >
            {tab.label}
          </h1>
        ) : (
          <Link
            key={tab.id}
            to={tab.to}
            onMouseEnter={() => set.prefetch?.(tab.to)}
            onFocus={() => set.prefetch?.(tab.to)}
            {...stylex.props(styles.title, styles.tabSize, styles.tab, primitiveStyles.hitArea)}
          >
            {tab.label}
          </Link>
        ),
      )}
    </nav>
  )
}

interface PageHeaderProps {
  title: React.ReactNode
  toggles?: React.ReactNode
  actions?: React.ReactNode
  sticky?: boolean
}

function ScrollSentinel({ onScrolled }: { onScrolled: (scrolled: boolean) => void }) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  useMountEffect(() => {
    const node = ref.current
    if (node === null) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.at(-1)
      if (entry !== undefined) onScrolled(!entry.isIntersecting)
    })
    observer.observe(node)
    return () => observer.disconnect()
  })
  return <div ref={ref} aria-hidden="true" {...stylex.props(styles.sentinel)} />
}

const HEIGHT_VAR = pageHeaderVars.height.slice(4, -1)

function useStickyHeight(sticky: boolean) {
  const ref = React.useRef<HTMLElement | null>(null)
  useMountEffect(() => {
    const node = ref.current
    if (!sticky || node === null) return
    const root = document.documentElement
    const publish = () => root.style.setProperty(HEIGHT_VAR, `${node.offsetHeight}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(node)
    return () => {
      observer.disconnect()
      root.style.removeProperty(HEIGHT_VAR)
    }
  })
  return ref
}

export function PageHeader({ title, toggles, actions, sticky = false }: PageHeaderProps) {
  const [scrolled, setScrolled] = React.useState(false)
  const headerRef = useStickyHeight(sticky)
  const tabs = React.useContext(PageTabsContext)
  return (
    <>
      {sticky && <ScrollSentinel onScrolled={setScrolled} />}
      <header
        ref={headerRef}
        data-slot="page-header"
        data-scrolled={sticky ? scrolled : undefined}
        {...stylex.props(styles.header, sticky && styles.sticky)}
      >
        {sticky && (
          <span
            aria-hidden="true"
            data-slot="page-header-surface"
            {...stylex.props(styles.surfaceLayer, scrolled && styles.surfaceLayerShown)}
          />
        )}
        <div data-slot="page-header-content" {...stylex.props(styles.content)}>
          <div {...stylex.props(styles.titleRow)}>
            {tabs === null ? (
              <h1 data-slot="page-header-title" {...stylex.props(styles.title)}>
                {title}
              </h1>
            ) : (
              <PageTabs set={tabs} />
            )}
          </div>
          {toggles && (
            <div data-slot="page-header-toggles" {...stylex.props(styles.toggles)}>
              {toggles}
            </div>
          )}
          {actions && (
            <div data-slot="page-header-actions" {...stylex.props(styles.actions)}>
              {actions}
            </div>
          )}
        </div>
      </header>
    </>
  )
}
