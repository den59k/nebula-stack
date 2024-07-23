import { defineConfig } from 'vite'
import pkg from './package.json';
import builtins from 'builtin-modules'
import { join } from 'path';

export default defineConfig((env) => {
  return {
    plugins: [],
    // root: join(process.cwd(), getRoot(env.mode)),
    build: {
      target: "node18",
      minify: false,
      sourcemap: true,
      lib: {
        entry: {
          "app": "src/backend/index.ts",
        },
        formats: [ "es" ], 
        name: "app",
      },
      modulePreload: {
        polyfill: false
      },
      ssr: true,
      rollupOptions: {
        output: {
          chunkFileNames: "[name].cjs"
        },
        external: [
          ...Object.keys(pkg.dependencies),
          /^node:/,
          ...builtins
        ]
      },
      outDir: join(__dirname, "dist/backend"),
      emptyOutDir: true
    },
  }
})