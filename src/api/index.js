import { request, publicRequest, withFallback } from './request';

// 业务 API 统一入口：所有对后端（Go 服务）的调用都在这里定义
// 注：request 的 baseURL 已带 /api 前缀；publicRequest 路径带 /public 前缀
//
// 回退策略：本地接口（/api/*）连不上时自动回退到对外公开接口（/public/*）
// - 投票为写操作，对外接口为只读，无回退版本，连不上时保持原有错误提示

// 健康检查
export const getHealth = () =>
  withFallback(
    () => request.get('/health', { timeout: 3000 }),
    () => publicRequest.get('/public/health', { timeout: 3000 })
  );

// 投票系统
export const getVotes = () =>
  withFallback(
    () => request.get('/votes'),
    // 对外统计返回 { data: votes }，归一化为 votes 本体
    () => publicRequest.get('/public/stats/votes').then((res) => res?.data ?? res)
  );

// 写操作：仅本地接口提供，对外为只读，不回退
export const submitVote = (option) => request.post('/vote', { option }, { timeout: 3000 });

// B站用户视频（后端代理，对外接口与本地返回格式一致）
export const getUserVideos = (mid) =>
  withFallback(
    () => request.get('/bilibili/user/videos', { params: { mid } }),
    () => publicRequest.get('/public/bilibili/videos', { params: { mid } })
  );
