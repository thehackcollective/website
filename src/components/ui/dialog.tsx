import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import type { StyleXStyles } from '@stylexjs/stylex'
import * as stylex from '@stylexjs/stylex'
import type * as React from 'react'
import { createContext, useContext } from 'react'
import { breakpoint, color, layout, radius, space } from '@/tokens/token-consts.stylex'
import { Button } from '@/ui/button'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export type DialogProps = Omit<DialogPrimitive.Root.Props, 'className' | 'style' | 'render'>

export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

export type DialogCloseProps = Omit<DialogPrimitive.Close.Props, 'className' | 'style'>

export function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const MODAL_MAX_HEIGHT = 'calc(100dvh - min(12dvh, 7rem) - 1.5rem)'
const PALETTE_TOP = '16dvh'
const paletteMaxHeight = `calc(100dvh - ${PALETTE_TOP} * 2)`

const styles = stylex.create({
  content: {
    maxHeight: MODAL_MAX_HEIGHT,
    maxWidth: layout.dialogWidth,
    overflowY: 'auto',
  },

  formContent: {
    maxHeight: MODAL_MAX_HEIGHT,
    maxWidth: layout.dialogWideWidth,
    overflowY: 'auto',
  },

  paletteContent: {
    bottom: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    height: 'fit-content',
    marginBlock: 0,
    maxHeight: paletteMaxHeight,
    maxWidth: layout.commandWidth,
    overflow: 'hidden',
    padding: 0,
    top: PALETTE_TOP,
    transformOrigin: 'top center',
    width: `calc(100% - ${space.gutter} * 2)`,
  },

  plainContent: {
    backgroundColor: null,
    borderRadius: null,
    boxShadow: null,
    gap: null,
    maxWidth: layout.dialogExtraWideWidth,
    padding: null,
  },
  docked: {
    borderBottomLeftRadius: { default: radius.none, [breakpoint.tablet]: radius.lg },
    borderBottomRightRadius: { default: radius.none, [breakpoint.tablet]: radius.lg },
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    height: { default: null, [breakpoint.tablet]: 'fit-content' },
    left: { default: 0, [breakpoint.tablet]: '50%' },
    marginBlock: { default: null, [breakpoint.tablet]: 'auto' },
    maxHeight: {
      default: `calc(100dvh - ${space.safeTop} - 2rem)`,
      [breakpoint.tablet]: MODAL_MAX_HEIGHT,
    },
    overflow: 'hidden',
    right: { default: 0, [breakpoint.tablet]: 'auto' },
    top: { default: 'auto', [breakpoint.tablet]: 0 },
    transform: { default: null, [breakpoint.tablet]: 'translateX(-50%)' },
    transitionProperty: 'opacity, translate',
    translate: {
      default: '0',
      ':is([data-starting-style])': '0 24px',
      ':is([data-ending-style])': '0 24px',
      [breakpoint.reducedMotion]: '0',
    },
    width: { default: '100%', [breakpoint.tablet]: `calc(100% - ${space.md} * 2)` },
  },

  panelContent: {
    maxWidth: { default: null, [breakpoint.tablet]: layout.sidePanelMax },
  },

  composeContent: {
    maxWidth: { default: null, [breakpoint.tablet]: layout.dialogComposeWidth },
  },

  wideContent: {
    maxWidth: { default: null, [breakpoint.tablet]: layout.dialogTwoPaneWidth },
  },

  portalBackdrop: {
    backgroundColor: color.backgroundScrim,
    inset: 0,
    position: 'fixed',
    zIndex: 80,
  },

  portalContent: {
    backgroundColor: color.backgroundSurface,
    borderColor: color.borderDefault,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderBottomLeftRadius: { default: radius.none, [breakpoint.tablet]: radius.xl },
    borderBottomRightRadius: { default: radius.none, [breakpoint.tablet]: radius.xl },
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    height: { default: null, [breakpoint.tablet]: 'fit-content' },
    left: 0,
    marginBlock: { default: null, [breakpoint.tablet]: 'auto' },
    marginInline: { default: null, [breakpoint.tablet]: 'auto' },
    maxHeight: { default: '85svh', [breakpoint.tablet]: 'calc(100svh - 32px)' },
    overflowY: 'auto',
    padding: space.lg,
    right: 0,
    top: { default: 'auto', [breakpoint.tablet]: 0 },
    transform: {
      default: 'translateY(0)',
      ':is([data-starting-style])': 'translateY(24px)',
      ':is([data-ending-style])': 'translateY(24px)',
      [breakpoint.reducedMotion]: 'none',
    },
    transitionProperty: 'opacity, transform',
    width: { default: 'auto', [breakpoint.tablet]: '26rem' },
    zIndex: 90,
  },

  sheetBackdrop: {
    zIndex: 80,
  },

  sheetContent: {
    borderBottomWidth: 0,
    borderInlineWidth: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    left: 0,
    opacity: {
      default: 1,
      ':is([data-starting-style])': 1,
      ':is([data-ending-style])': 1,
    },
    overflow: 'hidden',
    overscrollBehavior: 'contain',
    right: 0,
    top: `calc(${space.safeTop} + ${space.sm})`,
    transform: {
      default: 'translateY(0)',
      ':is([data-starting-style])': 'translateY(100%)',
      ':is([data-ending-style])': 'translateY(100%)',
      [breakpoint.reducedMotion]: 'translateY(0)',
    },
    transitionProperty: 'transform',
    zIndex: 90,
  },

  closeWrap: {
    position: 'absolute',
    right: space.xs,
    top: space.xs,
  },

  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xxs,
  },

  headerBesideClose: {
    paddingInlineEnd: space['2xl'],
  },

  dockedHeader: {
    flexShrink: 0,
    padding: space.md,
    paddingBottom: 0,
    paddingInlineEnd: space['3xl'],
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: space.md,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    padding: space.md,
    paddingBottom: space.lg,
  },
})

export type DialogContentProps = Omit<
  DialogPrimitive.Popup.Props,
  'className' | 'style' | 'render'
> & {
  showCloseButton?: boolean
  variant?:
    | 'default'
    | 'plain'
    | 'form'
    | 'palette'
    | 'panel'
    | 'compose'
    | 'wide'
    | 'portal'
    | 'sheet'
}

const dockedWidths = {
  panel: styles.panelContent,
  compose: styles.composeContent,
  wide: styles.wideContent,
} as const

const CloseButtonShown = createContext(false)
const Docked = createContext(false)
type DialogVariant = NonNullable<DialogContentProps['variant']>
const ContentVariant = createContext<DialogVariant>('default')

export function DialogContent({
  showCloseButton = true,
  variant = 'default',
  children,
  ...props
}: DialogContentProps) {
  let backdrop: StyleXStyles[] = [primitiveStyles.backdrop, primitiveStyles.modalTransition]
  let content: StyleXStyles[] = [
    primitiveStyles.centeredModal,
    primitiveStyles.modalTransition,
    variant === 'plain' ? styles.plainContent : styles.content,
    variant === 'form' ? styles.formContent : null,
    variant === 'palette' ? styles.paletteContent : null,
  ]
  const docked = variant === 'panel' || variant === 'compose' || variant === 'wide'
  if (docked) content = [styles.docked, primitiveStyles.modalTransition, dockedWidths[variant]]
  if (variant === 'portal') {
    backdrop = [styles.portalBackdrop, primitiveStyles.modalTransition]
    content = [styles.portalContent, primitiveStyles.modalTransition]
  }
  if (variant === 'sheet') {
    backdrop = [primitiveStyles.backdrop, styles.sheetBackdrop, primitiveStyles.modalTransition]
    content = [styles.sheetContent, primitiveStyles.sheetTransition]
  }
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogPrimitive.Backdrop data-slot="dialog-overlay" {...stylex.props(...backdrop)} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        {...stylex.props(primitiveStyles.modalSurface, ...content)}
        {...props}
      >
        <Docked.Provider value={docked}>
          <ContentVariant.Provider value={variant}>
            <CloseButtonShown.Provider value={showCloseButton}>
              {children}
            </CloseButtonShown.Provider>
          </ContentVariant.Provider>
        </Docked.Provider>
        {showCloseButton && (
          <div data-slot="dialog-close-wrap" {...stylex.props(styles.closeWrap)}>
            <DialogClose render={<Button size="iconTouch" variant="ghost" aria-label="Close" />}>
              <Icon icon={icons.close} />
            </DialogClose>
          </div>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

export type DialogHeaderProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'>

export function DialogHeader(props: DialogHeaderProps) {
  const besideClose = useContext(CloseButtonShown)
  const docked = useContext(Docked)
  return (
    <div
      data-slot="dialog-header"
      {...props}
      {...stylex.props(
        styles.header,
        besideClose && styles.headerBesideClose,
        docked && styles.dockedHeader,
      )}
    />
  )
}

export type DialogBodyProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'>

export function DialogBody(props: DialogBodyProps) {
  return <div data-slot="dialog-body" {...props} {...stylex.props(styles.body)} />
}

export type DialogFooterProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'> & {
  showCloseButton?: boolean
}

export function DialogFooter({ showCloseButton = false, children, ...props }: DialogFooterProps) {
  const variant = useContext(ContentVariant)
  const footerStyles: StyleXStyles[] = [primitiveStyles.modalFooter]
  if (variant === 'default' || variant === 'form') {
    footerStyles.push(primitiveStyles.modalFooterBleed)
  }
  if (variant === 'portal') {
    footerStyles.push(primitiveStyles.modalFooterBleedWide)
  }
  return (
    <div data-slot="dialog-footer" {...props} {...stylex.props(...footerStyles)}>
      {children}
      {showCloseButton && (
        <DialogClose render={<Button size="sm" variant="outline" />}>Close</DialogClose>
      )}
    </div>
  )
}

export type DialogTitleProps = Omit<
  DialogPrimitive.Title.Props,
  'className' | 'style' | 'render'
> & {
  style?: StyleXStyles
}

export function DialogTitle({ style, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      {...props}
      {...stylex.props(primitiveStyles.modalTitle, style)}
    />
  )
}

export type DialogDescriptionProps = Omit<
  DialogPrimitive.Description.Props,
  'className' | 'style' | 'render'
> & {
  style?: StyleXStyles
}

export function DialogDescription({ style, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      {...props}
      {...stylex.props(primitiveStyles.modalDescription, style)}
    />
  )
}
