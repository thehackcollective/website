import * as stylex from '@stylexjs/stylex'

import { color, layout, space, text } from '@/tokens/token-consts.stylex'

export const commandStyles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  searchRow: {
    flexShrink: 0,
    paddingBlock: space.xxs,
    paddingInline: space.xxs,
  },
  results: {
    borderTopColor: color.borderDefault,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  pane: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 1,
    gap: space.sm,
    minHeight: 0,
    overflowY: 'auto',
    padding: space.xs,
  },
  header: {
    alignItems: 'center',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
  },
  headerBack: { justifySelf: 'start' },
  headerTitle: {
    color: color.textDefault,
    fontSize: text.sizeUi,
    fontWeight: text.weightMedium,
    lineHeight: text.leadingUi,
  },
  trail: {
    color: color.iconSubtle,
    display: 'inline-flex',
    flexShrink: 0,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: space['3xs'],
  },
  groupHeading: {
    color: color.textSubtle,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
    paddingBlock: space.xxs,
    paddingInline: space.xs,
  },
  item: {
    gap: space.xs,
    minHeight: layout.rowHeight,
    paddingBlock: 0,
    paddingInline: space.xs,
  },
  itemActive: {
    backgroundColor: color.backgroundNeutral,
    color: color.textDefault,
  },
  itemLabel: {
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemDetail: {
    color: color.textSubtle,
    flexShrink: 0,
    fontSize: text.sizeCaption,
    lineHeight: text.leadingCaption,
  },
  empty: {
    color: color.textSubtle,
    fontSize: text.sizeUi,
    lineHeight: text.leadingUi,
    margin: 0,
    paddingBlock: space.sm,
    paddingInline: space.xs,
  },
})
