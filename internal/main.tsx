import { workRouter } from '@internal/work/router'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '@/tokens/fonts.css'
import '@/tokens/design-tokens.css'
import '@/tokens/semantic-tokens.css'
import '@/tokens/component-tokens.css'
import '@/tokens/webapp-globals.css'
import { applyFontWeight } from '@/lib/font-weight'
import { Toaster } from '@/ui/sonner'

applyFontWeight()

const root = document.getElementById('root')
if (!root) throw new Error('internal/index.html has no #root element')

createRoot(root).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <RouterProvider router={workRouter} />
        <Toaster />
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
)
