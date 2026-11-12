export const LINKS = {
  whatsapp: 'https://chat.whatsapp.com/EWCPnquUzXD9uppsSuQFVk',
  luma: 'https://luma.com/thehackcollective',
  email: 'mailto:thehackcollective@gmail.com',
}

export interface HackEvent {
  name: string
  date: string
  place: string
  about: string
  role: string
  href: string
}

export const UPCOMING_EVENTS: readonly HackEvent[] = [
  {
    name: 'Imperial BioHack x Anthropic',
    date: '28–29 Nov 2026',
    place: 'City & Guilds Building, South Kensington',
    about: '120 builders hack for 48 hours on industry-led tracks, supported by Claude.',
    role: 'Louis Le of The Hack Collective co-hosts.',
    href: 'https://luma.com/m21rdpv1',
  },
  {
    name: 'ALFRD Hackathon: Building the financial infrastructure of tomorrow',
    date: '5 Dec 2026',
    place: 'Central London, with the University of Westminster',
    about:
      'A curated room of builders, designers and finance minds, where every application is reviewed.',
    role: 'The Hack Collective co-hosts with ALFRD.',
    href: 'https://luma.com/jl7wx52x',
  },
]

export const PAST_EVENTS: readonly HackEvent[] = [
  {
    name: 'Grok Bot Community Engineering London Hackathon',
    date: '22 Oct 2026',
    place: 'Hammersmith',
    about:
      'An evening hackathon where Grok Bot held the community context and Cursor turned it into code.',
    role: 'The Hack Collective was a community partner with its own track.',
    href: 'https://luma.com/eveur09a',
  },
]

export const STATS = [
  { value: '1,100+', label: 'Members' },
  { value: '450+', label: 'Luma calendar subscribers' },
  { value: '#2', label: 'On Google when searching for Hackathons in London' },
  { value: '2026', label: 'UCL Campaign of the Year nominee' },
]
