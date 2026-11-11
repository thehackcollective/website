import * as stylex from '@stylexjs/stylex'
import { brandLockupStyles as styles } from '@/ui/brand-lockup.stylex'

export function BrandLockup() {
  return (
    <span role="img" aria-label="The Hack Collective" {...stylex.props(styles.root)}>
      <img src="/brand/icon.svg" alt="" width={512} height={512} {...stylex.props(styles.mark)} />
      <span aria-hidden>The Hack Collective</span>
    </span>
  )
}
