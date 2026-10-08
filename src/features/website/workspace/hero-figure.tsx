import * as stylex from "@stylexjs/stylex";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";

import { heroFigureStyles } from "@/features/website/workspace/hero-figure.stylex";
import { MEANS, RANGE, TOUR, mount } from "@/lib/hairline-assemble.js";
import { HL } from "@/lib/hairline-kernel.js";
import { useMountEffect } from "@/lib/use-mount-effect";

export function HeroFigure() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useMountEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    HL.inject(document);
    stage.setAttribute("data-hairline", "assemble");
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    const read = { textContent: "" };
    const handle = mount({ stage, svg, read }, RANGE[1]);
    const lap = reduceMotion ? null : HL.tour(stage, TOUR, () => {});
    return () => {
      lap?.stop();
      handle.destroy();
      svg.remove();
    };
  });

  return <div ref={ref} role="img" aria-label={MEANS} {...stylex.props(heroFigureStyles.stage)} />;
}
