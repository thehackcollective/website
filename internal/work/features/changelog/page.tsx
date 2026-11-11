import { changelogStyles as styles } from '@internal/work/features/changelog/changelog.stylex'
import { changelog, kindLabel } from '@internal/work/features/changelog/entries'
import * as stylex from '@stylexjs/stylex'
import { Badge } from '@/ui/badge'
import { Page as PageFrame, PageSpan } from '@/ui/page'
import { PageHeader } from '@/ui/page-header'

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London',
})

export function Page() {
  return (
    <PageFrame>
      <PageHeader title="Changelog" />
      <PageSpan>
        <ol {...stylex.props(styles.list)}>
          {changelog.map((entry) => (
            <li key={entry.version}>
              <article {...stylex.props(styles.entry)}>
                <div {...stylex.props(styles.meta)}>
                  <time dateTime={entry.date}>
                    {dayFormat.format(new Date(`${entry.date}T12:00:00Z`))}
                  </time>
                  <span>Version {entry.version}</span>
                  <Badge>{kindLabel[entry.kind]}</Badge>
                </div>
                <h2 {...stylex.props(styles.title)}>{entry.title}</h2>
                <ul {...stylex.props(styles.items)}>
                  {entry.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </PageSpan>
    </PageFrame>
  )
}
