// 访客统计工具：数据存 localStorage，按日期累计
export const VISIT_STORAGE_KEY = 'visitor_history';

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
