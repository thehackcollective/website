import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { color, layout, radius, text } from '@/tokens/token-consts.stylex'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'

export type AvatarSize = 20 | 24 | 32 | 40 | 56

const styles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: color.backgroundSunken,
    borderRadius: radius.full,
    color: color.textBody,
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: text.fontSans,
    fontWeight: text.weightRegular,
    justifyContent: 'center',
    overflow: 'hidden',
    userSelect: 'none',
  },
  anonymous: { color: color.iconSubtle },
  image: { display: 'block', height: '100%', objectFit: 'cover', width: '100%' },
  s20: {
    fontSize: text.sizeCaption,
    height: layout.avatarSizeXs,
    lineHeight: text.leadingCaption,
    width: layout.avatarSizeXs,
  },
  s24: {
    fontSize: text.sizeCaption,
    height: layout.avatarSizeSm,
    lineHeight: text.leadingCaption,
    width: layout.avatarSizeSm,
  },
  s32: {
    fontSize: text.sizeCaption,
    height: layout.avatarSizeMd,
    lineHeight: text.leadingCaption,
    width: layout.avatarSizeMd,
  },
  s40: {
    fontSize: text.sizeUi,
    height: layout.avatarSizeLg,
    lineHeight: text.leadingUi,
    width: layout.avatarSizeLg,
  },
  s56: {
    fontSize: text.sizeHeading,
    height: layout.avatarSizeXl,
    lineHeight: text.leadingHeading,
    width: layout.avatarSizeXl,
  },
})

const SIZE_STYLES: Record<AvatarSize, stylex.StyleXStyles> = {
  20: styles.s20,
  24: styles.s24,
  32: styles.s32,
  40: styles.s40,
  56: styles.s56,
}

function initials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word !== '')
  const first = words.at(0)?.charAt(0) ?? ''
  const last = words.length > 1 ? (words.at(-1)?.charAt(0) ?? '') : ''
  const letters = `${first}${last}`.toUpperCase()
  return letters === '' ? '?' : letters
}

export type AvatarKind = 'person' | 'agent' | 'anonymous'

function imageRole(decorative: boolean, label: string) {
  return decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label }
}

export function Avatar({
  name,
  src,
  size = 32,
  kind = 'person',
  decorative = false,
}: {
  name: string
  src?: string | null
  size?: AvatarSize
  kind?: AvatarKind
  decorative?: boolean
}) {
  const [failedSrc, setFailedSrc] = useState<string>()
  if (kind === 'anonymous') {
    return (
      <span
        data-slot="avatar"
        data-kind="anonymous"
        {...imageRole(decorative, name)}
        {...stylex.props(styles.root, styles.anonymous, SIZE_STYLES[size])}
      >
        <Icon icon={icons.person} size={size <= 24 ? 'sm' : 'md'} />
      </span>
    )
  }
  const showImage = typeof src === 'string' && src !== '' && src !== failedSrc
  return (
    <span
      data-slot="avatar"
      {...imageRole(decorative, name)}
      {...stylex.props(styles.root, SIZE_STYLES[size])}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailedSrc(src)}
          {...stylex.props(styles.image)}
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  )
}
