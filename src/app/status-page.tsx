import * as stylex from '@stylexjs/stylex'
import { Link } from 'react-router'

import { color, space, text } from '@/tokens/website-token-consts.stylex'

const styles = stylex.create({
  page: {
    alignItems: 'center',
    backgroundColor: color.canvas,
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    justifyContent: 'center',
    minHeight: '100dvh',
  },
  heading: {
    color: color.ink,
    fontFamily: text.fontSans,
    fontSize: text.sizeDisplaySm,
  },
  link: {
    color: color.primaryActive,
    fontFamily: text.fontSans,
    fontSize: text.sizeBodyLg,
  },
})

export function StatusPage({ title, reload = false }: { title: string; reload?: boolean }) {
  return (
    <main {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.heading)}>{title}</h1>
      {reload ? (
        <a href="/" {...stylex.props(styles.link)}>
          Reload the homepage
        </a>
      ) : (
        <Link to="/" {...stylex.props(styles.link)}>
          Back to the homepage
        </Link>
      )}
    </main>
  )
}
