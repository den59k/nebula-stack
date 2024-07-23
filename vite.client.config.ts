import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteSvgPlugin from './scripts/viteSvgPlugin'

const serverUrl = "http://127.0.0.1:9000"
// https://vitejs.dev/config/
export default defineConfig({
  root: "src/client",
  plugins: [vue(), viteSvgPlugin()],
  server: {
    proxy: {
      "^/api/(?!.*[.]ts).*$": serverUrl,
      "/uploads": serverUrl
    }
  },
  build: {
    outDir: path.join(__dirname, "./dist/client"),
    emptyOutDir: true,
  }
})
