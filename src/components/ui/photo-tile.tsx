import type { IconSvgElement } from '@hugeicons/react'
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { color, layout, radius } from '@/tokens/token-consts.stylex'
import { Icon } from '@/ui/icon'

export type PhotoTileSize = 'sm' | 'md' | 'lg'

const styles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: color.backgroundSunken,
    color: color.iconSubtle,
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sm: { borderRadius: radius.sm, width: layout.photoTileSm },
  md: { borderRadius: radius.md, width: '72px' },
  lg: { borderRadius: radius.lg, width: '100%' },
  square: { aspectRatio: '1 / 1' },
  wide: { aspectRatio: '4 / 3' },
  image: {
    display: 'block',
    height: '100%',
    inset: 0,
    objectFit: 'cover',
    position: 'absolute',
    width: '100%',
  },
})

export function PhotoTile({
  src,
  alt,
  size,
  fallbackIcon,
  ratio = 'square',
}: {
  src?: string
  alt: string
  size: PhotoTileSize
  fallbackIcon: IconSvgElement
  ratio?: 'square' | 'wide'
}) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const showImage = src !== undefined && src !== '' && src !== failedSrc
  return (
    <span
      data-slot="photo-tile"
      {...stylex.props(styles.root, styles[size], ratio === 'wide' ? styles.wide : styles.square)}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          {...stylex.props(styles.image)}
        />
      ) : (
        <Icon icon={fallbackIcon} size={size} label={alt} />
      )}
    </span>
  )
}
