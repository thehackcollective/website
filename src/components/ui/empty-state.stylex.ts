import * as stylex from '@stylexjs/stylex'
import { color, layout, radius, space, text } from '@/tokens/token-consts.stylex'

export const emptyStateStyles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    marginInline: 'auto',
    maxWidth: layout.emptyMaxWidth,
    minWidth: 0,
    paddingBlock: space.xl,
    textAlign: 'center',
    width: '100%',
  },
  compact: {
    gap: space.xs,
    paddingBlock: space.md,
  },
  surface: {
    backgroundColor: color.backgroundSurface,
    borderColor: color.borderDefault,
    borderRadius: radius.lg,
    borderStyle: 'solid',
    borderWidth: '1px',
    justifyContent: 'center',
    maxWidth: 'none',
    minHeight: layout.figureLg,
    paddingInline: space.lg,
  },
  iconTile: {
    alignItems: 'center',
    backgroundColor: color.backgroundSunken,
    borderRadius: radius.lg,
    color: color.iconDefault,
    display: 'inline-flex',
    height: layout.emptyIconTile,
    justifyContent: 'center',
    width: layout.emptyIconTile,
  },
  iconTileError: {
    backgroundColor: color.backgroundDangerSubtle,
    color: color.textDanger,
  },
  iconTileClear: {
    backgroundColor: color.backgroundSuccessSubtle,
    color: color.iconSuccess,
  },
  iconTileCompact: {
    borderRadius: radius.md,
    height: layout.avatarSizeLg,
    width: layout.avatarSizeLg,
  },
  text: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: space['2xs'],
    width: '100%',
  },
  title: {
    color: color.textDefault,
    fontSize: text.sizeUi,
    fontWeight: text.weightSemibold,
    lineHeight: text.leadingUi,
    margin: 0,
    overflowWrap: 'anywhere',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.xs,
    justifyContent: 'center',
  },
})
