import { useCallback, useState } from 'react'
import { ApiError } from '@/lib/api-error'
import { useMountEffect } from '@/lib/use-mount-effect'

export function useApiResource<T>(
  fetcher: () => Promise<T>,
  apply: (data: T) => void,
  failMessage: string,
) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryable, setRetryable] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      apply(await fetcher())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : failMessage)
      setRetryable(!(err instanceof ApiError) || err.retryable)
    } finally {
      setIsLoading(false)
    }
  }, [fetcher, apply, failMessage])

  useMountEffect(() => {
    void load()
  })

  return { isLoading, error, retryable, reload: load }
}
