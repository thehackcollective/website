import * as stylex from '@stylexjs/stylex'
import { breakpoint, color, dia } from '@/tokens/website-token-consts.stylex'

export const diaStyles = stylex.create({
  hidden: {
    visibility: 'hidden',
  },
  diaChar: {
    backgroundClip: 'text',
    backgroundImage: {
      default: `linear-gradient(90deg, ${color.ink} 0%, ${color.ink} calc(var(--thc-dia-pos) - 17%), ${dia.c1} calc(var(--thc-dia-pos) - 17%), ${dia.c2} calc(var(--thc-dia-pos) - 8.5%), ${dia.c3} var(--thc-dia-pos), ${dia.c4} calc(var(--thc-dia-pos) + 8.5%), ${dia.c5} calc(var(--thc-dia-pos) + 17%), transparent calc(var(--thc-dia-pos) + 17%), transparent 100%)`,
      ':hover': {
        [breakpoint.hover]: `linear-gradient(90deg, ${dia.c1} 0%, ${dia.c2} 25%, ${dia.c3} 50%, ${dia.c4} 75%, ${dia.c5} 100%)`,
      },
    },
    backgroundPosition: {
      default: 'var(--thc-dia-x) 0',
      ':hover': { [breakpoint.hover]: '0 0' },
    },
    backgroundRepeat: 'no-repeat',
    backgroundSize: {
      default: 'var(--thc-dia-width) 100%',
      ':hover': { [breakpoint.hover]: '100% 100%' },
    },
    color: 'transparent',
    display: 'inline-block',
    WebkitBackgroundClip: 'text',
  },
  diaCharDone: {
    backgroundClip: 'text',
    backgroundImage: {
      default: `linear-gradient(90deg, ${color.ink}, ${color.ink})`,
      ':hover': {
        [breakpoint.hover]: `linear-gradient(90deg, ${dia.c1} 0%, ${dia.c2} 25%, ${dia.c3} 50%, ${dia.c4} 75%, ${dia.c5} 100%)`,
      },
    },
    color: 'transparent',
    display: 'inline-block',
    WebkitBackgroundClip: 'text',
  },
})
