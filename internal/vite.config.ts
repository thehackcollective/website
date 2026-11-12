import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cloudflare } from '@cloudflare/vite-plugin'
import stylex from '@stylexjs/unplugin'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const workRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(workRoot, '..')
const releaseBuildId = String(Date.now())
const buildIdOf = (command: 'build' | 'serve') => (command === 'serve' ? 'dev' : releaseBuildId)

function versionManifest(build: string): Plugin {
  return {
    name: 'work-version-manifest',
    apply: 'build',
    generateBundle() {
      if (this.environment.name !== 'client') return
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build }) })
    },
  }
}

export default defineConfig(({ mode, command }) => ({
  root: workRoot,
  publicDir: path.resolve(workRoot, 'public'),
  envDir: repoRoot,
  envPrefix: ['VITE_', 'CLERK_PUBLISHABLE_KEY'],
  define: { __BUILD_ID__: JSON.stringify(buildIdOf(command)) },
  clearScreen: false,
  plugins: [
    cloudflare({ inspectorPort: 9281 }),
    versionManifest(buildIdOf(command)),
    react(),
    stylex.vite({
      dev: mode === 'development',
      useCSSLayers: { before: ['base'] },
      cssInjectionTarget: (fileName: string) => /(^|\/)index-[^/]*\.css$/.test(fileName),
      aliases: {
        '@internal/*': path.resolve(repoRoot, 'internal/*'),
        '@/ui/*': path.resolve(repoRoot, 'src/components/ui/*'),
        '@/*': path.resolve(repoRoot, 'src/*'),
      },
      unstable_moduleResolution: { type: 'commonJS', rootDir: repoRoot },
    }),
  ],
  resolve: {
    alias: [
      { find: '@internal', replacement: path.resolve(repoRoot, 'internal') },
      { find: '@/ui', replacement: path.resolve(repoRoot, 'src/components/ui') },
      { find: '@', replacement: path.resolve(repoRoot, 'src') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'es2022',
  },
}))
