export function copyText(value: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || navigator.clipboard === undefined)
    return Promise.resolve(false)
  return navigator.clipboard.writeText(value).then(
    () => true,
    () => false,
  )
}
