import { AuthProvider } from '@internal/work/features/auth'
import { featureRoutes } from '@internal/work/features/catalog'
import { LoadFailed, NotFound, SessionPending } from '@internal/work/shell/frame'
import { WorkShell } from '@internal/work/shell/shell'
import { createBrowserRouter, Outlet } from 'react-router'

function WorkRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export const workRouter = createBrowserRouter([
  {
    path: '/',
    Component: WorkRoot,
    HydrateFallback: SessionPending,
    errorElement: <LoadFailed />,
    children: [
      ...featureRoutes('bare'),
      {
        Component: WorkShell,
        errorElement: <LoadFailed />,
        children: [...featureRoutes('shell'), { path: '*', Component: NotFound }],
      },
    ],
  },
])
