import { resolve } from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VitePluginBrowserSync from 'vite-plugin-browser-sync'


// https://vitejs.dev/config/
export default defineConfig({
  assetsDir: ['public'],
  outDir: './',
  // base: '/',
  base: '/xfollowers',
  plugins: [
    vue({
      template: {
        
      },
    }),
    VitePluginBrowserSync()
  ],
  resolve: {
    alias: [
      {
        // '@': resolve(__dirname, '/src'),
        find: '@',
        replacement: '/src',
      }
    ]
  },
  build: {
    rollupOptions: {
      input: '/src/main.js',
      output: {
        entryFileNames: `assets/js/[name].js`,
        chunkFileNames: `assets/js/[name].js`,
        assetFileNames: `assets/[ext]/[name].[ext]`,
      },
    },
  },
  configureServer: app => {
    app.use(
      require("sass").middleware({
        src: __dirname,
        dest: __dirname,
        outputStyle: "compressed",
        prefix: "/",
      })
    );
  },
});
