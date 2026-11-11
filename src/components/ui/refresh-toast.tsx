import { toast } from 'sonner'
import { Button } from '@/ui/button'

export function showRefreshFailed({
  id,
  message,
  onRetry,
}: {
  id: string
  message: string
  onRetry: () => void
}) {
  toast.error(message, {
    id,
    duration: 8_000,
    cancel: (
      <Button variant="ghost" size="sm" onClick={() => toast.dismiss(id)}>
        Close
      </Button>
    ),
    action: (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          toast.dismiss(id)
          onRetry()
        }}
      >
        Retry
      </Button>
    ),
  })
}

export function clearRefreshFailed(id: string) {
  toast.dismiss(id)
}

export function showNewVersion() {
  toast('A new version of the app is ready.', {
    id: 'new-version',
    position: 'top-center',
    duration: Number.POSITIVE_INFINITY,
    action: (
      <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
        Reload
      </Button>
    ),
  })
}
