import { request } from './request';

// 业务 API 统一入口：所有对后端（Go 服务）的调用都在这里定义
// 注：request 的 baseURL 已带 /api 前缀，路径无需再写 /api

// 健康检查
export const getHealth = () => request.get('/health', { timeout: 3000 });

// 投票系统
export const getVotes = () => request.get('/votes');
export const submitVote = (option) => request.post('/vote', { option }, { timeout: 3000 });

// B站用户视频（后端代理）
export const getUserVideos = (mid) => request.get('/bilibili/user/videos', { params: { mid } });
