"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lenis smooth scroll provider.
 *
 * Mirrors the cf0.ai setup: ReactLenis as a root instance with autoRaf
 * disabled, driven by a requestAnimationFrame loop. This keeps the smooth
 * scroll and Motion animations on the same render loop and lets any
 * component access the Lenis instance via useSmoothScroll().
 *
 * Lenis docs:
 * - https://github.com/darkroomengineering/lenis?tab=readme-ov-file#react
 * - https://github.com/darkroomengineering/lenis?tab=readme-ov-file#options
 */
function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    let rafId = 0;

    function tick(time: number) {
      lenisRef.current?.lenis?.raf(time);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: false, anchors: true }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}

export function LenisProvider({ children }: { children: ReactNode }) {
  return <SmoothScroll>{children}</SmoothScroll>;
}

/** Access the active Lenis instance for programmatic smooth scrolling. */
export function useSmoothScroll() {
  return useLenis();
}
