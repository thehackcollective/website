import * as stylex from '@stylexjs/stylex'
import { breakpoint, color, layout, space } from '@/tokens/token-consts.stylex'

const MID = '@media (min-width: 600px) and (max-width: 959.99px)'

export const pageStyles = stylex.create({
  page: {
    backgroundColor: color.backgroundSurface,
    columnGap: space.lg,
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(4, minmax(0, 1fr))',
      [MID]: 'repeat(6, minmax(0, 1fr))',
      [breakpoint.tablet]: 'repeat(12, minmax(0, 1fr))',
    },
    paddingBlockEnd: { default: space.lg, [breakpoint.mobile]: space.xl },
    rowGap: space['3xl'],
    width: '100%',
  },
  contained: {
    backgroundColor: 'transparent',
    maxWidth: '100%',
  },
  focus: {
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      [MID]: 'minmax(0, 1fr)',
      [breakpoint.tablet]: 'minmax(0, 1fr)',
    },
    marginInline: 'auto',
    maxWidth: layout.columnFocus,
  },
  pageProse: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    minWidth: 0,
  },
  span4: { gridColumn: { default: '1 / -1', [breakpoint.tablet]: 'span 4' } },
  span5: { gridColumn: { default: '1 / -1', [breakpoint.tablet]: 'span 5' } },
  span6: { gridColumn: { default: '1 / -1', [breakpoint.tablet]: 'span 6' } },
  span7: { gridColumn: { default: '1 / -1', [breakpoint.tablet]: 'span 7' } },
  span8: { gridColumn: { default: '1 / -1', [breakpoint.tablet]: 'span 8' } },
  span12: { gridColumn: '1 / -1' },
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xxs,
  },
  sectionHeadRow: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
    justifyContent: 'space-between',
  },
  sectionActions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  sectionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    minWidth: 0,
  },
  closing: {
    borderTopColor: color.borderDefault,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    gridColumn: '1 / -1',
    paddingTop: space.xl,
  },
  closingActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
  },
})
