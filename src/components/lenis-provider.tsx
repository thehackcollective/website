"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduceMotion = useReducedMotion();

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

export function useSmoothScroll() {
  return useLenis();
}
