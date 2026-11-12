import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

export function bundleClient(file: string, minify: boolean): string {
  const args = ['build', join(import.meta.dirname, file), '--target=browser']
  if (minify) args.push('--minify')
  const built = spawnSync('bun', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (built.status !== 0) throw new Error(`bun build ${file} failed.\n${built.stderr}`)
  if (built.stdout.trim() === '') throw new Error(`bun build ${file} has no output.`)
  return built.stdout
}
