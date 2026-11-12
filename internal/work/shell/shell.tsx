import { AuthPending, SIGN_IN_PATH, useSession } from '@internal/work/features/auth'
import { pageKindAt, pageLabelAt } from '@internal/work/features/catalog'
import { useNewVersion } from '@internal/work/new-version'
import { CoachmarkRunner } from '@internal/work/shell/coachmark-runner'
import { CommandPalette } from '@internal/work/shell/command-palette'
import { LoadFailed, SessionPending } from '@internal/work/shell/frame'
import { layoutStyles as shellLayout } from '@internal/work/shell/layout.stylex'
import { PhoneDock, PhoneHeader, Sidebar } from '@internal/work/shell/nav'
import { useAppNavLayout } from '@internal/work/shell/nav-layout'
import { useSidebarCollapsed } from '@internal/work/shell/sidebar-state'
import * as stylex from '@stylexjs/stylex'
import { Navigate, Outlet, useLocation } from 'react-router'
import { DocumentTitle } from '@/ui/document-title'

const kindStyles = {
  fill: null,
  focus: shellLayout.routeFocus,
} as const

function ShellFrame() {
  const variant = useAppNavLayout()
  const userCollapsed = useSidebarCollapsed()
  const { pathname } = useLocation()
  const phone = variant === 'bar'
  const pageLabel = pageLabelAt(pathname)
  const title =
    pageLabel === null ? 'The Hack Collective Work' : `${pageLabel} · The Hack Collective Work`
  return (
    <div
      data-slot="property-shell"
      data-thc-surface="console"
      {...stylex.props(shellLayout.propertyShell)}
    >
      <DocumentTitle key={title} title={title} />
      <CommandPalette />
      <CoachmarkRunner />
      {!phone && (
        <Sidebar
          collapsed={variant === 'icons' || userCollapsed}
          canCollapse={variant === 'rail'}
        />
      )}
      <div data-slot="property-content" {...stylex.props(shellLayout.propertyContent)}>
        {phone && <PhoneHeader />}
        <main
          id="main"
          data-slot="property-main"
          {...stylex.props(shellLayout.main, phone && shellLayout.mainAboveTabBar)}
        >
          <div {...stylex.props(shellLayout.frame)}>
            <div {...stylex.props(shellLayout.route, kindStyles[pageKindAt(pathname)])}>
              <Outlet />
            </div>
          </div>
        </main>
        {phone && <PhoneDock />}
      </div>
    </div>
  )
}

export function WorkShell() {
  useNewVersion()
  const session = useSession()
  const { pathname, search, hash } = useLocation()
  if (session === 'checking')
    return <AuthPending loading={<SessionPending />} failed={<LoadFailed />} />
  if (session === 'signed-out') {
    const back = encodeURIComponent(`${pathname}${search}${hash}`)
    return <Navigate to={`${SIGN_IN_PATH}?redirect_url=${back}`} replace />
  }
  return <ShellFrame />
}
