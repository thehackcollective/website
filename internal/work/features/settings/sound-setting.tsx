import { playSound, setSoundOn, useSoundOn } from '@/lib/interaction-sounds'
import { Field } from '@/ui/field'
import { Switch } from '@/ui/switch'

export function SoundSetting() {
  const sound = useSoundOn()
  return (
    <div data-coachmark="settings.sound">
      <Field
        label="Click sounds"
        htmlFor="setting-sound"
        description="A soft click plays when you press a button or a link."
        orientation="horizontal"
      >
        <Switch
          id="setting-sound"
          checked={sound}
          onCheckedChange={(next) => {
            setSoundOn(next)
            if (next) playSound('click')
          }}
        />
      </Field>
    </div>
  )
}
