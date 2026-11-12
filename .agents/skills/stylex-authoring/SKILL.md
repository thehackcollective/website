---
name: stylex-authoring
description: StyleX 0.19 authoring guide for hack-collective (ported from cf0 through elearning and qa). Longhand properties, valid shorthands, dropped shorthands, the two token tiers, and the traps that silently produce missing CSS. Load when you write or review a .stylex.ts file, debug a missing style, or move CSS into StyleX.
---

# StyleX authoring guide (hack-collective)

This guide adapts the [official StyleX LLM authoring guide](https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md). cf0 verified the traps below against `@stylexjs/stylex@0.19.0` and `@stylexjs/unplugin@0.19.0`. This repo runs the same versions.

## Pick the token tier first

The repo has two surfaces and two token tiers (`docs/decisions/2026-11-11-two-token-tiers.md`).

| Code | Imports | Variables |
| --- | --- | --- |
| The landing (`src/features/website/`, `src/app/`) and the public-only kit files | `@/tokens/website-token-consts.stylex` | `--thc-website-*` from `src/tokens/website-tokens.css` |
| Work (`internal/`, `workers/internal/`) and the shared kit (`src/components/ui/`, `src/lib/`) | `@/tokens/token-consts.stylex` | `--thc-*` from `src/tokens/design-tokens.css`, `semantic-tokens.css` and `component-tokens.css` |

The public-only kit files are `count-up`, `dia-text`, `reveal` and `stagger-reveal` in `src/components/ui/`, and `src/lib/hairline-*`. Do not mix the tiers in one file.

## Conventions

- Use longhand properties, or a single-value shorthand, over a multi-value shorthand. Use `null` to unset a property.
- Do not write a colour literal outside `src/tokens/` (`no-hardcoded-colors`, `web-color-literal-in-token-source`). In Work and the kit, a literal size, radius, duration or shadow also fails (`no-arbitrary-stylex-value`, `web-size-literal-is-token`, `web-size-number-is-token`, `web-motion-is-token`, `web-ui-shadow-is-token`). Unitless `0` and percentages are permitted. When no token fits, add one in its tier file and its accessor in the consts module, in the change that first reads it (`web-token-used`).
- Take each scale property from its own token family:
  - `fontSize`, `lineHeight` and `letterSpacing` from `text.*`. `fontWeight` from `text.weightRegular` in Work.
  - `padding*`, `margin*`, `gap`, `rowGap` and `columnGap` from `space.*`.
  - `border*Radius` from `radius.*`: `radius.step` on a control, `radius.nest*` inside a padded container.
  - Durations and easings from `motion.*`. Shadows from `shadow.*`. Box, icon and border sizes from `layout.*`.

  A token from the wrong family is still well-typed, so the compiler cannot catch it. In Work and the kit, `no-cross-scale-token` catches it.
- Space between siblings comes from `gap`, `rowGap` or `columnGap` on a flex or grid parent, never from a margin on a child (`web-sibling-space-is-gap`). When siblings need different spaces, wrap a sub-group in an element with its own gap. Keep a margin only for `'auto'` alignment.
- `stylex.defineConsts()` and `stylex.defineVars()` live only in a `.stylex.ts` file with only named exports. Work and kit consts live only in `src/tokens/token-consts.stylex.ts` (`stylex-consts-single-module`). The landing consts live only in `src/tokens/website-token-consts.stylex.ts`. The reason:
  - StyleX resolves consts to literals at compile time.
  - So the dev server must transform the declaring module before it serves `virtual:stylex.css`.
  - A new declaring module races that order. The page then fails with a 500 and an unresolved `var(--hash)` in the generated CSS.
- Do not use `vh`. Use `dvh` (`no-vh-units`).
- Write conditions as values: `{ default: ..., '@media (min-width: ...)': ... }`. In Work, take the media query from `breakpoint.*`.
- Prefer JS state changes over `:first-child` and `:nth-child`. Prefer real HTML elements over `::before` and `::after`.

## Traps (verified against @stylexjs/babel-plugin@0.19.0)

These are real bugs that shipped in cf0. Each one silently drops CSS. You get no build error, no warning and no test failure.

### 1. `background` shorthand silently drops CSS variable tokens

The compiler cannot expand `background` with a CSS variable token, so it drops the full declaration. Always use `backgroundColor`.

```tsx
const styles = stylex.create({
  page: { backgroundColor: color.backgroundCanvas },
})
```

### 2. `borderBlockEnd` and `borderBottom` throw and are silently dropped

`borderBottom` throws "borderBottom is not supported". In dev with HMR, StyleX catches the error and drops the property. Always use the three longhands.

```tsx
const styles = stylex.create({
  section: {
    borderBottomColor: color.borderDefault,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
})
```

The kit writes a 1px border width as the literal `'1px'`.

### 3. Bare numbers are dropped or misread

Length properties read a number as pixels. Some other properties do not. Use a token accessor.

```tsx
const styles = stylex.create({
  card: { borderRadius: radius.md, minHeight: layout.rowHeight, paddingBlock: space.md },
})
```

### 4. Literal colours instead of tokens

```tsx
import { color } from '@/tokens/token-consts.stylex'

const styles = stylex.create({
  section: { backgroundColor: color.backgroundCanvas, borderColor: color.borderDefault },
})
```

In Work, the palette is private to `design-tokens.css`. Code reads the semantic `color.*` roles and the component `button.*`, `input.*` and `card.*` tokens.

### 5. `animation` shorthand with `keyframes()` objects

The babel plugin does not resolve a `stylex.keyframes()` object inside a shorthand string, so the full declaration disappears. Put the keyframes object on `animationName`, with the other longhands.

```tsx
const styles = stylex.create({
  cell: {
    animationName: pixelOn,
    animationDuration: motion.durationLoop,
    animationTimingFunction: motion.easeInOut,
    animationIterationCount: 'infinite',
  },
})
```

### 6. Valid shorthands that work

These expand correctly in StyleX 0.19:

- `borderColor`, `borderStyle`, `borderWidth` and `borderRadius` (all four sides or corners).
- `padding` and `margin`.
- `paddingBlock`, `paddingInline`, `marginBlock` and `marginInline`.

### 7. Debugging dropped styles

1. With `./c up site` (port 5173) or `./c up work` (port 5281) running, read the transformed module: `curl -s "http://localhost:5173/src/features/website/workspace/<file>.stylex.ts" | grep -A15 '<namespace>:'`.
2. If the property key is missing from the output object, StyleX dropped it.
3. Read the generated CSS: `curl -s "http://localhost:5173/virtual:stylex.css" | grep '<atomic-class>'`.
4. Replace the shorthand with its longhands. If the drop is the order trap above, move the const into the consts module of its tier.
5. Read the transformed module again. Make sure the property now generates.

## More resources

- Documentation: https://stylexjs.com
- API reference: https://stylexjs.com/docs/api
- LLM authoring guide (source): https://github.com/facebook/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md
