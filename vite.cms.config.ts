import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteSvgPlugin from './scripts/viteSvgPlugin'

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/cms",
  plugins: [vue(), viteSvgPlugin()],
  build: {
    outDir: path.join(__dirname, "./dist/cms"),
    emptyOutDir: true,
  }
})
