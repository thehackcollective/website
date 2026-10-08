import { animate } from "motion";
import * as stylex from "@stylexjs/stylex";
import {
  DIA_FOLLOWER_DELAY,
  armDiaSweep,
  finishDia,
  playDiaSweep,
  splitDiaHeadline,
} from "@/components/ui/dia-text";
import { useMountEffect } from "@/lib/use-mount-effect";

import {
  createElement,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";

const HEADLINE_ATTR = "data-stagger-headline";
const ITEM_ATTR = "data-stagger-item";

const ENTER_BLUR_FROM = "blur(4px)";
const ENTER_BLUR_TO = "blur(0px)";

const UI_TRANSITION = { stiffness: 305, damping: 33 };
const STAGGER_BASE = 0.08;
const TRAVEL_ENTER = 24;

const styles = stylex.create({
  hidden: {
    visibility: "hidden",
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

        const { lines, chars } = splitDiaHeadline(headlineEl);

        const followers = Array.from(
          container.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`),
        );

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reduceMotion) {
          finishDia(chars);
          return;
        }

        armDiaSweep(headlineEl, lines);
        animations.push(playDiaSweep(headlineEl, chars));

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
