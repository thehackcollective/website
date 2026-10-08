"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type ReactNode } from "react";

import { useSmoothScroll } from "@/components/lenis-provider";

gsap.registerPlugin(ScrollTrigger);

export function GsapProvider({ children }: { children: ReactNode }) {
  const lenis = useSmoothScroll();

  useEffect(() => {
    if (!lenis) return;

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
  }, [lenis]);

  return <>{children}</>;
}
