import axios from 'axios';

// 后端 API 基础路径：
// - 开发环境：走 vite proxy（vite.config.js 中 /api -> http://localhost:8080）
// - 生产环境：同源部署（Go 后端托管前端静态文件）或通过 VITE_API_BASE_URL 指定
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// 对外公开接口基础路径：
// - 默认同源（''），即请求当前站点下的 /public/*
// - 后端异地部署时，通过 VITE_PUBLIC_API_BASE_URL 指定完整地址，如 https://api.example.com
const publicBaseURL = import.meta.env.VITE_PUBLIC_API_BASE_URL || '';

// 附加错误信息并返回 reject（静默失败，是否弹提示由调用方决定）
function attachErrorMessage(error) {
  let message = error.message || '请求失败';
  if (error.response) {
    message = error.response.data?.message || error.response.data?.error || `HTTP ${error.response.status}`;
  } else if (error.code === 'ECONNABORTED') {
    message = '请求超时，请稍后重试';
  } else if (error.request) {
    message = '无法连接服务器';
  }
  error.message = message;
  return Promise.reject(error);
}

// 响应拦截器：成功时直接返回 response.data，调用方拿到的是业务数据
function attachResponseInterceptor(instance) {
  instance.interceptors.response.use(
    (response) => response.data,
    attachErrorMessage
  );
}

// 项目后端统一请求实例（baseURL 以 /api 为前缀，调用时无需再拼 /api）
export const request = axios.create({
  baseURL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 对外公开接口请求实例（只读接口，路径带 /public 前缀）
export const publicRequest = axios.create({
  baseURL: publicBaseURL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json'
  }
});

attachResponseInterceptor(request);
attachResponseInterceptor(publicRequest);

// 回退策略：优先请求本地接口，仅当「连不上」时回退到对外公开接口。
// - error.response 存在 => 后端在线但返回了业务错误（4xx/5xx），不回退，保留原始错误
// - error.response 不存在（网络错误 / 超时）=> 后端连不上，回退到对外接口
// - fallback 返回 Promise（可含归一化逻辑）
export async function withFallback(primary, fallback) {
  try {
    return await primary();
  } catch (err) {
    if (err.response) throw err;
    return await fallback();
  }
}

// 原始 axios：供第三方公开 API（天气 / 一言 / IP）使用
export default axios;
