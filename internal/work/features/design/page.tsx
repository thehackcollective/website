import { ShowcaseActions } from '@internal/work/features/design/showcase-actions'
import { ShowcaseCalendar } from '@internal/work/features/design/showcase-calendar'
import { ShowcaseCharts } from '@internal/work/features/design/showcase-charts'
import { ShowcaseControls } from '@internal/work/features/design/showcase-controls'
import { ShowcaseInputs } from '@internal/work/features/design/showcase-inputs'
import { ShowcaseLayout } from '@internal/work/features/design/showcase-layout'
import { ShowcaseLists } from '@internal/work/features/design/showcase-lists'
import { ShowcaseDialogs, ShowcaseToasts } from '@internal/work/features/design/showcase-overlays'
import { ShowcaseProgress } from '@internal/work/features/design/showcase-progress'
import { ShowcaseStates } from '@internal/work/features/design/showcase-states'
import { ShowcaseTable } from '@internal/work/features/design/showcase-table'
import { Button } from '@/ui/button'
import { Closing, Page as PageFrame } from '@/ui/page'
import { PageHeader } from '@/ui/page-header'
import { PageTabsProvider } from '@/ui/page-tabs'

const shellTabs = {
  label: 'Work pages',
  current: 'design',
  tabs: [
    { id: 'home', label: 'Home', to: '/' },
    { id: 'design', label: 'Design', to: '/design' },
  ],
}

export function Page() {
  return (
    <PageFrame>
      <PageTabsProvider value={shellTabs}>
        <PageHeader title="Design" />
      </PageTabsProvider>
      <ShowcaseActions />
      <ShowcaseControls />
      <ShowcaseInputs />
      <ShowcaseLayout />
      <ShowcaseLists />
      <ShowcaseTable />
      <ShowcaseCharts />
      <ShowcaseProgress />
      <ShowcaseCalendar />
      <ShowcaseDialogs />
      <ShowcaseStates />
      <ShowcaseToasts />
      <Closing actions={<Button variant="outline">Closing action</Button>}>
        The closing block ends a page with the next step for the reader.
      </Closing>
    </PageFrame>
  )
}
