# AGENTS.md — hack-collective

Landing page for The Hack Collective (hackcollective.uk), a London hackathon
community. Deployed on Cloudflare Workers (assets-only) via Wrangler.

## Stack

- Vite 8 + React 19 + TypeScript 5 + react-router (SPA)
- StyleX 0.19 via @stylexjs/unplugin. No Tailwind, no inline styles.
- Geist / Geist Mono via Google Fonts <link> tags in index.html
- motion + motion-plus for the hero stagger reveal; lenis for smooth scroll
- Bun 1.4 (packageManager field), isolated linker (bunfig.toml)
- Light mode only. Red accent #ef4444, near-white canvas, rail layout with
  1px hairline borders.

## Commands

```bash
bun install
bun run dev         # Vite dev server
bun run build       # production build to dist/
bun run typecheck   # tsc --noEmit
bun run lint        # eslint
bun run deploy      # build + wrangler deploy
ast-grep scan       # design system lint rules (sg-rules/)
```

## StyleX rules

- Use tokens from `src/tokens/token-consts.stylex.ts` only. Never hardcode
  colors or raw hex values in components.
- All styles via `stylex.create` + `stylex.props`. No Tailwind classes, no
  inline `style={{}}` (except the nav SVG filter def).
- Longhand properties only (borderWidth/Style/Color, paddingBlock/Inline).
- Conditions as values: `{ default: ..., '@media (min-width: ...)': ... }`.
- Numbers are px. Never use `vh`; use `dvh`.
- CSS custom properties use the `--thc-*` namespace.

## Copy rules

- Every paragraph is one sentence.
- Exactly one h1 on the page; all other section headings are h2. No h3+.

## Content source of truth

Facts (use verbatim, do not invent claims):

- London's hackathon community. 1,000+ builders, one WhatsApp group, every
  London hackathon on one calendar.
- Founded in London in September 2025 by UCL students, run on WhatsApp and
  Luma.
- Stats: 1,000+ members; 400+ Luma calendar subscribers; #2 on Google for
  London Hackathons; 2026 UCL Campaign of the Year nominee.
- Next event: Grok Bot Community Engineering London Hackathon, Thu 22 Oct
  2026, London, 6:00 PM to 10:30 PM, presented by SpaceXAI with Cursor.
  Solo or teams of up to 3, top 5 demo live for 3 minutes each, venue TBA.
- Partners: Kickstart Global; Hacker's Unity; HackEurope; FINEDA; SpaceXAI;
  Cursor.
- Links live in `src/content.ts`: WhatsApp
  chat.whatsapp.com/EWCPnquUzXD9uppsSuQFVk, Luma luma.com/thehackcollective,
  hack Luma luma.com/eveur09a, email lelouis.lnv@gmail.com.
