import * as stylex from "@stylexjs/stylex";

import { HackSection } from "@/features/website/workspace/hack-section";
import { HeroSection } from "@/features/website/workspace/hero-section";
import { JoinSection } from "@/features/website/workspace/join-section";
import { SiteNav } from "@/features/website/workspace/site-nav";
import { StatsSection } from "@/features/website/workspace/stats-section";
import { pageStyles } from "@/features/website/workspace/view.stylex";

export function View() {
  return (
    <div {...stylex.props(pageStyles.page)}>
      <SiteNav />
      <HeroSection />
      <div {...stylex.props(pageStyles.rail)}>
        <HackSection />
        <StatsSection />
        <JoinSection />
      </div>
    </div>
  );
}
