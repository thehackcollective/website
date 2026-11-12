import {
  circleLabel,
  circleTone,
  type Evidence,
  fetchPerson,
  type PersonDetail,
} from '@internal/work/features/people'
import * as stylex from '@stylexjs/stylex'
import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useApiResource } from '@/lib/hooks/use-api-resource'
import { AsyncContent } from '@/ui/async-content'
import { Avatar } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { SectionCard } from '@/ui/card'
import { ExternalLink } from '@/ui/external-link'
import { icons } from '@/ui/icons'
import { Page as PageFrame } from '@/ui/page'
import { PageHeader } from '@/ui/page-header'
import { RowList, RowListItem } from '@/ui/row-list'
import { Skeleton, SkeletonRows } from '@/ui/skeleton'
import { Stat, StatStrip } from '@/ui/stat-strip'
import { StatusChip, Tag } from '@/ui/table-cells'
import { Body, Caption } from '@/ui/text'
import { personStyles as styles } from './person.stylex'

const sourceLabel: Record<string, string> = {
  luma: 'Luma',
  whatsapp: 'WhatsApp',
  x: 'X',
  cv: "Louis's CV",
  contacts: "Louis's contacts",
}

const linkLabel: Record<string, string> = {
  luma: 'Luma',
  linkedin: 'LinkedIn',
  x: 'X',
  github: 'GitHub',
  instagram: 'Instagram',
  website: 'Website',
}

const hrefOf = (value: string) => (value.startsWith('http') ? value : `https://${value}`)

function evidenceDetail(evidence: Evidence) {
  return [
    evidence.kind,
    sourceLabel[evidence.source] ?? evidence.source,
    evidence.observedAt?.slice(0, 10) ?? '',
  ]
    .filter(Boolean)
    .join(' · ')
}

function EvidenceCard({ evidence }: { evidence: readonly Evidence[] }) {
  return (
    <SectionCard title="How we know them" icon={icons.info}>
      <RowList>
        {evidence.map((item) => (
          <RowListItem
            key={`${item.kind}-${item.detail}`}
            title={item.detail}
            detail={evidenceDetail(item)}
            actions={
              item.sourceUrl === null ? undefined : (
                <ExternalLink href={item.sourceUrl} variant="ghost" size="sm">
                  Source
                </ExternalLink>
              )
            }
          />
        ))}
      </RowList>
    </SectionCard>
  )
}

function HeaderActions({ person }: { person: PersonDetail | null }) {
  const navigate = useNavigate()
  const profiles = person?.links.filter((link) => linkLabel[link.kind] !== undefined) ?? []
  return (
    <div {...stylex.props(styles.chips)}>
      <Button variant="ghost" size="sm" onClick={() => navigate('/people')}>
        All people
      </Button>
      {profiles.map((link) => (
        <ExternalLink
          key={`${link.kind}-${link.value}`}
          href={hrefOf(link.value)}
          variant="secondary"
          size="sm"
        >
          {linkLabel[link.kind]}
        </ExternalLink>
      ))}
    </div>
  )
}

function PersonSkeleton() {
  return (
    <div {...stylex.props(styles.stack)}>
      <div {...stylex.props(styles.hero)}>
        <Skeleton round styles={styles.avatarBone} />
        <div {...stylex.props(styles.heroText, styles.heroBones)}>
          <Skeleton line="ui" />
          <Skeleton line="caption" styles={styles.chipBone} />
        </div>
      </div>
      <SkeletonRows rows={6} />
    </div>
  )
}

function PersonBody({ person }: { person: PersonDetail }) {
  return (
    <div {...stylex.props(styles.stack)}>
      <div {...stylex.props(styles.hero)}>
        <Avatar name={person.name} src={person.avatarUrl} size={56} />
        <div {...stylex.props(styles.heroText)}>
          {person.headline !== null && <Body>{person.headline}</Body>}
          <div {...stylex.props(styles.chips)}>
            <StatusChip label={circleLabel[person.circle]} tone={circleTone[person.circle]} />
            <Tag
              label={person.identity === 'confirmed' ? 'Identity confirmed' : 'Identity likely'}
              tone={person.identity === 'confirmed' ? 'success' : 'warning'}
            />
          </div>
        </div>
      </div>
      {person.summary !== null && <Body>{person.summary}</Body>}
      <StatStrip>
        <Stat label="Intent" value={String(person.intent)} />
        <Stat label="Luma events" value={String(person.lumaAttended ?? '—')} />
        <Stat
          label="Builder groups"
          value={person.inWhatsapp ? String(person.builderGroups) : '—'}
        />
        <Stat label="Chat messages" value={String(person.chatMessages)} />
      </StatStrip>
      {person.evidence.length > 0 ? (
        <EvidenceCard evidence={person.evidence} />
      ) : (
        <Caption>No tie on record yet.</Caption>
      )}
    </div>
  )
}

export function Page() {
  const { id = '' } = useParams()
  const [person, setPerson] = useState<PersonDetail | null>(null)
  const load = useCallback(() => fetchPerson(id), [id])
  const resource = useApiResource(load, setPerson, 'Could not load this person.')
  return (
    <PageFrame focus>
      <PageHeader title={person?.name ?? 'Person'} actions={<HeaderActions person={person} />} />
      <AsyncContent
        loading={resource.isLoading}
        error={resource.error}
        {...(resource.retryable ? { onRetry: () => void resource.reload() } : {})}
        skeleton={<PersonSkeleton />}
      >
        {person !== null && <PersonBody person={person} />}
      </AsyncContent>
    </PageFrame>
  )
}
