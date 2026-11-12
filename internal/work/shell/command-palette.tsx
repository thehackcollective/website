import { useSignOut } from '@internal/work/features/auth'
import { paletteStyles as styles } from '@internal/work/shell/command-palette.stylex'
import { accountItems, type NavItem, railItems } from '@internal/work/shell/nav-items'
import {
  openPalette,
  paletteSnapshot,
  setPaletteOpen,
  subscribePalette,
} from '@internal/work/shell/palette-state'
import * as stylex from '@stylexjs/stylex'
import { type RefObject, useRef, useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { copyText } from '@/lib/hooks/use-copied'
import { setSoundOn, useSoundOn } from '@/lib/interaction-sounds'
import { useMountEffect } from '@/lib/use-mount-effect'
import { Button } from '@/ui/button'
import { Command, type CommandItem, type CommandView } from '@/ui/command'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/ui/dialog'
import { Icon } from '@/ui/icon'
import { icons } from '@/ui/icons'
import { Kbd } from '@/ui/kbd'
import type { AxisDirection } from '@/ui/shared-axis'

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

function isShortcut(event: globalThis.KeyboardEvent): boolean {
  if (event.altKey || event.defaultPrevented) return false
  if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) return true
  return event.key === '/' && !event.metaKey && !event.ctrlKey && !isTyping(event.target)
}

const matches = (title: string, query: string) =>
  title.toLowerCase().includes(query.trim().toLowerCase())

const rootView = 'root'
const paletteLabel = 'Search pages and commands'

function usePaletteViews({
  query,
  done,
  push,
}: {
  query: string
  done: () => void
  push: (view: string) => void
}): (view: string, live: boolean) => CommandView {
  const navigate = useNavigate()
  const signOut = useSignOut()
  const sound = useSoundOn()
  const go = (to: string) => {
    done()
    void navigate(to)
  }
  const pageItem = (item: NavItem): CommandItem => ({
    key: `page:${item.id}`,
    icon: item.icon,
    title: item.label,
    run: () => go(item.to),
  })
  const pages = [...railItems, ...accountItems].map(pageItem)
  const commands: CommandItem[] = [
    {
      key: 'cmd:copy',
      icon: icons.copy,
      title: 'Copy link to this page',
      run: () => {
        done()
        void copyText(window.location.href).then((copied) =>
          copied ? toast.success('Link copied') : toast.error('Could not copy the link.'),
        )
      },
    },
    {
      key: 'cmd:sound',
      icon: sound ? icons.soundOff : icons.soundOn,
      title: sound ? 'Mute click sounds' : 'Turn on click sounds',
      run: () => {
        done()
        setSoundOn(!sound)
      },
    },
    {
      key: 'cmd:sign-out',
      icon: icons.signOut,
      title: 'Sign out',
      run: () => {
        done()
        signOut()
      },
    },
  ]

  return (view, live) => {
    const trimmed = live ? query.trim() : ''
    const only = (items: readonly CommandItem[]) => [
      { items: items.filter((item) => matches(item.title, trimmed)) },
    ]
    if (view === 'pages')
      return { title: 'Pages', placeholder: 'Search pages', groups: only(pages) }
    if (view === 'account')
      return { title: 'Account', placeholder: 'Search account', groups: only(commands) }
    if (trimmed !== '')
      return {
        placeholder: paletteLabel,
        groups: [
          { label: 'Pages', items: pages.filter((item) => matches(item.title, trimmed)) },
          { label: 'Commands', items: commands.filter((item) => matches(item.title, trimmed)) },
        ],
      }
    return {
      placeholder: paletteLabel,
      groups: [
        {
          items: [
            {
              key: 'view:pages',
              icon: icons.listView,
              title: 'Pages',
              detail: `${pages.length}`,
              drill: true,
              run: () => push('pages'),
            },
            {
              key: 'view:account',
              icon: icons.account,
              title: 'Account',
              drill: true,
              run: () => push('account'),
            },
          ],
        },
      ],
    }
  }
}

function PalettePanel({
  done,
  inputRef,
}: {
  done: () => void
  inputRef: RefObject<HTMLInputElement | null>
}) {
  const [query, setQuery] = useState('')
  const [path, setPath] = useState<readonly string[]>([rootView])
  const [direction, setDirection] = useState<AxisDirection>('forward')
  const move = (next: readonly string[], to: AxisDirection) => {
    setPath(next)
    setDirection(to)
    setQuery('')
    inputRef.current?.focus()
  }
  const deep = path.length > 1
  const back = deep ? () => move(path.slice(0, -1), 'back') : undefined
  const resolve = usePaletteViews({
    query,
    done,
    push: (view) => move([...path, view], 'forward'),
  })

  return (
    <>
      <DialogTitle style={styles.srOnly}>{paletteLabel}</DialogTitle>
      <Command
        label={paletteLabel}
        query={query}
        onQueryChange={setQuery}
        view={path.at(-1) ?? rootView}
        direction={direction}
        resolve={resolve}
        onBack={back}
        inputRef={inputRef}
        action={
          <DialogClose render={<Button size="iconTouch" variant="ghost" aria-label="Close" />}>
            <Icon icon={icons.close} />
          </DialogClose>
        }
      />
      <div aria-hidden {...stylex.props(styles.keys)}>
        <span {...stylex.props(styles.key)}>
          <Kbd icon={icons.keyUp} />
          <Kbd icon={icons.keyDown} />
          to move
        </span>
        <span {...stylex.props(styles.key)}>
          <Kbd icon={icons.enterKey} />
          to open
        </span>
        {deep ? (
          <span {...stylex.props(styles.key)}>
            <Kbd icon={icons.keyLeft} />
            <Kbd>Esc</Kbd>
            back
          </span>
        ) : (
          <span {...stylex.props(styles.key)}>
            <Kbd>Esc</Kbd>
            to close
          </span>
        )}
      </div>
    </>
  )
}

export function CommandPalette() {
  const { open, session } = useSyncExternalStore(subscribePalette, paletteSnapshot)
  const inputRef = useRef<HTMLInputElement>(null)

  useMountEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (!isShortcut(event)) return
      event.preventDefault()
      openPalette()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      setPaletteOpen(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={setPaletteOpen}>
      <DialogContent variant="palette" showCloseButton={false} initialFocus={inputRef}>
        <PalettePanel key={session} inputRef={inputRef} done={() => setPaletteOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function PaletteHint() {
  const mac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
  return (
    <span aria-hidden {...stylex.props(styles.key)}>
      {mac ? <Kbd icon={icons.commandKey} /> : <Kbd>Ctrl</Kbd>}
      <Kbd>K</Kbd>
    </span>
  )
}
