import * as stylex from "@stylexjs/stylex";
import { LazyMotion, domAnimation } from "motion/react";

import { color, layout } from "@/tokens/token-consts.stylex";
import { AgentationToolbar } from "@/components/agentation";
import { GsapProvider } from "@/components/gsap-provider";
import { LenisProvider } from "@/components/lenis-provider";
import { SiteNav } from "@/components/site-nav";
import { HeroSection } from "@/components/hero-section";
import { StatsSection } from "@/components/stats-section";
import { PartnersSection } from "@/components/partners-section";
import { JoinSection } from "@/components/join-section";

const pageStyles = stylex.create({
  page: {
    backgroundColor: color.canvas,
    minHeight: "100dvh",
  },
  rail: {
    backgroundColor: color.surfaceCard,
    borderLeftColor: color.hairlineStrong,
    borderLeftStyle: "solid",
    borderLeftWidth: "1px",
    borderRightColor: color.hairlineStrong,
    borderRightStyle: "solid",
    borderRightWidth: "1px",
    marginInline: "auto",
    maxWidth: layout.containerWide,
    position: "relative",
    width: "100%",
  },
  divider: {
    borderTopColor: color.hairlineStrong,
    borderTopStyle: "solid",
    borderTopWidth: "1px",
  },
});

export function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <LenisProvider>
        <GsapProvider>
        <div {...stylex.props(pageStyles.page)}>
          <SiteNav />
          <HeroSection />
          <div {...stylex.props(pageStyles.rail)}>
            <div {...stylex.props(pageStyles.divider)}>
              <StatsSection />
            </div>
            <div {...stylex.props(pageStyles.divider)}>
              <PartnersSection />
            </div>
            <div {...stylex.props(pageStyles.divider)}>
              <JoinSection />
            </div>
          </div>
          <AgentationToolbar />
        </div>
        </GsapProvider>
      </LenisProvider>
    </LazyMotion>
  );
}
