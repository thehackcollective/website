import * as stylex from '@stylexjs/stylex'

import { navStyles } from '@/features/website/workspace/site-nav.stylex'
import { buttonStyles } from '@/features/website/workspace/button.stylex'
import { LINKS } from '@/features/website/workspace/content'

export function SiteNav() {
  return (
    <header {...stylex.props(navStyles.navbar)}>
      <svg aria-hidden="true" style={{ display: 'none' }}>
        <filter id="nav-glass-distortion" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.03"
            numOctaves={1}
            seed={17}
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div {...stylex.props(navStyles.navBody)}>
        <div {...stylex.props(navStyles.bar)}>
          <a href="/" {...stylex.props(navStyles.wordmark)} aria-label="The Hack Collective home">
            <img
              src="/brand/icon.svg"
              alt=""
              width={32}
              height={32}
              {...stylex.props(navStyles.wordmarkLogo)}
            />
            <span {...stylex.props(navStyles.wordmarkText)}>
              The Hack Collective
            </span>
          </a>

          <div {...stylex.props(navStyles.actions)}>
            <a
              href={LINKS.luma}
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(buttonStyles.buttonBase, buttonStyles.buttonPrimary)}
            >
              Follow our Luma calendar
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
