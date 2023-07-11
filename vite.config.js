// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

const outDir = resolve(__dirname, 'dist')
const root = resolve(__dirname, "src")

export default defineConfig({
  root,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        lobby: resolve(root, 'lobby.html'),
      },
    },
  }
})
