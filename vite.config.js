import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 开发环境：将 /api、/public 请求代理到本地 Go 后端
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true
      },
      '/public': {
        target: process.env.BACKEND_URL || 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
