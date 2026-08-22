import axios from 'axios';

// ===== 部署模式（主控开关，通过 .env 配置）=====
// VITE_API_MODE=same-origin（默认）：前后端同服务器/同域名部署，所有请求走 /api/*
// VITE_API_MODE=separate：前后端分离部署，所有请求走 /public/*（跨域）
// 兼容旧开关：未设置 VITE_API_MODE 时，由 VITE_ENABLE_LOCAL_API 推断
//   （true → same-origin，false → separate）

const backendURL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

function parseBool(value, defaultValue = true) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return !['false', '0', 'no', 'off', 'disabled'].includes(String(value).trim().toLowerCase());
}

const modeRaw = (import.meta.env.VITE_API_MODE || '').trim().toLowerCase();
const separate =
  modeRaw === 'separate' || modeRaw === 'public'
    ? true
    : modeRaw === 'same-origin' || modeRaw === 'local'
      ? false
      : !parseBool(import.meta.env.VITE_ENABLE_LOCAL_API);

// 当前部署模式：same-origin 走 /api/*；separate 走 /public/*
export const API_MODE = separate ? 'separate' : 'same-origin';

// 统一请求实例 base URL：
// - same-origin：默认同源 /api（或显式 VITE_API_BASE_URL / VITE_BACKEND_URL）
// - separate：VITE_PUBLIC_API_BASE_URL（后端域名，默认同源空串）
const baseURL = separate
  ? (import.meta.env.VITE_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '')
  : (import.meta.env.VITE_API_BASE_URL || (backendURL ? `${backendURL}/api` : '/api'));

// 业务路径前缀：分离部署为 /public，同源部署为空（base 已含 /api）
export const API_PATH_PREFIX = separate ? '/public' : '';

// 附加错误信息并返回 reject（静默失败，是否弹提示由调用方决定）
function attachErrorMessage(error) {
  if (error.response) {
    const message = error.response.data?.message || error.response.data?.error || '';
    error.message = `${error.message}${message ? `: ${message}` : ''}`;
  }
  return Promise.reject(error);
}

// 响应拦截器：成功时直接返回 response.data，调用方拿到的是业务数据
function attachResponseInterceptor(instance) {
  instance.interceptors.response.use(
    (response) => response.data,
    attachErrorMessage
  );
}

// 统一业务请求实例：所有对后端（Go 服务）的调用都走它，
// 同源部署与分离部署共用，仅 baseURL / 路径前缀不同
export const apiRequest = axios.create({
  baseURL,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' }
});
attachResponseInterceptor(apiRequest);

// 通用请求实例：baseURL 与 apiRequest 相同，供历史调用方使用
// （WeatherCard / IpCard 等请求第三方公开 API 时会传入完整 URL，baseURL 被忽略）
export const request = axios.create({
  baseURL,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' }
});
attachResponseInterceptor(request);

// 原始 axios：供第三方公开 API（天气 / 一言 / IP）使用
export default axios;
