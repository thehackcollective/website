import type { CoachmarkPages } from '@/ui/coachmark'

export const COACHMARKS: CoachmarkPages = {
  settings: [
    {
      anchor: 'settings.weight',
      title: 'Choose your text weight',
      body: 'Each B shows a weight, and the whole app switches the moment you pick one.',
    },
    {
      anchor: 'settings.sound',
      title: 'Mute the clicks',
      body: 'Turn the click sounds off here or from the speaker button in the sidebar.',
    },
  ],
}
