import axios from 'axios';

// ===== 环境变量读取（部署时通过 .env 文件填入）=====
// 1. VITE_BACKEND_URL       后端链接：本地后端根地址（不带 /api），如 http://localhost:8080
//                           - 设置后，本地接口 base = VITE_BACKEND_URL + /api
//                           - 开发环境同时作为 vite proxy 的转发目标（见 vite.config.js）
//                           - 留空：生产默认同源（/api），开发默认走 proxy 到 localhost:8080
// 2. VITE_API_BASE_URL      本地接口 base URL（可选，设置了则优先于 VITE_BACKEND_URL）
// 3. VITE_PUBLIC_API_BASE_URL 对外接口 base URL（可选，默认同源 /public/*）
// 4. VITE_ENABLE_LOCAL_API  本地接口开关（默认 true）
// 5. VITE_ENABLE_PUBLIC_API 对外接口开关（默认 true）
const backendURL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
const baseURL = import.meta.env.VITE_API_BASE_URL || (backendURL ? `${backendURL}/api` : '/api');
const publicBaseURL = import.meta.env.VITE_PUBLIC_API_BASE_URL || '';

// 布尔开关解析：'false' / '0' / 'no' / 'off' 视为关闭，其余（含空/未设置）为默认值
function parseBool(value, defaultValue = true) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return !['false', '0', 'no', 'off', 'disabled'].includes(String(value).trim().toLowerCase());
}

// 本地接口开关：false 时跳过本地 /api/* 请求，数据全部从对外接口获取
export const LOCAL_API_ENABLED = parseBool(import.meta.env.VITE_ENABLE_LOCAL_API);
// 对外接口开关：false 时本地连不上也不回退，保持原始错误
export const PUBLIC_API_ENABLED = parseBool(import.meta.env.VITE_ENABLE_PUBLIC_API);

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
// 开关控制：
// - 本地接口开关关闭（VITE_ENABLE_LOCAL_API=false）：跳过本地请求，直接走对外接口
// - 对外接口开关关闭（VITE_ENABLE_PUBLIC_API=false）：本地连不上时也不回退
export async function withFallback(primary, fallback, options = {}) {
  const { localEnabled = LOCAL_API_ENABLED, publicEnabled = PUBLIC_API_ENABLED } = options;
  // 本地接口关闭：直接使用对外接口
  if (!localEnabled) {
    if (!publicEnabled) {
      throw new Error('本地接口与对外接口均已关闭，无法请求数据');
    }
    return await fallback();
  }
  try {
    return await primary();
  } catch (err) {
    // 后端在线但返回业务错误（4xx/5xx），或对外接口开关关闭：不回退
    if (err.response || !publicEnabled) throw err;
    return await fallback();
  }
}

// 原始 axios：供第三方公开 API（天气 / 一言 / IP）使用
export default axios;
