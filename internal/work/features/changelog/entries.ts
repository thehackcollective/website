export type ChangelogKind = 'new' | 'improved' | 'fixed'

export interface ChangelogEntry {
  version: string
  date: string
  kind: ChangelogKind
  title: string
  items: readonly string[]
}

export const kindLabel: Readonly<Record<ChangelogKind, string>> = {
  new: 'New',
  improved: 'Improved',
  fixed: 'Fixed',
}

export const changelog: readonly [ChangelogEntry, ...ChangelogEntry[]] = [
  {
    version: '1.0.0',
    date: '2026-11-11',
    kind: 'new',
    title: 'cf0 design foundation',
    items: [
      'The work app opens with a sidebar, a phone dock and a command palette on Cmd K or Ctrl K.',
      'Sign-in is invite-only, and every API call checks your session.',
      'Settings lets you pick a text weight and mute the click sounds.',
    ],
  },
]
