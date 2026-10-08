# Rules

Stable-ID index. `lint` means `ast-grep scan` (rules in `sg-rules/`) or ESLint/tsc catches it mechanically; `prose` means an agent must check it.

| ID | Rule | Enforced by | Source |
|---|---|---|---|
| rule/no-hardcoded-colors | No hex or rgb in components; use `color.*` tokens. | lint `no-hardcoded-colors` | AGENTS.md |
| rule/no-inline-style | No `style={{}}`; the nav SVG filter def is the one exception. | lint `no-inline-style` | AGENTS.md |
| rule/no-tailwind | No utility classes; StyleX only. | lint `no-tailwind-in-components` | AGENTS.md |
| rule/no-vh | `dvh`, never `vh`. | lint `no-vh-units` | AGENTS.md |
| rule/no-use-effect | `useMountEffect` from `@/lib/use-mount-effect`, never `useEffect`. | lint `no-use-effect` | sg-rules |
| rule/no-comments | No code comments. | lint `no-comments` | sg-rules |
| rule/no-default-export | Named exports only. | lint `no-default-export` | sg-rules |
| rule/imports | `@/` alias only; no relative imports; features import `components/ui` only via `@/ui/*`; no deep imports across features. | lint `no-relative-imports`, `no-ui-imports-features`, `no-feature-deep-imports` | sg-rules |
| rule/no-assertions | No `as` (except `as const`), no `!`. | lint `no-type-assertion`, `no-non-null-assertion` | sg-rules |
| rule/stable-keys | No array index as React key. | lint `no-index-key` | sg-rules |
| rule/longhand | Longhand StyleX properties (`paddingBlock`/`paddingInline`, `borderWidth`/`Style`/`Color`). | prose | AGENTS.md |
| rule/one-h1 | Exactly one `h1`; every section heading is `h2`; no `h3+`. | prose | AGENTS.md, DESIGN.md |
| rule/one-sentence | Every paragraph is one sentence. | prose | AGENTS.md, DESIGN.md |
| rule/facts | Every number and name traces to AGENTS.md or `content.ts`. | prose | AGENTS.md |
| rule/blue-scope | Blue only on the mark, primary action, hover underline, focus ring. | prose | DESIGN.md |
| rule/type-roles | Font sizes and weights only from the `text.*` tokens and `page-shell` recipes. | prose | DESIGN.md |
| rule/logo-files | Logo only from `public/brand/`; edit the SVG masters there and regenerate the PNG/WebP twins from them. | prose | DESIGN.md |
| rule/logo-fills | Approved fills only: blue on light, white on dark or on blue, black for one-colour print. | prose | DESIGN.md |
| rule/reduced-motion | Every animation collapses to static under `prefers-reduced-motion`. | prose | DESIGN.md |
| rule/primary-action | One primary action per viewport: follow the Luma calendar; WhatsApp is the secondary. | prose | DESIGN.md |

Run `ast-grep scan` and `bun run lint` before claiming compliance with the lint rows.
