import { showcaseStyles as styles } from '@internal/work/features/design/showcase.stylex'
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  ConfirmDialog,
} from '@/ui/alert-dialog'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Section } from '@/ui/page'
import { showNewVersion, showRefreshFailed } from '@/ui/refresh-toast'
import { Body } from '@/ui/text'

export function ShowcaseDialogs() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [log, setLog] = useState('No dialog closed yet')
  return (
    <Section heading="Dialogs" caption={log}>
      <div {...stylex.props(styles.row)}>
        <Button variant="outline" onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <Button variant="outline" onClick={() => setPanelOpen(true)}>
          Open panel
        </Button>
        <Button variant="outline" onClick={() => setAlertOpen(true)}>
          Open alert
        </Button>
        <ConfirmDialog
          trigger={<Button variant="outline">Remove member</Button>}
          title="Remove this member?"
          description="They lose access to the work app until you invite them again."
          confirmLabel="Remove"
          onConfirm={() => setLog('Remove confirmed')}
        />
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
            <DialogDescription>An invite is the only way into the work app.</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              onClick={() => {
                setDialogOpen(false)
                setLog('Invite sent')
              }}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={panelOpen} onOpenChange={setPanelOpen}>
        <DialogContent variant="panel">
          <DialogHeader>
            <DialogTitle>Sample panel</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Body>A detail view opens at the side, and on a phone it opens from the bottom.</Body>
          </DialogBody>
        </DialogContent>
      </Dialog>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>Your changes to this member are lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setAlertOpen(false)
                setLog('Left without saving')
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  )
}

export function ShowcaseToasts() {
  return (
    <Section heading="Toasts" caption="Each button fires the real toast">
      <div data-coachmark="design.toasts" {...stylex.props(styles.row)}>
        <Button variant="secondary" onClick={() => toast('Member saved')}>
          Plain
        </Button>
        <Button variant="secondary" onClick={() => toast.success('Invite sent')}>
          Success
        </Button>
        <Button variant="secondary" onClick={() => toast.error('Could not send the invite.')}>
          Error
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            showRefreshFailed({
              id: 'design-refresh',
              message: 'Members did not refresh.',
              onRetry: () => toast('Retrying'),
            })
          }
        >
          Refresh failed
        </Button>
        <Button variant="secondary" onClick={showNewVersion}>
          New version
        </Button>
      </div>
    </Section>
  )
}
