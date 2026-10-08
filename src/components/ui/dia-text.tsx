import { animate, inView } from "motion";
import { splitText } from "motion-plus";
import * as stylex from "@stylexjs/stylex";
import { useMountEffect } from "@/lib/use-mount-effect";
import { color, dia } from "@/tokens/token-consts.stylex";

import { createElement, useRef, type ReactElement } from "react";

export const LINE_CLASS = "stagger-line";
const WORD_CLASS = "stagger-word";
const CHAR_CLASS = "stagger-char";

const DIA_SWEEP_DURATION = 2.2;
export const DIA_FOLLOWER_DELAY = 1.5;

const diaSweepEase = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

const styles = stylex.create({
  hidden: {
    visibility: "hidden",
  },
  diaChar: {
    backgroundClip: "text",
    backgroundImage: {
      default: `linear-gradient(90deg, ${color.ink} 0%, ${color.ink} calc(var(--thc-dia-pos) - 17%), ${dia.c1} calc(var(--thc-dia-pos) - 17%), ${dia.c2} calc(var(--thc-dia-pos) - 8.5%), ${dia.c3} var(--thc-dia-pos), ${dia.c4} calc(var(--thc-dia-pos) + 8.5%), ${dia.c5} calc(var(--thc-dia-pos) + 17%), transparent calc(var(--thc-dia-pos) + 17%), transparent 100%)`,
      ":hover": `linear-gradient(90deg, ${dia.c1} 0%, ${dia.c2} 25%, ${dia.c3} 50%, ${dia.c4} 75%, ${dia.c5} 100%)`,
    },
    backgroundPosition: {
      default: "var(--thc-dia-x) 0",
      ":hover": "0 0",
    },
    backgroundRepeat: "no-repeat",
    backgroundSize: {
      default: "var(--thc-dia-width) 100%",
      ":hover": "100% 100%",
    },
    color: "transparent",
    display: "inline-block",
    WebkitBackgroundClip: "text",
  },
  diaCharDone: {
    backgroundClip: "text",
    backgroundImage: {
      default: `linear-gradient(90deg, ${color.ink}, ${color.ink})`,
      ":hover": `linear-gradient(90deg, ${dia.c1} 0%, ${dia.c2} 25%, ${dia.c3} 50%, ${dia.c4} 75%, ${dia.c5} 100%)`,
    },
    color: "transparent",
    display: "inline-block",
    WebkitBackgroundClip: "text",
  },
});

const classTokens = (className: string | undefined): string[] =>
  (className ?? "").split(/\s+/).filter(Boolean);

export function splitDiaHeadline(el: HTMLElement): {
  lines: HTMLElement[];
  chars: HTMLElement[];
} {
  const original = el.getAttribute("aria-label") ?? el.textContent ?? "";
  el.textContent = original;

  const { lines } = splitText(el, {
    lineClass: LINE_CLASS,
    wordClass: WORD_CLASS,
    charClass: CHAR_CLASS,
  });

  lines.forEach((line) => {
    line.style.display = "block";
    line
      .querySelectorAll<HTMLElement>(`.${WORD_CLASS}`)
      .forEach((word) => {
        word.style.display = "inline-block";
      });
  });

  const chars = Array.from(
    el.querySelectorAll<HTMLElement>(`.${CHAR_CLASS}`),
  );

  return { lines, chars };
}

export function armDiaSweep(el: HTMLElement, lines: HTMLElement[]): void {
  const charOffsets: Array<{ char: HTMLElement; x: number }> = [];
  let stripWidth = 0;
  lines.forEach((line) => {
    const lineRect = line.getBoundingClientRect();
    const lineOffset = stripWidth;
    line
      .querySelectorAll<HTMLElement>(`.${CHAR_CLASS}`)
      .forEach((char) => {
        charOffsets.push({
          char,
          x: -(
            lineOffset +
            (char.getBoundingClientRect().left - lineRect.left)
          ),
        });
      });
    stripWidth += lineRect.width;
  });
  el.style.setProperty("--thc-dia-width", `${stripWidth}px`);
  el.style.setProperty("--thc-dia-pos", "-17%");
  const diaCharClasses = classTokens(
    stylex.props(styles.diaChar)?.className,
  );
  charOffsets.forEach(({ char, x }) => {
    char.style.setProperty("--thc-dia-x", `${x}px`);
    char.classList.add(...diaCharClasses);
  });
}

export function finishDia(chars: HTMLElement[]): void {
  const diaCharClasses = classTokens(
    stylex.props(styles.diaChar)?.className,
  );
  const diaCharDoneClasses = classTokens(
    stylex.props(styles.diaCharDone)?.className,
  );
  chars.forEach((char) => {
    char.classList.remove(...diaCharClasses);
    char.classList.add(...diaCharDoneClasses);
  });
}

export function playDiaSweep(
  el: HTMLElement,
  chars: HTMLElement[],
): ReturnType<typeof animate> {
  return animate(-17, 117, {
    duration: DIA_SWEEP_DURATION,
    ease: diaSweepEase,
    onUpdate: (value) => {
      el.style.setProperty("--thc-dia-pos", `${value}%`);
    },
    onComplete: () => finishDia(chars),
  });
}

export interface DiaHeadingProps {
  children: string;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

export function DiaHeading({
  children,
  as = "h2",
  id,
  className,
}: DiaHeadingProps): ReactElement {
  const ref = useRef<HTMLElement | null>(null);

  useMountEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let stopInView: (() => void) | undefined;
    let controls: ReturnType<typeof animate> | undefined;

    void (async () => {
      try {
        await document.fonts?.ready;
        if (cancelled || ref.current !== el) return;

        const { lines, chars } = splitDiaHeadline(el);

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reduceMotion) {
          finishDia(chars);
          return;
        }

        armDiaSweep(el, lines);

        stopInView = inView(
          el,
          () => {
            armDiaSweep(el, lines);
            controls = playDiaSweep(el, chars);
            stopInView?.();
          },
          { amount: 0.3 },
        );
      } catch {
        stopInView?.();
        controls?.stop();
      } finally {
        if (!cancelled && ref.current === el) {
          el.classList.remove(
            ...classTokens(stylex.props(styles.hidden)?.className),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      stopInView?.();
      controls?.stop();
    };
  });

  return createElement(
    as,
    {
      ref,
      id,
      "aria-label": children,
      className: [
        stylex.props(styles.hidden)?.className ?? "",
        className ?? "",
      ].join(" "),
    },
    children,
  );
}
