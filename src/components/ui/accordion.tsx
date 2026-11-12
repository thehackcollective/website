import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import * as stylex from '@stylexjs/stylex'
import { createContext, type ReactNode, useContext } from 'react'
import { sizeTransition } from '@/lib/size-transition.stylex'
import { disclosureStyles, accordionStyles as styles } from '@/ui/accordion.stylex'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'

type AccordionVariant = 'line' | 'card'

const AccordionVariantContext = createContext<AccordionVariant>('line')

export type AccordionProps = Omit<
  AccordionPrimitive.Root.Props<string>,
  'className' | 'style' | 'render'
> & {
  variant?: AccordionVariant
}

export function Accordion({ variant = 'line', ...props }: AccordionProps) {
  return (
    <AccordionVariantContext.Provider value={variant}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        {...props}
        {...stylex.props(variant === 'card' ? styles.rootCard : styles.rootLine)}
      />
    </AccordionVariantContext.Provider>
  )
}

export type AccordionItemProps = Omit<
  AccordionPrimitive.Item.Props,
  'className' | 'style' | 'render'
>

export function AccordionItem(props: AccordionItemProps) {
  const variant = useContext(AccordionVariantContext)
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      {...props}
      {...stylex.props(variant === 'card' ? styles.itemCard : styles.itemLine)}
    />
  )
}

export function DisclosureChevron() {
  return (
    <span {...stylex.props(disclosureStyles.chevron)}>
      <Icon icon={icons.expand} size="sm" />
    </span>
  )
}

export function AccordionTrigger({ children }: { children: ReactNode }) {
  const variant = useContext(AccordionVariantContext)
  return (
    <AccordionPrimitive.Header {...stylex.props(styles.header)}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        {...stylex.props(styles.trigger, variant === 'card' && styles.triggerCard)}
      >
        {children}
        <DisclosureChevron />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export type AccordionPanelProps = Omit<
  AccordionPrimitive.Panel.Props,
  'className' | 'style' | 'render'
>

export function AccordionPanel({ children, ...props }: AccordionPanelProps) {
  const variant = useContext(AccordionVariantContext)
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      {...props}
      {...stylex.props(styles.panel, sizeTransition.rows)}
    >
      <div {...stylex.props(styles.clip)}>
        <div {...stylex.props(styles.body, variant === 'card' && styles.bodyCard)}>{children}</div>
      </div>
    </AccordionPrimitive.Panel>
  )
}
