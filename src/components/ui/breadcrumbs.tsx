import { useRender } from '@base-ui/react/use-render'
import * as stylex from '@stylexjs/stylex'
import { Fragment, type ReactNode } from 'react'
import { layout } from '@/tokens/token-consts.stylex'
import { breadcrumbsStyles as styles } from '@/ui/breadcrumbs.stylex'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export type BreadcrumbItem = {
  label: ReactNode
  href?: string
  id?: string
  render?: useRender.ComponentProps<'a'>['render']
}

function BreadcrumbLink({ item }: { item: BreadcrumbItem }) {
  const element = useRender({
    defaultTagName: 'a',
    render: item.render,
    props: {
      children: item.label,
      href: item.href,
      ...stylex.props(styles.link, primitiveStyles.hitArea),
    },
  })
  return <>{element}</>
}

function Chevron() {
  return (
    <svg
      fill="none"
      height={layout.kbdGlyph}
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 16 16"
      width={layout.inlineIconSize}
    >
      <path d="m6 4 4 4-4 4" />
    </svg>
  )
}

export function Breadcrumbs({
  items,
  label = 'Breadcrumb',
}: {
  items: BreadcrumbItem[]
  label?: string
}) {
  return (
    <nav aria-label={label} {...stylex.props(styles.nav)}>
      <ol {...stylex.props(styles.list)}>
        {items.map((item, index) => {
          const current = index === items.length - 1
          let content: ReactNode
          if (current) {
            content = (
              <span aria-current="page" {...stylex.props(styles.current)}>
                {item.label}
              </span>
            )
          } else if (item.href !== undefined || item.render !== undefined) {
            content = <BreadcrumbLink item={item} />
          } else {
            content = <span {...stylex.props(styles.current)}>{item.label}</span>
          }
          return (
            <Fragment key={item.id ?? item.href ?? String(item.label)}>
              <li>{content}</li>
              {!current && (
                <li aria-hidden="true" {...stylex.props(styles.separator)}>
                  <Chevron />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
