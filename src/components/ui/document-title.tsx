import { useMountEffect } from '@/lib/use-mount-effect'

export function DocumentTitle({ title }: { title: string }) {
  useMountEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  })
  return null
}
