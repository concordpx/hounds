import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

import nodePolyfills from 'rollup-plugin-polyfill-node';

const MODE = process.env.NODE_ENV
const development = MODE === 'development'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    development &&
    nodePolyfills({
      include: [
        'node_modules/**/*.js',
        new RegExp('node_modules/.vite/.*js')
      ],
      http: true,
      crypto: true,
      global: true
    })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert'
    },
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills({ crypto: true, http: true, global: true })]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
