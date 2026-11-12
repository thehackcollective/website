import { fetchBuildId } from '@internal/work/version-api'
import { useMountEffect } from '@/lib/use-mount-effect'
import { showNewVersion } from '@/ui/refresh-toast'

const firstCheckMs = 5_000
const checkEveryMs = 60_000

export function useNewVersion() {
  useMountEffect(() => {
    if (__BUILD_ID__ === 'dev') return
    let shown = false
    let stopped = false
    let every: number | undefined
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check()
    }
    const stop = () => {
      stopped = true
      window.clearTimeout(first)
      window.clearInterval(every)
      document.removeEventListener('visibilitychange', onVisible)
    }
    const check = async () => {
      if (stopped || shown) return
      const build = await fetchBuildId()
      if (stopped || shown || build === null || build === __BUILD_ID__) return
      shown = true
      stop()
      showNewVersion()
    }
    const first = window.setTimeout(() => {
      void check()
      every = window.setInterval(() => void check(), checkEveryMs)
    }, firstCheckMs)
    document.addEventListener('visibilitychange', onVisible)
    return stop
  })
}
