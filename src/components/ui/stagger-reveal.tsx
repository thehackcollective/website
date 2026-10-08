import { animate } from "motion";
import { splitText } from "motion-plus";
import * as stylex from "@stylexjs/stylex";
import { useMountEffect } from "@/lib/use-mount-effect";
import { color, motion } from "@/tokens/token-consts.stylex";

import {
  createElement,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";

const LINE_CLASS = "stagger-line";
const WORD_CLASS = "stagger-word";
const CHAR_CLASS = "stagger-char";
const HEADLINE_ATTR = "data-stagger-headline";
const ITEM_ATTR = "data-stagger-item";

const ENTER_BLUR_FROM = "blur(4px)";
const ENTER_BLUR_TO = "blur(0px)";

const UI_TRANSITION = { stiffness: 305, damping: 33 };
const STAGGER_BASE = 0.08;
const TRAVEL_ENTER = 24;
const DIA_SWEEP_DURATION = 1.5;
const DIA_FOLLOWER_DELAY = 0.9;

const diaSweepEase = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

const styles = stylex.create({
  hidden: {
    visibility: "hidden",
  },
  diaChar: {
    backgroundClip: "text",
    backgroundImage: `linear-gradient(90deg, ${color.ink} 0%, ${color.ink} calc(var(--thc-dia-pos) - 17%), ${color.primaryDeep} calc(var(--thc-dia-pos) - 12%), ${color.primary} calc(var(--thc-dia-pos) - 3%), ${color.primaryActive} calc(var(--thc-dia-pos) + 6%), ${color.primaryTint} calc(var(--thc-dia-pos) + 14%), transparent calc(var(--thc-dia-pos) + 17%), transparent 100%)`,
    backgroundPosition: "var(--thc-dia-x) 0",
    backgroundRepeat: "no-repeat",
    backgroundSize: "var(--thc-dia-width) 100%",
    color: { default: "transparent", ":hover": color.primary },
    display: "inline-block",
    transitionDuration: motion.durationFast,
    transitionProperty: "color",
    WebkitBackgroundClip: "text",
  },
  diaCharDone: {
    color: { default: color.ink, ":hover": color.primary },
    display: "inline-block",
    transitionDuration: motion.durationFast,
    transitionProperty: "color",
  },
});

export type StaggerRevealTag = "div" | "section" | "header" | "article";

export interface StaggerRevealProps {
  children: ReactNode;
  as?: StaggerRevealTag;
  id?: string;
  className?: string;
}

export function useStaggerReveal(): {
  ref: RefObject<HTMLElement | null>;
} {
  const ref = useRef<HTMLElement | null>(null);

  useMountEffect(() => {
    const container = ref.current;
    if (!container) return;
    const headlineEl = container.querySelector<HTMLElement>(
      `[${HEADLINE_ATTR}]`,
    );
    if (!headlineEl) {
      container.style.visibility = "visible";
      return;
    }

    const animations: Array<ReturnType<typeof animate>> = [];
    let cancelled = false;

    void (async () => {
      try {
        await document.fonts?.ready;
        if (cancelled || ref.current !== container) return;

        const original =
          headlineEl.getAttribute("aria-label") ?? headlineEl.textContent ?? "";
        headlineEl.textContent = original;

        const { lines } = splitText(headlineEl, {
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
          headlineEl.querySelectorAll<HTMLElement>(`.${CHAR_CLASS}`),
        );

        const followers = Array.from(
          container.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`),
        );

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        const diaCharClasses = (
          stylex.props(styles.diaChar)?.className ?? ""
        )
          .split(/\s+/)
          .filter(Boolean);
        const diaCharDoneClasses = (
          stylex.props(styles.diaCharDone)?.className ?? ""
        )
          .split(/\s+/)
          .filter(Boolean);

        if (reduceMotion) {
          chars.forEach((char) => char.classList.add(...diaCharDoneClasses));
          return;
        }

        const headRect = headlineEl.getBoundingClientRect();
        const charOffsets = chars.map(
          (char) => headRect.left - char.getBoundingClientRect().left,
        );
        headlineEl.style.setProperty("--thc-dia-width", `${headRect.width}px`);
        headlineEl.style.setProperty("--thc-dia-pos", "-17%");
        chars.forEach((char, index) => {
          char.style.setProperty("--thc-dia-x", `${charOffsets[index]}px`);
          char.classList.add(...diaCharClasses);
        });

        animations.push(
          animate(-17, 117, {
            duration: DIA_SWEEP_DURATION,
            ease: diaSweepEase,
            onUpdate: (value) => {
              headlineEl.style.setProperty("--thc-dia-pos", `${value}%`);
            },
            onComplete: () => {
              if (cancelled || ref.current !== container) return;
              chars.forEach((char) => {
                char.classList.remove(...diaCharClasses);
                char.classList.add(...diaCharDoneClasses);
              });
            },
          }),
        );

        let delay = DIA_FOLLOWER_DELAY;

        const followerTransition = {
          ...UI_TRANSITION,
          stiffness: UI_TRANSITION.stiffness / 1.25 ** 2,
          damping: UI_TRANSITION.damping / 1.25,
        };

        followers.forEach((el) => {
          animations.push(
            animate(
              el,
              {
                opacity: [0, 1],
                transform: [
                  `translateY(${TRAVEL_ENTER}px)`,
                  "translateY(0px)",
                ],
                filter: [ENTER_BLUR_FROM, ENTER_BLUR_TO],
              },
              {
                ...followerTransition,
                delay,
                opacity: { ease: "easeIn" as const },
              },
            ),
          );
          delay += STAGGER_BASE;
        });
      } catch {
        animations.length = 0;
      } finally {
        if (!cancelled && ref.current === container) {
          container.style.visibility = "visible";
        }
      }
    })();

    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.stop());
    };
  });

  return { ref };
}

export function StaggerReveal({
  children,
  as = "div",
  id,
  className,
}: StaggerRevealProps): ReactElement {
  const { ref } = useStaggerReveal();
  return createElement(
    as,
    {
      ref,
      id,
      className: [
        stylex.props(styles.hidden).className,
        className ?? "",
      ].join(" "),
    },
    children,
  );
}

export type StaggerRevealHeadlineTag = "h1" | "h2" | "h3";

export interface StaggerRevealHeadlineProps {
  children: string;
  as?: StaggerRevealHeadlineTag;
  ariaLabel?: string;
  className?: string;
  id?: string;
}

export function StaggerRevealHeadline({
  children,
  as = "h1",
  ariaLabel,
  className,
  id,
}: StaggerRevealHeadlineProps): ReactElement {
  return createElement(
    as,
    {
      id,
      className,
      "aria-label": ariaLabel ?? children,
      [HEADLINE_ATTR]: "",
    },
    children,
  );
}

export type StaggerRevealItemTag =
  | "div"
  | "p"
  | "span"
  | "ul"
  | "section"
  | "figure";

export interface StaggerRevealItemProps {
  children: ReactNode;
  as?: StaggerRevealItemTag;
  className?: string;
  id?: string;
}

export function StaggerRevealItem({
  children,
  as = "div",
  className,
  id,
}: StaggerRevealItemProps): ReactElement {
  return createElement(
    as,
    {
      id,
      className,
      [ITEM_ATTR]: "",
    },
    children,
  );
}
