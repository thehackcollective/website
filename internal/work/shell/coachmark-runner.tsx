import { useMember } from '@internal/work/features/auth'
import { coachmarkSteps } from '@internal/work/features/catalog'
import { railPageAt } from '@internal/work/shell/nav-items'
import { useState } from 'react'
import { useLocation } from 'react-router'
import { readStored, writeStored } from '@/lib/stored'
import { useMountEffect } from '@/lib/use-mount-effect'
import { Coachmark, type CoachmarkStep, type CoachmarkTarget } from '@/ui/coachmark'

const anchorWaitMs = 4000
const settleMs = 700

function found(steps: readonly CoachmarkStep[]): CoachmarkTarget[] {
  return steps.flatMap((step) => {
    const element = document.querySelector<HTMLElement>(
      `[data-coachmark="${CSS.escape(step.anchor)}"]`,
    )
    if (element === null) return []
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return []
    return [{ element, title: step.title, body: step.body }]
  })
}

function waitForAnchors(
  steps: readonly CoachmarkStep[],
  ready: (targets: readonly CoachmarkTarget[]) => void,
): () => void {
  let timer = 0
  const finish = (targets: readonly CoachmarkTarget[]) => {
    observer.disconnect()
    window.clearTimeout(timer)
    ready(targets)
  }
  const check = () => {
    const targets = found(steps)
    if (targets.length === steps.length) finish(targets)
  }
  const observer = new MutationObserver(check)
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-coachmark'],
    childList: true,
    subtree: true,
  })
  timer = window.setTimeout(() => finish(found(steps)), anchorWaitMs)
  check()
  return () => {
    observer.disconnect()
    window.clearTimeout(timer)
  }
}

function PageCoachmarks({ page, scope }: { page: string; scope: string }) {
  const [targets, setTargets] = useState<readonly CoachmarkTarget[] | null>(null)
  const [closed, setClosed] = useState(false)
  useMountEffect(() => {
    if (readStored('coachmarkSeen', scope) !== null) return
    let live = true
    let stop: () => void = () => undefined
    void coachmarkSteps().then((pages) => {
      const steps = pages[page] ?? []
      if (!live || steps.length === 0) return
      stop = waitForAnchors(steps, (ready) => {
        if (!live || ready.length === 0) return
        const settle = window.setTimeout(() => {
          const settled = found(steps)
          if (!live || settled.length === 0) return
          setTargets(settled)
        }, settleMs)
        stop = () => window.clearTimeout(settle)
      })
    })
    return () => {
      live = false
      stop()
    }
  })
  if (targets === null || closed) return null
  return (
    <Coachmark
      targets={targets}
      onClose={() => {
        writeStored('coachmarkSeen', '1', scope)
        setClosed(true)
      }}
      onDone={() => writeStored('coachmarkSeen', '1', scope)}
    />
  )
}

export function CoachmarkRunner() {
  const member = useMember()
  const { pathname } = useLocation()
  const page = railPageAt(pathname)
  if (member === null || page === null) return null
  const scope = `${member.id}:${page.id}`
  return <PageCoachmarks key={scope} page={page.id} scope={scope} />
}
