import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useApiResource } from '@/lib/hooks/use-api-resource'
import { AsyncContent } from '@/ui/async-content'
import { Avatar } from '@/ui/avatar'
import { Page as PageFrame, PageSpan } from '@/ui/page'
import { PageHeader } from '@/ui/page-header'
import { SkeletonRows } from '@/ui/skeleton'
import { Table, type TableConfig } from '@/ui/table'
import { Dot, Strength, TagList } from '@/ui/table-cells'
import {
  circleCaption,
  circleLabel,
  circleTone,
  intentTone,
  strongestFirst,
  tieTone,
} from './circles'
import { circles, fetchPeople, type Person } from './people-api'

const reachOf = (person: Person) =>
  [
    person.lumaAttended === null ? '' : `${person.lumaAttended} Luma events`,
    person.inWhatsapp ? `${person.builderGroups} builder groups` : '',
  ]
    .filter(Boolean)
    .join(' · ') || '—'

function peopleTable(people: readonly Person[]): TableConfig<Person> {
  return {
    id: 'people',
    title: 'People',
    rows: people,
    rowId: (person) => person.id,
    mark: (person) => <Avatar name={person.name} src={person.avatarUrl} size={24} decorative />,
    label: (person) => person.name,
    leadSortValue: (person) => person.name,
    searchText: (person) =>
      `${person.name} ${person.headline ?? ''} ${person.summary ?? ''} ${person.ties.join(' ')}`,
    searchPlaceholder: 'Search people',
    groups: {
      list: circles.map((circle) => ({
        id: circle,
        label: circleLabel[circle],
        description: circleCaption[circle],
        mark: <Dot tone={circleTone[circle]} />,
      })),
      of: (person) => person.circle,
    },
    columns: [
      {
        id: 'who',
        label: 'Who',
        width: 320,
        tier: 1,
        render: (person) => person.summary ?? person.headline ?? '—',
      },
      {
        id: 'ties',
        label: 'How we know them',
        width: 240,
        tier: 1,
        render: (person) => (
          <TagList
            tags={strongestFirst(person.ties).map((kind) => ({ label: kind, tone: tieTone(kind) }))}
          />
        ),
      },
      {
        id: 'intent',
        label: 'Intent',
        width: 96,
        tier: 0,
        align: 'end',
        render: (person) => (
          <Strength label={String(person.intent)} tone={intentTone(person.intent)} />
        ),
        sortValue: (person) => person.intent,
      },
      {
        id: 'reach',
        label: 'Seen at',
        width: 220,
        tier: 2,
        render: reachOf,
        sortValue: (person) => (person.lumaAttended ?? 0) + person.builderGroups,
      },
      {
        id: 'identity',
        label: 'Identity',
        width: 110,
        tier: 2,
        render: (person) => (person.identity === 'confirmed' ? 'Confirmed' : 'Likely'),
      },
    ],
    defaultSort: { column: 'intent', dir: -1 },
    pageSize: 25,
  }
}

export function Page() {
  const navigate = useNavigate()
  const [people, setPeople] = useState<readonly Person[]>([])
  const resource = useApiResource(fetchPeople, setPeople, 'Could not load the people.')
  return (
    <PageFrame>
      <PageHeader title="People" />
      <PageSpan>
        <div data-coachmark="people.table">
          <AsyncContent
            loading={resource.isLoading}
            error={resource.error}
            {...(resource.retryable ? { onRetry: () => void resource.reload() } : {})}
            empty={
              people.length === 0 && {
                kind: 'empty',
                title: 'No people yet',
                description: 'The profiling import fills this list.',
                primaryAction: { label: 'Check again', onClick: () => void resource.reload() },
              }
            }
            skeleton={<SkeletonRows rows={8} />}
          >
            <Table
              config={peopleTable(people)}
              onOpen={(person) => navigate(`/people/${encodeURIComponent(person.id)}`)}
            />
          </AsyncContent>
        </div>
      </PageSpan>
    </PageFrame>
  )
}
