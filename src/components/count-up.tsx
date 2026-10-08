"use client";

import gsap from "gsap";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

export interface CountUpProps {
  value: string;
  className?: string;
}

export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    const match = value.match(/^(\D*)([\d,]+)(\D*)$/);
    if (!match) return;

    const [, prefix, digits, suffix] = match;
    const hasComma = digits.includes(",");
    const target = parseInt(digits.replace(/,/g, ""), 10);
    const obj = { n: 0 };

    const tween = gsap.fromTo(
      obj,
      { n: 0 },
      {
        n: target,
        duration: 1.4,
        ease: "power2.out",
        snap: { n: 1 },
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          const formatted = hasComma
            ? Math.round(obj.n).toLocaleString("en-GB")
            : String(Math.round(obj.n));
          el.textContent = prefix + formatted + suffix;
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
