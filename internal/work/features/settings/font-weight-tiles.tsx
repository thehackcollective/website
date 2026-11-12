import { settingsStyles as styles } from '@internal/work/features/settings/settings.stylex'
import * as stylex from '@stylexjs/stylex'
import { FONT_WEIGHTS, isFontWeight, setFontWeight, useFontWeight } from '@/lib/font-weight'
import { playSound } from '@/lib/interaction-sounds'
import { ChoiceCard } from '@/ui/choice-card'
import { RadioGroup } from '@/ui/radio-group'

const savedOnThisDevice = () => Promise.resolve()

export function FontWeightTiles() {
  const weight = useFontWeight()
  const choose = (next: string) => {
    if (!isFontWeight(next) || next === weight) return
    playSound('tick')
    void setFontWeight(next, savedOnThisDevice)
  }
  return (
    <div data-coachmark="settings.weight">
      <RadioGroup
        aria-label="Text weight"
        layout="cards"
        name="font-weight"
        value={weight}
        onValueChange={choose}
      >
        {FONT_WEIGHTS.map((option) => (
          <ChoiceCard
            key={option.value}
            value={option.value}
            title={
              <span data-thc-weight={option.value} {...stylex.props(styles.glyph)}>
                B
              </span>
            }
            detail={`${option.label}, ${option.value}`}
          />
        ))}
      </RadioGroup>
    </div>
  )
}
