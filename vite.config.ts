import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const isWeb = mode === 'web' || process.env.TUNE_TARGET === 'web';

  return {
    server: {
      host: true,
      port: 5173
    },
    plugins: [
      react(),
      !isWeb && electron({
        main: {
          entry: 'src/main/index.ts',
          vite: {
            build: {
              outDir: 'dist-electron',
              rollupOptions: {
                external: ['music-metadata', 'chokidar', 'discord-rpc'],
                output: {
                  format: 'cjs',
                  entryFileNames: 'main.cjs'
                }
              }
            }
          }
        },
        preload: {
          input: path.join(__dirname, 'src/preload/index.ts'),
          vite: {
            build: {
              outDir: 'dist-electron',
              rollupOptions: {
                output: {
                  format: 'cjs',
                  entryFileNames: 'preload.cjs'
                }
              }
            }
          }
        },
        renderer: {}
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});
