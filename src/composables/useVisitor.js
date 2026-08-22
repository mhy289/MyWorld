// 访客统计工具：数据存 localStorage，按日期累计
import { reportVisitor } from '../api';

export const VISIT_STORAGE_KEY = 'visitor_history';

// 后端上报节流：同一访客在间隔内只上报一次，防止短时间反复刷新刷出异常记录
const REPORT_KEY = 'visitor_report_time';
const REPORT_INTERVAL_MS = 10 * 60 * 1000; // 10 分钟

export const getDateStr = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 迁移旧数据：早期版本用 visitor_count 存储总访问数
export const migrateVisitorData = () => {
  const oldTotal = localStorage.getItem('visitor_count');
  if (oldTotal && !localStorage.getItem(VISIT_STORAGE_KEY)) {
    const history = {};
    history[getDateStr(new Date())] = parseInt(oldTotal) || 0;
    localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(history));
    localStorage.removeItem('visitor_count');
  }
};

// 读取按天记录的访客历史：{ '2026-08-13': 5, ... }
export const getVisitorHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(VISIT_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

// 历史总访问数
export const getVisitorTotal = () =>
  Object.values(getVisitorHistory()).reduce((sum, n) => sum + (Number(n) || 0), 0);

// 记录一次访问（当天 +1），返回最新 history
export const recordVisit = () => {
  migrateVisitorData();
  const history = getVisitorHistory();
  const today = getDateStr(new Date());
  history[today] = (Number(history[today]) || 0) + 1;
  localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(history));
  return history;
};

// 获取公网 IP（失败返回空串，不影响上报流程）
const fetchPublicIP = async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    const data = await res.json();
    return data.ip || '';
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
};

// 全局访客上报（带节流）：短时间重复访问不重复上报
export const maybeReportVisitor = async () => {
  const now = Date.now();
  const last = Number(localStorage.getItem(REPORT_KEY) || 0);
  if (now - last < REPORT_INTERVAL_MS) return false;

  // 先标记时间戳，避免并发/重复触发
  localStorage.setItem(REPORT_KEY, String(now));

  try {
    const ip = await fetchPublicIP();
    await reportVisitor({
      ip,
      domain: location.hostname,
      time: new Date().toISOString()
    });
    return true;
  } catch {
    // 上报失败：回退时间戳，下次访问再试
    localStorage.removeItem(REPORT_KEY);
    return false;
  }
};
