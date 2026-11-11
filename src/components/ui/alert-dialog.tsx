import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import * as stylex from '@stylexjs/stylex'
import * as React from 'react'

import { layout, space } from '@/tokens/token-consts.stylex'
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from '@/ui/button'
import { InlineError } from '@/ui/inline-error'
import { primitiveStyles } from '@/ui/primitive-styles.stylex'

export type AlertDialogProps = Omit<
  AlertDialogPrimitive.Root.Props,
  'className' | 'style' | 'render'
>

export function AlertDialog(props: AlertDialogProps) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

const styles = stylex.create({
  content: {
    maxWidth: {
      ':is([data-size="sm"])': layout.dialogCompactWidth,
      default: layout.dialogWidth,
    },
  },

  header: {
    alignItems: {
      '@media (min-width: 640px)': 'flex-start',
      default: 'center',
    },
    display: 'flex',
    flexDirection: 'column',
    gap: space.xxs,
    textAlign: {
      '@media (min-width: 640px)': 'start',
      default: 'center',
    },
  },
})

export type AlertDialogContentProps = Omit<
  AlertDialogPrimitive.Popup.Props,
  'className' | 'style' | 'render'
> & {
  size?: 'default' | 'sm'
}

export function AlertDialogContent({ size = 'default', ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal">
      <AlertDialogPrimitive.Backdrop
        data-slot="alert-dialog-overlay"
        {...stylex.props(primitiveStyles.backdrop, primitiveStyles.modalTransition)}
      />
      <AlertDialogPrimitive.Popup
        data-size={size}
        data-slot="alert-dialog-content"
        {...props}
        {...stylex.props(
          primitiveStyles.modalSurface,
          primitiveStyles.centeredModal,
          primitiveStyles.modalTransition,
          styles.content,
        )}
      />
    </AlertDialogPrimitive.Portal>
  )
}

export type AlertDialogHeaderProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'>

export function AlertDialogHeader(props: AlertDialogHeaderProps) {
  return <div data-slot="alert-dialog-header" {...props} {...stylex.props(styles.header)} />
}

export type AlertDialogFooterProps = Omit<React.ComponentProps<'div'>, 'className' | 'style'>

export function AlertDialogFooter(props: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      {...props}
      {...stylex.props(primitiveStyles.modalFooter, primitiveStyles.modalFooterBleed)}
    />
  )
}

export type AlertDialogTitleProps = Omit<
  AlertDialogPrimitive.Title.Props,
  'className' | 'style' | 'render'
>

export function AlertDialogTitle(props: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      {...props}
      {...stylex.props(primitiveStyles.modalTitle)}
    />
  )
}

export type AlertDialogDescriptionProps = Omit<
  AlertDialogPrimitive.Description.Props,
  'className' | 'style' | 'render'
>

export function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      {...props}
      {...stylex.props(primitiveStyles.modalDescription)}
    />
  )
}

export type AlertDialogActionProps = Omit<ButtonProps, 'className' | 'style'>

export function AlertDialogAction(props: AlertDialogActionProps) {
  return <Button data-slot="alert-dialog-action" {...props} />
}

export type AlertDialogCancelProps = Omit<
  AlertDialogPrimitive.Close.Props,
  'className' | 'style' | 'render'
> & {
  size?: ButtonSize
  variant?: ButtonVariant
}

export function AlertDialogCancel({
  size = 'md',
  variant = 'outline',
  ...props
}: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button size={size} variant={variant} />}
      {...props}
    />
  )
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  working = false,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactElement
  title: string
  description: React.ReactNode
  confirmLabel?: string
  onConfirm?: () => void | Promise<void>
  working?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next)
    if (!next) setFailed(false)
    onOpenChange?.(next)
  }
  const handleConfirm = async () => {
    setPending(true)
    setFailed(false)
    try {
      await onConfirm?.()
      setOpen(false)
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }
  const busy = working || pending

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {trigger !== undefined && <AlertDialogPrimitive.Trigger render={trigger} />}
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && <InlineError>That did not work. Try again.</InlineError>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            loading={busy}
            onClick={() => {
              void handleConfirm()
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
