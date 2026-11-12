import { showcaseStyles as styles } from '@internal/work/features/design/showcase.stylex'
import * as stylex from '@stylexjs/stylex'
import { AnimatePresence } from 'motion/react'
import { Fragment, useState } from 'react'
import { useUndoWindow } from '@/lib/hooks/use-undo-window'
import { Button, type ButtonVariant } from '@/ui/button'
import { HoldButton } from '@/ui/hold-button'
import { Icon } from '@/ui/icon'
import { IconButton } from '@/ui/icon-button'
import { icons } from '@/ui/icons'
import { Section } from '@/ui/page'
import { Pressable } from '@/ui/pressable'
import { SizeProvider } from '@/ui/size-provider'
import { UndoPill } from '@/ui/undo-pill'

const variants: readonly ButtonVariant[] = [
  'primary',
  'strong',
  'secondary',
  'outline',
  'ghost',
  'quiet',
  'destructive',
  'destructiveGhost',
  'link',
]

function ButtonStates() {
  return (
    <Section heading="Buttons" caption="Rest, disabled and loading for each variant">
      <div data-coachmark="design.buttons" {...stylex.props(styles.grid)}>
        {variants.map((variant) => (
          <Fragment key={variant}>
            <Button variant={variant}>{variant}</Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
            <Button variant={variant} loading>
              Save changes
            </Button>
          </Fragment>
        ))}
      </div>
    </Section>
  )
}

export function ShowcaseActions() {
  const [log, setLog] = useState('No action yet')
  const [pressed, setPressed] = useState(false)
  const [plainPressed, setPlainPressed] = useState(false)
  const undoWindow = useUndoWindow<string>()

  return (
    <>
      <ButtonStates />
      <Section heading="Actions" caption={log}>
        <div {...stylex.props(styles.row)}>
          <IconButton
            label="More actions"
            icon={<Icon icon={icons.more} />}
            onClick={() => setLog('Icon button pressed')}
          />
          <IconButton label="More actions, disabled" icon={<Icon icon={icons.more} />} disabled />
          <HoldButton onConfirm={() => setLog('Hold confirmed')}>
            <Icon icon={icons.delete} size="sm" />
            Hold to delete
          </HoldButton>
          <SizeProvider size="compact">
            <HoldButton onConfirm={() => setLog('Compact hold confirmed')}>
              Hold, compact
            </HoldButton>
          </SizeProvider>
          <Button
            variant="outline"
            onClick={() => undoWindow.begin('Member archived', () => setLog('Archive committed'))}
          >
            Archive with undo
          </Button>
          <Button variant="secondary" pressed={pressed} onClick={() => setPressed((on) => !on)}>
            Pressed action
          </Button>
          <Button
            variant="ghost"
            pressed={plainPressed}
            pressedAppearance="plain"
            onClick={() => setPlainPressed((on) => !on)}
          >
            Plain pressed action
          </Button>
          <Pressable surface="row" onClick={() => setLog('Row pressed')}>
            Pressable row
          </Pressable>
        </div>
        <AnimatePresence>
          {undoWindow.pending !== null && (
            <UndoPill
              key="undo"
              label={undoWindow.pending}
              onUndo={() => {
                undoWindow.undo()
                setLog('Archive undone')
              }}
              progress={undoWindow.progress}
            />
          )}
        </AnimatePresence>
      </Section>
    </>
  )
}
