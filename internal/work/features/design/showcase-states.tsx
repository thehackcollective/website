import { EmptyState } from '@/ui/empty-state'
import { Section } from '@/ui/page'

export function ShowcaseStates() {
  return (
    <>
      <Section span={6} heading="Empty, nothing yet">
        <EmptyState
          kind="empty"
          title="No members yet"
          description="Invite the first member to start the CRM."
          primaryAction={{ label: 'Invite a member', onClick: () => undefined }}
        />
      </Section>
      <Section span={6} heading="Empty, filtered">
        <EmptyState
          kind="filtered"
          title="No members match this search"
          primaryAction={{ label: 'Clear the search', onClick: () => undefined }}
        />
      </Section>
      <Section span={6} heading="Empty, all clear">
        <EmptyState kind="clear" title="Every invite is answered" />
      </Section>
      <Section span={6} heading="Empty, denied">
        <EmptyState
          kind="denied"
          title="Only organisers see sponsors"
          description="Ask an organiser for access."
        />
      </Section>
      <Section heading="Error">
        <EmptyState
          tone="error"
          title="Members did not load"
          description="Check your connection and try again."
          onRetry={() => undefined}
        />
      </Section>
    </>
  )
}
