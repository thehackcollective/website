import { animate, inView } from "motion";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";

import { useMountEffect } from "@/lib/use-mount-effect";

export interface CountUpProps {
  value: string;
  className?: string;
}

export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useMountEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    const match = value.match(/^(\D*)([\d,]+)(\D*)$/);
    if (!match) return;

    const [, prefix, digits, suffix] = match;
    const hasComma = digits.includes(",");
    const target = parseInt(digits.replace(/,/g, ""), 10);

    let controls: ReturnType<typeof animate> | undefined;

    const stopInView = inView(
      el,
      () => {
        controls = animate(0, target, {
          duration: 1.4,
          ease: [0.33, 1, 0.68, 1],
          onUpdate: (n) => {
            el.textContent =
              prefix +
              (hasComma
                ? Math.round(n).toLocaleString("en-GB")
                : String(Math.round(n))) +
              suffix;
          },
        });
        stopInView();
      },
      { amount: 0.15 },
    );

    return () => {
      stopInView();
      controls?.stop();
    };
  });

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
