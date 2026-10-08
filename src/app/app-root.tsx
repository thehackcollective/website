import { LazyMotion, domAnimation } from "motion/react";
import { Outlet } from "react-router";

import { AgentationToolbar } from "@/app/agentation";
import { SmoothScroll } from "@/app/smooth-scroll";

export function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <SmoothScroll>
        <Outlet />
        <AgentationToolbar />
      </SmoothScroll>
    </LazyMotion>
  );
}
