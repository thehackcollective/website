import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { useMountEffect } from "@/lib/use-mount-effect";

gsap.registerPlugin(ScrollTrigger);

type LenisInstance = NonNullable<ReturnType<typeof useLenis>>;

function ScrollTriggerBridge({ lenis }: { lenis: LenisInstance }) {
  useMountEffect(() => {
    const onScroll = () => ScrollTrigger.update();
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
    };
  });

  return null;
}

function LenisGate() {
  const lenis = useLenis();
  return lenis ? <ScrollTriggerBridge lenis={lenis} /> : null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: false, anchors: true }}>
      <LenisGate />
      {children}
    </ReactLenis>
  );
}
