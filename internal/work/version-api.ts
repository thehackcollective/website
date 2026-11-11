export async function fetchBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?_=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    const body: unknown = await res.json()
    if (typeof body !== 'object' || body === null || !('build' in body)) return null
    return typeof body.build === 'string' ? body.build : null
  } catch {
    return null
  }
}
