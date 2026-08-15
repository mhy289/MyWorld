import axios from 'axios';

// 后端 API 基础路径：
// - 开发环境：走 vite proxy（vite.config.js 中 /api -> http://localhost:8080）
// - 生产环境：同源部署（Go 后端托管前端静态文件）或通过 VITE_API_BASE_URL 指定
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// 项目后端统一请求实例（baseURL 以 /api 为前缀，调用时无需再拼 /api）
export const request = axios.create({
  baseURL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：可在此统一加 token / 时间戳等
request.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 响应拦截器：
// - 成功：直接返回 response.data，调用方拿到的是业务数据（如 B 站 { code, data } 或投票 JSON）
// - 失败：统一提取错误信息后 reject，调用方用 try/catch 处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.message || '请求失败';
    if (error.response) {
      message = error.response.data?.message || error.response.data?.error || `HTTP ${error.response.status}`;
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试';
    } else if (error.request) {
      message = '无法连接服务器';
    }
    // 静默失败：是否弹提示由调用方决定，这里只附加 message 便于使用
    error.message = message;
    return Promise.reject(error);
  }
);

// 原始 axios：供第三方公开 API（天气 / 一言 / IP）使用
export default axios;
