import { FontWeightTiles } from '@internal/work/features/settings/font-weight-tiles'
import { SoundSetting } from '@internal/work/features/settings/sound-setting'
import { Page as PageFrame, Section } from '@/ui/page'
import { PageHeader } from '@/ui/page-header'

export function Page() {
  return (
    <PageFrame>
      <PageHeader title="Settings" />
      <Section heading="Text weight" caption="Pick the weight that reads best on your screen.">
        <FontWeightTiles />
      </Section>
      <Section heading="Sound">
        <SoundSetting />
      </Section>
    </PageFrame>
  )
}
