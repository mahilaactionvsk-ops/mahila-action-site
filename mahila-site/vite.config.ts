import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { BASE_PATH } from './src/config/site'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  // GitHub Pages project sites are served from /<repo-name>/, not the domain
  // root, so the PRODUCTION build needs that prefix on every asset URL and
  // in the router's basename. Local dev (`npm run dev`) always serves at
  // "/" instead — if this used BASE_PATH in dev too, the app would only be
  // reachable at http://localhost:5173/<repo-name>/, and visiting plain
  // http://localhost:5173/ would leave the router's basename mismatched
  // with the real URL, which is what makes nav clicks silently fail to
  // update the address bar. Keep BASE_PATH itself in sync with your repo
  // name in src/config/site.ts — that's the only place you should need to
  // edit when the repo name changes.
  base: command === 'serve' ? '/' : BASE_PATH,
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // Helps Core Web Vitals: inline only truly tiny assets, ship the rest as
    // real cacheable files with content hashes.
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
  },
}))
