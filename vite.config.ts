import path, { resolve } from 'node:path'

import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// https://github.com/qmhc/vite-plugin-dts
import dtsPlugin from 'vite-plugin-dts'

import * as pkg from './package.json'

const externals = [
  ...Object.keys(pkg.peerDependencies || {}),
]
export default defineConfig({
  plugins: [
    dtsPlugin(),
    Vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true,
    }),

  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd'],
      name: 'change-name',
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: externals,
      output: {
        format: 'esm',
      },
    },
  },
})