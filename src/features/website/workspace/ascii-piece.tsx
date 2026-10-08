import * as stylex from "@stylexjs/stylex";
import { inView } from "motion";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";

import { useMountEffect } from "@/lib/use-mount-effect";
import { asciiPieceStyles } from "@/features/website/workspace/ascii-piece.stylex";
import { renderFrame } from "@/features/website/workspace/ascii-piece-render";

const GRID_COLS = 100;
const GRID_ROWS = 50;
const REST_ANGLE = 0.5;
const SPIN_SPEED = 0.5;

export function AsciiPiece() {
  const ref = useRef<HTMLPreElement>(null);
  const reduceMotion = useReducedMotion();

  useMountEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    let raf = 0;
    let running = false;
    let last = 0;
    let angle = REST_ANGLE;

    const tick = (now: number) => {
      angle += ((now - last) / 1000) * SPIN_SPEED;
      last = now;
      el.textContent = renderFrame(angle, GRID_COLS, GRID_ROWS);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    const stopInView = inView(
      el,
      () => {
        if (!document.hidden) start();
        return () => stop();
      },
      { amount: 0.1 },
    );
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopInView();
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  });

  return (
    <div
      role="img"
      aria-label="The Hack Collective mark, drawn as a spinning ASCII puzzle piece"
      {...stylex.props(asciiPieceStyles.frame)}
    >
      <pre ref={ref} aria-hidden="true" {...stylex.props(asciiPieceStyles.pre)}>
        {renderFrame(REST_ANGLE, GRID_COLS, GRID_ROWS)}
      </pre>
    </div>
  );
}
