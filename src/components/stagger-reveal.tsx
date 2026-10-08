"use client";

import { animate } from "motion";
import { splitText } from "motion-plus";
import {
  createElement,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";

const LINE_CLASS = "stagger-line";
const WORD_CLASS = "stagger-word";
const HEADLINE_ATTR = "data-stagger-headline";
const ITEM_ATTR = "data-stagger-item";

const HEADLINE_RISE_FROM = "translateY(0.4em)";
const HEADLINE_RISE_TO = "translateY(0em)";
const ENTER_BLUR_FROM = "blur(4px)";
const ENTER_BLUR_TO = "blur(0px)";

const GENTLE_TRANSITION = { stiffness: 110, damping: 20 };
const UI_TRANSITION = { stiffness: 305, damping: 33 };
const STAGGER_RELAXED = 0.15;
const STAGGER_BASE = 0.08;
const TRAVEL_ENTER = 24;

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

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const headlineEl = container.querySelector<HTMLElement>(
      `[${HEADLINE_ATTR}]`,
    );
    if (!headlineEl) return;

    const animations: Array<ReturnType<typeof animate>> = [];
    let cancelled = false;

    container.style.visibility = "hidden";

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
        });

        lines.forEach((line) => {
          line.style.display = "block";
          line
            .querySelectorAll<HTMLElement>(`.${WORD_CLASS}`)
            .forEach((word) => {
              word.style.display = "inline-block";
            });
        });

        const followers = Array.from(
          container.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`),
        );

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reduceMotion) return;

        let delay = 0;
        const gentleOpacity = {
          ...GENTLE_TRANSITION,
          ease: "easeIn" as const,
        };

        lines.forEach((line) => {
          animations.push(
            animate(
              line,
              {
                opacity: [0, 1],
                transform: [HEADLINE_RISE_FROM, HEADLINE_RISE_TO],
                filter: [ENTER_BLUR_FROM, ENTER_BLUR_TO],
              },
              { ...GENTLE_TRANSITION, delay, opacity: gentleOpacity },
            ),
          );
          delay += STAGGER_RELAXED;
        });

        if (lines.length > 0) {
          delay += STAGGER_RELAXED * 2;
        }

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
        // fail open
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
  }, []);

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
      ref: ref as Ref<HTMLElement>,
      id,
      className,
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
