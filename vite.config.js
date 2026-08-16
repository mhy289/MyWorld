import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 读取 .env 文件中的 VITE_BACKEND_URL，命令行 BACKEND_URL 优先级更高
  const env = loadEnv(mode, process.cwd(), '')
  const backendURL = process.env.BACKEND_URL || env.VITE_BACKEND_URL || 'http://localhost:8080'
  return {
    plugins: [vue()],
    server: {
      proxy: {
        // 开发环境：将 /api、/public 请求代理到本地 Go 后端
        '/api': {
          target: backendURL,
          changeOrigin: true
        },
        '/public': {
          target: backendURL,
          changeOrigin: true
        }
      }
    }
  }
})
