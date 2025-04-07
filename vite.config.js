import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 让 `@` 解析到 `src` 目录
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 你的后端服务器地址
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api') // 可选，保持路径
      }
    }
  }
});