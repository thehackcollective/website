import { EmptyState } from '@/ui/empty-state'
import { Page as PageFrame } from '@/ui/page'
import { PageHeader } from '@/ui/page-header'

export function Page() {
  return (
    <PageFrame>
      <PageHeader title="Home" />
      <div data-coachmark="home.next">
        <EmptyState
          kind="empty"
          size="page"
          title="The CRM comes next"
          description="Members, partners and events will live here once the CRM ships."
          primaryAction={{ label: 'Open the changelog', to: '/changelog' }}
        />
      </div>
    </PageFrame>
  )
}
